import { expect, test, type Page } from '@playwright/test'

type RecommendationCase = {
  name: string
  mountId: string
  prompt: string
  answer: string
  forbiddenText: RegExp[]
}

const cases: RecommendationCase[] = [
  {
    name: 'Canon RF 標準ズーム',
    mountId: 'canon-rf',
    prompt:
      'Canon RFマウントのフルサイズ機で、旅行と子供撮影を両立できる標準ズームを探しています。予算は未設定です。AF性能、携帯性、描写のバランスを重視します。',
    answer: [
      '条件に合う候補です。',
      '',
      '【選択肢1】RF24-105mm F4L IS USM',
      'おすすめ理由：旅行と子供撮影のバランスが良く、画角の余裕があります。',
      '注意点：F2.8ズームより暗いので室内ではISOを上げる場面があります。',
      '',
      '【選択肢2】RF24-70mm F2.8L IS USM',
      'おすすめ理由：明るさとAF性能を重視する標準ズーム候補です。',
      '注意点：価格と重量はやや大きめです。',
    ].join('\n'),
    forbiddenText: [/Tamron 35-150mm/i, /DG DN/i, /Sony E/i, /Nikon Z/i],
  },
  {
    name: 'Nikon Z 35〜55mm単焦点',
    mountId: 'nikon-z-ff',
    prompt:
      'Nikon Zマウントで室内の子供撮影に使う単焦点レンズを探しています。35mm〜55mmの標準域で、明るさとAF性能を重視します。',
    answer: [
      'Nikon Zで使いやすい標準域の単焦点候補です。',
      '',
      '【選択肢1】NIKKOR Z 50mm f/1.8 S',
      'おすすめ理由：描写とAFの安定性が高く、室内の子供撮影にも使いやすいです。',
      '',
      '【選択肢2】Viltrox AF 40mm F2.5 Z',
      'おすすめ理由：軽量で室内スナップにも扱いやすい標準域です。',
    ].join('\n'),
    forbiddenText: [/Canon RF/i, /Sony E/i, /\bFE\b/i, /Fujifilm X/i],
  },
  {
    name: 'Fujifilm X 標準ズーム',
    mountId: 'fuji-x',
    prompt:
      'Fujifilm Xマウントで旅行に使いやすい標準ズームを探しています。軽さ、画質、コスパのバランスを重視します。',
    answer: [
      'Fujifilm Xで旅行に持ち出しやすい標準ズーム候補です。',
      '',
      '【選択肢1】XF16-50mmF2.8-4.8 R LM WR',
      'おすすめ理由：軽量で画質も良く、旅行用の標準ズームとして扱いやすいです。',
      '',
      '【選択肢2】Sigma 18-50mm F2.8 DC DN Contemporary [Fujifilm X]',
      'おすすめ理由：明るさと携帯性、価格のバランスが良い候補です。',
    ].join('\n'),
    forbiddenText: [/Canon RF/i, /Nikon Z/i, /Sony E/i, /\bFE\b/i],
  },
]

async function openChatWithMount(page: Page, mountId: string) {
  await page.addInitScript((id) => {
    localStorage.clear()
    localStorage.setItem('setupDone', 'true')
    localStorage.setItem('selectedMountId', id)
  }, mountId)

  await page.goto('/')
}

test.describe('recommendation smoke tests', () => {
  for (const testCase of cases) {
    test(testCase.name, async ({ page }, testInfo) => {
      const consoleErrors: string[] = []
      const pageErrors: string[] = []

      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })
      page.on('pageerror', (error) => {
        pageErrors.push(error.message)
      })

      await page.route('**/api/chat', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            answer: testCase.answer,
            conversationId: `mock-${testCase.mountId}`,
          }),
        })
      })

      await openChatWithMount(page, testCase.mountId)

      await page.getByPlaceholder('例：運動会で動く子供を撮りたい...').fill(testCase.prompt)
      await page.keyboard.press('Enter')

      const answer = page.getByTestId('assistant-answer').last()
      await expect(answer).toContainText('選択肢1')

      const answerText = await answer.innerText()
      const optionCount = (answerText.match(/選択肢\d+/g) ?? []).length
      expect(optionCount).toBeGreaterThanOrEqual(1)
      expect(optionCount).toBeLessThanOrEqual(3)
      for (const forbidden of testCase.forbiddenText) {
        expect(answerText).not.toMatch(forbidden)
      }

      const cards = page.getByTestId('lens-card')
      await expect(cards.first()).toBeVisible()
      expect(await cards.count()).toBeGreaterThan(0)

      const imageCount = await page.getByTestId('lens-card-image').count()
      const priceCount = await page.getByTestId('price-badge').count()
      expect(imageCount + priceCount).toBeGreaterThan(0)

      const crashMessages = [...consoleErrors, ...pageErrors].filter((message) =>
        /TypeError|Cannot read properties|Application error/i.test(message)
      )
      expect(crashMessages).toEqual([])

      await page.screenshot({
        path: testInfo.outputPath(`${testCase.name.replace(/[^\w\u3040-\u30ff\u4e00-\u9fff-]+/g, '_')}.png`),
        fullPage: true,
      })
    })
  }
})
