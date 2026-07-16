import { loadPlaces } from '@/api/place'
import { readCommunityPosts } from '@/utils/community'
import type { PlaceRecord } from '@/types/place'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function getModel(): string {
  return import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-5-mini'
}

function summarizePlaces(places: PlaceRecord[], limit = 8): string {
  if (!places.length) return '현재 로드된 장소 데이터가 없습니다.'
  return places
    .slice(0, limit)
    .map((p) => {
      const addr = p.address || '주소 없음'
      const district = p.district || '구 정보 없음'
      return `- ${p.title} | ${p.typeLabel} | ${district} | ${addr}`
    })
    .join('\n')
}

function summarizeByType(places: PlaceRecord[], type = 'food', limit = 6): string {
  const filtered = places.filter((p) => (p.type || '').toLowerCase() === type.toLowerCase())
  if (!filtered.length) return `해당 유형(${type})의 데이터가 없습니다.`
  return filtered
    .slice(0, limit)
    .map((p) => {
      const addr = p.address || '주소 없음'
      const district = p.district || '구 정보 없음'
      return `- ${p.title} | ${p.typeLabel} | ${district} | ${addr}`
    })
    .join('\n')
}

function summarizeCommunity(posts: any[], limit = 6): string {
  if (!posts.length) return '현재 커뮤니티 게시글이 없습니다.'
  return posts.slice(0, limit).map((s: any) => `- ${s.title} | ${String(s.content).slice(0, 80)}`).join('\n')
}

async function attemptFetch(input: RequestInfo, init: RequestInit, retries = 2) {
  let lastErr: unknown = null
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(input, init)
      return res
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 300 * (i + 1)))
    }
  }
  throw lastErr
}

export async function sendChatbotMessage(userMessage: string, history: ChatMessage[]): Promise<string> {
  try {
    const [placesResult, posts] = await Promise.all([
      loadPlaces().catch(() => ({ items: [], loadedFiles: [], total: 0 })),
      Promise.resolve(readCommunityPosts())
    ])

    const systemPrompt = `
당신은 LocalHub의 지역 정보 챗봇입니다.
사용자의 질문에 대해 다음 데이터만 바탕으로 친절하게 한국어로 답변하세요.
- 제공된 관광지/문화시설/쇼핑/여행코스/맛집 데이터
- 커뮤니티 게시글 데이터
- 데이터에 없는 정보는 "제공된 데이터 기준으로는 확인되지 않습니다"라고 말하세요.
`.trim()

    const recentHistory = history.slice(-4)
    const placesSummary = summarizePlaces(placesResult.items, 8)
    const foodSummary = summarizeByType(placesResult.items, 'food', 6)
    const communitySummary = summarizeCommunity(posts, 6)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      {
        role: 'user',
        content: `
사용자 질문:
${userMessage}

[로드된 파일 목록]
${placesResult.loadedFiles.join(', ') || '없음'}

[간략 장소 요약 (최대 8개)]
${placesSummary}

[간략 맛집 요약 (최대 6개)]
${foodSummary}

[간략 커뮤니티 요약]
${communitySummary}
`.trim()
      }
    ]

    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: getModel(), messages })
    }

    const endpoint = '/.netlify/functions/fetch-data'
    const res = await attemptFetch(endpoint, init, 2)
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`프록시 호출 실패: ${res.status} ${txt}`)
    }
    const data = await res.json()
    const answer = data?.choices?.[0]?.message?.content?.trim()
    return answer || '응답을 생성하지 못했습니다.'
  } catch (err) {
    console.error(err)
    return err instanceof Error ? `챗봇 요청 중 오류가 발생했습니다: ${err.message}` : '챗봇 요청 중 오류가 발생했습니다.'
  }
}