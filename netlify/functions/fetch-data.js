export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const messages = body.messages
    const model = body.model || 'gpt-5-mini'
    if (!messages) return { statusCode: 400, body: 'messages required' }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return { statusCode: 500, body: 'OPENAI_API_KEY not set' }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages })
    })

    const text = await res.text()
    return { statusCode: res.status, body: text }
  } catch (err) {
    return { statusCode: 500, body: String(err) }
  }
}