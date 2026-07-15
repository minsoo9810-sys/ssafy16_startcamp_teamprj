import { loadPlaces } from '@/api/place'
import type { CommunityPost } from '@/types/community'
import type { PlaceRecord } from '@/types/place'
import { readCommunityPosts } from '@/utils/community'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function getApiKey(): string {
  return import.meta.env.VITE_OPENAI_API_KEY?.trim() || ''
}

function getModel(): string {
  return import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-5-mini'
}

function summarizePlaces(places: PlaceRecord[]): string {
  if (!places.length) {
    return '현재 로드된 관광지 데이터가 없습니다.'
  }

  return places
    .slice(0, 20)
    .map((place) => {
      const addr = place.address || '주소 없음'
      const district = place.district || '구 정보 없음'
      return `- ${place.title} | ${place.typeLabel} | ${district} | ${addr}`
    })
    .join('\n')
}

function summarizeCommunity(posts: CommunityPost[]): string {
  if (!posts.length) {
    return '현재 커뮤니티 게시글이 없습니다.'
  }

  return posts
    .slice(0, 10)
    .map((post) => {
      return `- ${post.title} | ${post.content.slice(0, 80)}`
    })
    .join('\n')
}

export async function sendChatbotMessage(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = getApiKey()

  if (!apiKey) {
    return 'OpenAI API 키가 설정되지 않았습니다. .env 파일의 VITE_OPENAI_API_KEY를 입력해주세요.'
  }

  try {
    const [placesResult, posts] = await Promise.all([
      loadPlaces().catch(() => ({ items: [], loadedFiles: [], total: 0 })),
      Promise.resolve(readCommunityPosts())
    ])

    const systemPrompt = `
당신은 LocalHub의 지역 정보 챗봇입니다.
사용자의 질문에 대해 다음 데이터만 바탕으로 친절하게 한국어로 답변하세요.
- 제공된 관광지/문화시설/쇼핑/코스 데이터
- 커뮤니티 게시글 데이터
- 답변은 짧고 실용적으로, 필요하면 3개 이하의 bullet point로 정리하세요.
- 데이터에 없는 정보는 "제공된 데이터 기준으로는 확인되지 않습니다"라고 말하세요.
- 주민/관광객 관점의 추천형 답변을 우선하세요.
`.trim()

    const recentHistory = history.slice(-8)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content
      })),
      {
        role: 'user',
        content: `
사용자 질문:
${userMessage}

[관광지 데이터 요약]
${summarizePlaces(placesResult.items)}

[커뮤니티 데이터 요약]
${summarizeCommunity(posts)}
`.trim()
      }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: getModel(),
        messages
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenAI 호출 실패: ${response.status} ${errText}`)
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const answer = data.choices?.[0]?.message?.content?.trim()

    return answer || '응답을 생성하지 못했습니다.'
  } catch (error) {
    console.error(error)
    return error instanceof Error
      ? `챗봇 요청 중 오류가 발생했습니다: ${error.message}`
      : '챗봇 요청 중 오류가 발생했습니다.'
  }
}