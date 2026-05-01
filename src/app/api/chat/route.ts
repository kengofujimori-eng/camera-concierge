import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToDify } from '@/lib/dify'
import { findMentionedLenses, buildLensContext, buildDiscontinuedContext } from '@/lib/lensContext'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = (await req.json()) as {
      message: string
      conversationId?: string
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 })
    }

    // 廃盤レンズリストを常時注入（推薦禁止リストとして）
    const discontinuedContext = buildDiscontinuedContext()

    // メッセージ中に言及されているレンズを検出し、価格・レビューリンクをコンテキストとして注入
    const mentionedLenses = findMentionedLenses(message)
    const lensContext     = buildLensContext(mentionedLenses)

    const enrichedMessage = [discontinuedContext, lensContext, message]
      .filter(Boolean)
      .join('\n\n')

    const result = await sendMessageToDify(enrichedMessage, conversationId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'チャットの送信に失敗しました' },
      { status: 500 },
    )
  }
}
