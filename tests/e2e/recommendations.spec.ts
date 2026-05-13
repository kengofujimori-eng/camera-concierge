import { expect, test, type Page } from '@playwright/test'

type RecommendationCase = {
  name: string
  mountId: string
  mountOptionTestId: string
  selectedMountText: string
  prompt: string
  answer: string
  forbiddenText: RegExp[]
  expectedCardNames?: string[]
}

const cases: RecommendationCase[] = [
  {
    name: 'Canon RF 標準ズーム',
    mountId: 'canon-rf',
    mountOptionTestId: 'mount-option-canon-rf',
    selectedMountText: 'Canon RF',
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
    mountOptionTestId: 'mount-option-nikon-z-ff',
    selectedMountText: 'Nikon Z',
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
    mountOptionTestId: 'mount-option-fuji-x',
    selectedMountText: 'Fujifilm X',
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
  {
    name: 'Sony E フルサイズ 50mm前後単焦点',
    mountId: 'sony-e-ff',
    mountOptionTestId: 'mount-option-sony-e-ff',
    selectedMountText: 'Sony E',
    prompt:
      'Sony Eマウントのフルサイズ機で、子供撮影とポートレートに使う50mm前後の単焦点レンズを探しています。AF性能とコスパを重視します。',
    answer: [
      'Sony Eフルサイズで50mm前後の単焦点候補です。',
      '',
      '【選択肢1】FE 50mm F1.4 GM',
      'おすすめ理由：AF性能と描写のバランスが高く、子供撮影とポートレートの両方に使いやすいです。',
      '',
      '【選択肢2】FE 50mm F1.8',
      'おすすめ理由：価格を抑えた50mm入門候補として選びやすいです。',
      '',
      '【選択肢3】Sigma 50mm F1.4 DG DN Art',
      'おすすめ理由：Sony Eで使える大口径標準単焦点で、描写と価格のバランスが良い候補です。',
    ].join('\n'),
    forbiddenText: [/Canon RF/i, /Nikon Z/i, /Fujifilm X/i, /RF-S/i],
  },
  {
    name: 'Sony E フルサイズ 標準ズーム',
    mountId: 'sony-e-ff',
    mountOptionTestId: 'mount-option-sony-e-ff',
    selectedMountText: 'Sony E',
    prompt:
      'Sony Eマウントのフルサイズ機で、旅行と子供撮影に使いやすい標準ズームを探しています。AF性能、携帯性、コスパのバランスを重視します。',
    answer: [
      'Sony Eフルサイズで使いやすい標準ズーム候補です。',
      '',
      '【選択肢1】Tamron 28-75mm F/2.8 Di III VXD G2',
      'おすすめ理由：軽さとF2.8通し、価格のバランスが良く、旅行と子供撮影に使いやすいです。',
      '',
      '【選択肢2】Sigma 28-70mm F2.8 DG DN Contemporary',
      'おすすめ理由：小型軽量で日常・旅行に向いたF2.8標準ズームです。',
      '',
      '【選択肢3】FE 24-70mm F2.8 GM II',
      'おすすめ理由：予算が許せばAFと描写の総合力が高い純正候補です。',
    ].join('\n'),
    forbiddenText: [/Canon RF/i, /Nikon Z/i, /Fujifilm X/i, /RF-S/i],
  },
  {
    name: 'Sony E 室内子供撮影 35〜55mm単焦点',
    mountId: 'sony-e-ff',
    mountOptionTestId: 'mount-option-sony-e-ff',
    selectedMountText: 'Sony E',
    prompt:
      'Sony Eマウントのフルサイズ機で、室内の子供撮影に使う35〜55mmの単焦点レンズを探しています。明るさとAF性能を重視します。',
    answer: [
      'Sony Eフルサイズで、室内の子供撮影に向いた35〜55mm単焦点候補です。',
      '',
      '【選択肢1】FE 35mm F1.4 GM',
      'おすすめ理由：明るさ、AF性能、画角の扱いやすさのバランスが高く、室内で動く子供を撮りやすい本命候補です。',
      '注意点：価格は高めですが、35mm重視なら満足度が高いです。',
      '',
      '【選択肢2】FE 50mm F1.4 GM',
      'おすすめ理由：AF性能と描写のバランスが良く、少し寄った子供撮影やポートレートにも使いやすい標準単焦点です。',
      '注意点：室内が狭い場合は35mmより距離を取りにくい場面があります。',
      '',
      '【選択肢3】FE 35mm F1.8',
      'おすすめ理由：軽量でAFも扱いやすく、室内・日常撮影で負担が少ない現実的な候補です。',
      '注意点：明るさと描写の余裕はF1.4 GMに譲ります。',
    ].join('\n'),
    forbiddenText: [/Canon RF/i, /Nikon Z/i, /Fujifilm X/i, /RF-S/i],
    expectedCardNames: ['FE 35mm F1.4 GM', 'FE 50mm F1.4 GM', 'FE 35mm F1.8'],
  },
]

async function openChatWithMount(page: Page, testCase: RecommendationCase) {
  await page.addInitScript(() => {
    localStorage.clear()
  })

  await page.goto('/')
  const selectedMountDisplay = page.getByTestId('selected-mount-display')
  const mountOption = page.getByTestId(testCase.mountOptionTestId)

  await expect(selectedMountDisplay).toBeVisible()

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await selectedMountDisplay.click()

    await expect(mountOption).toBeVisible()
    await mountOption.click()

    try {
      await expect(selectedMountDisplay).toContainText(testCase.selectedMountText, { timeout: 3_000 })
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('selectedMountId')))
        .toBe(testCase.mountId)
      return
    } catch (error) {
      if (attempt === 1) throw error
    }
  }
}

async function enterPrompt(page: Page, prompt: string) {
  const input = page.getByTestId('chat-input')
  await input.click()
  await input.fill('')
  await page.keyboard.insertText(prompt)
  await expect(input).toHaveValue(prompt)
}

async function getSendState(page: Page) {
  return page.evaluate(() => {
    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="chat-input"]')
    const sendButton = document.querySelector<HTMLButtonElement>('[data-testid="chat-send-button"]')
    const selectedMount = document.querySelector<HTMLElement>('[data-testid="selected-mount-display"]')

    return {
      inputValue: input?.value ?? null,
      inputLength: input?.value.length ?? 0,
      sendButtonDisabled: sendButton?.disabled ?? null,
      selectedMountText: selectedMount?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    }
  })
}

async function waitForSendEnabled(page: Page) {
  await expect
    .poll(() => getSendState(page), {
      message: 'chat send button should become enabled after mount selection and prompt input',
    })
    .toEqual(expect.objectContaining({ sendButtonDisabled: false }))
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
            conversationId: `mock-${testCase.name}`,
          }),
        })
      })

      await openChatWithMount(page, testCase)

      const sendButton = page.getByTestId('chat-send-button')
      await enterPrompt(page, testCase.prompt)
      await waitForSendEnabled(page)
      await sendButton.click()

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
      const cardCount = await cards.count()
      expect(cardCount).toBeGreaterThan(0)

      if (testCase.expectedCardNames) {
        expect(cardCount).toBe(testCase.expectedCardNames.length)
        for (const expectedName of testCase.expectedCardNames) {
          await expect(cards.filter({ hasText: expectedName })).toHaveCount(1)
        }
        await expect(page.getByText('AIが選んだ理由を見る')).toHaveCount(testCase.expectedCardNames.length)
      }

      const imageCount = await page.getByTestId('lens-card-image').count()
      const priceCount = await page.getByTestId('price-badge').count()
      const placeholderCount = await page.getByTestId('lens-card-placeholder').count()
      expect(placeholderCount).toBeLessThan(cardCount)
      expect(imageCount + priceCount).toBeGreaterThan(0)

      if (testCase.expectedCardNames) {
        expect(imageCount).toBe(testCase.expectedCardNames.length)
        expect(priceCount).toBeGreaterThanOrEqual(testCase.expectedCardNames.length)
      }

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
