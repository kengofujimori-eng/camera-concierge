import { DifyResponse } from '@/types'

const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1'
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''

const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendMessageToDify(
  message: string,
  conversationId?: string,
): Promise<{ answer: string; conversationId: string }> {
  const body: Record<string, unknown> = {
    inputs: {},
    query: message,
    response_mode: 'blocking',
    user: 'camera-concierge-user',
  }

  if (conversationId) {
    body.conversation_id = conversationId
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // 指数バックオフ: 1.5s → 3s → 6s
      await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1))
    }

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const data = (await response.json()) as DifyResponse
      return {
        answer: data.answer,
        conversationId: data.conversation_id,
      }
    }

    const errorText = await response.text()
    lastError = new Error(`Dify API error: ${response.status} - ${errorText}`)

    // Difyは下流モデルの503を400でラップして返す場合がある
    // レスポンス本文に503/UNAVAILABLE/high demandが含まれていればリトライ対象
    const isDownstreamUnavailable =
      errorText.includes('503') ||
      errorText.includes('UNAVAILABLE') ||
      errorText.includes('high demand') ||
      errorText.includes('Connection Error')

    const retryable =
      response.status === 503 ||
      response.status === 500 ||
      response.status === 429 ||
      (response.status === 400 && isDownstreamUnavailable)

    if (!retryable || attempt === MAX_RETRIES) {
      throw lastError
    }

    console.warn(`Dify API ${response.status} (attempt ${attempt + 1}/${MAX_RETRIES}), retrying...`)
  }

  throw lastError ?? new Error('Dify API: unexpected error')
}
