import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToDify } from '@/lib/dify'
import { findMentionedLenses, buildLensContext } from '@/lib/lensContext'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = (await req.json()) as {
      message: string
      conversationId?: string
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 })
    }

    // メッセージ中に言及されているレンズを検出し、価格・レビューリンクをコンテキストとして注入
    // レンズが見つからない場合はそのまま送信
    const mentionedLenses = findMentionedLenses(message)
    const context         = buildLensContext(mentionedLenses)
    const enrichedMessage = context ? `${context}\n\n${message}` : message

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
