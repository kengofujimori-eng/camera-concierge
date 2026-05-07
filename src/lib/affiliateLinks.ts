/**
 * affiliateLinks.ts
 * アフィリエイトURL設定を一元管理するユーティリティ
 *
 * ★ IDを取得したら下記の定数を更新するだけで全箇所に反映されます ★
 */

// ─── アフィリエイト設定 ─────────────────────────────────────────────────────────

/** Amazon アソシエイトタグ */
const AMAZON_TAG = 'techddd-22'

/**
 * 楽天アフィリエイト ID パス
 * hb.afl.rakuten.co.jp/ichiba/{RAKUTEN_AFFILIATE_ID}/?pc={url} の形式
 * 提供されたリンクから抽出: 51601423.47aa5b1c.51601424.fa5e20d7
 */
const RAKUTEN_AFFILIATE_ID = '51601423.47aa5b1c.51601424.fa5e20d7'

/**
 * Yahoo ショッピングアフィリエイト (Yahoo独自方式)
 * URLに ?sc_e=af_ys_aflink を付与するだけでOK。
 * Yahoo側に登録済みドメイン (techddd.com) でトラッキングされる。
 * true = アフィリエイトパラメータを付与する
 */
const YAHOO_AFFILIATE_ENABLED = true

/**
 * キタムラ A8.net mat コード
 * 提供されたリンクから抽出: a8mat=4B1N9L+CONHRM+2O9U+BW8O2
 */
const KITAMURA_A8_MAT = '4B1N9L+CONHRM+2O9U+BW8O2'

// ─── URL 生成関数 ───────────────────────────────────────────────────────────────

/**
 * Amazon URL にアフィリエイトタグを付与する
 * - amazon.co.jp の URL であれば tag パラメータを上書き/追加
 * - 検索クエリから URL を生成する場合は generateAmazonSearchUrl を使用
 */
export function withAmazonTag(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes('amazon.co.jp') || u.hostname.includes('amazon.com')) {
      u.searchParams.set('tag', AMAZON_TAG)
      return u.toString()
    }
  } catch {
    // URL パース失敗時はそのまま返す
  }
  return url
}

/** Amazon 検索URL を生成（アフィリエイトタグ付き） */
export function generateAmazonSearchUrl(query: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`
}

/**
 * 楽天 検索URL を生成
 * RAKUTEN_AFFILIATE_ID が設定されていればアフィリエイト経由リンクを返す
 */
export function generateRakutenSearchUrl(query: string, directUrl?: string): string {
  const target = directUrl ?? `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(query)}/`
  if (!RAKUTEN_AFFILIATE_ID) return target
  return `https://hb.afl.rakuten.co.jp/ichiba/${RAKUTEN_AFFILIATE_ID}/?pc=${encodeURIComponent(target)}&link_type=text`
}

/**
 * Yahoo ショッピング 検索URL を生成
 * Yahoo独自アフィリエイト方式: sc_e=af_ys_aflink を付与するだけでトラッキング有効
 * (URLに個別IDは含まれず、登録済みドメインでYahoo側が識別する)
 */
export function generateYahooSearchUrl(query: string, directUrl?: string): string {
  const base = directUrl ?? `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(query)}`
  if (!YAHOO_AFFILIATE_ENABLED) return base
  // 既に sc_e が付いている場合は上書きしない
  try {
    const u = new URL(base)
    if (!u.searchParams.has('sc_e')) {
      u.searchParams.set('sc_e', 'af_ys_aflink')
    }
    return u.toString()
  } catch {
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}sc_e=af_ys_aflink`
  }
}

/**
 * キタムラ 中古検索URL を生成
 * A8.net 経由リンク: a8mat=4B1N9L+CONHRM+2O9U+BW8O2
 */
export function generateKitamuraUrl(query: string, directUrl?: string): string {
  const target = directUrl ?? `https://www.kitamura.jp/used/search/?q=${encodeURIComponent(query)}`
  if (!KITAMURA_A8_MAT) return target
  return `https://px.a8.net/svt/ejp?a8mat=${encodeURIComponent(KITAMURA_A8_MAT)}&a8ejpredirect=${encodeURIComponent(target)}`
}

// ─── ショッピングリンク一括生成 ─────────────────────────────────────────────────

export interface ShoppingLinks {
  new: { label: string; url: string }[]
  used: { label: string; url: string }[]
}

export interface PurchaseLinksInput {
  new?: { amazon?: string; rakuten?: string; yahoo?: string } | null
  used?: { kitamura?: string; mapcamera?: string } | null
}

/**
 * レンズ名からフォールバック用ショッピングリンクセットを生成
 */
export function generateFallbackShoppingLinks(lensName: string): ShoppingLinks {
  return {
    new: [
      { label: '🛒 Amazon', url: generateAmazonSearchUrl(lensName) },
      { label: '🔴 楽天',   url: generateRakutenSearchUrl(lensName) },
      { label: '🟡 Yahoo',  url: generateYahooSearchUrl(lensName) },
    ],
    used: [
      { label: '🗺️ キタムラ', url: generateKitamuraUrl(lensName) },
    ],
  }
}

/**
 * lens_data.json の purchase_links に含まれる個別URLにアフィリエイトを付与する
 */
export function applyAffiliateToLinks(purchaseLinks: PurchaseLinksInput): ShoppingLinks {
  const newLinks: { label: string; url: string }[] = []
  const usedLinks: { label: string; url: string }[] = []

  if (purchaseLinks.new?.amazon)  newLinks.push({ label: '🛒 Amazon', url: withAmazonTag(purchaseLinks.new.amazon) })
  if (purchaseLinks.new?.rakuten) newLinks.push({ label: '🔴 楽天',   url: generateRakutenSearchUrl('', purchaseLinks.new.rakuten) })
  if (purchaseLinks.new?.yahoo)   newLinks.push({ label: '🟡 Yahoo',  url: generateYahooSearchUrl('', purchaseLinks.new.yahoo) })

  if (purchaseLinks.used?.kitamura)  usedLinks.push({ label: '🗺️ キタムラ', url: generateKitamuraUrl('', purchaseLinks.used.kitamura) })
  if (purchaseLinks.used?.mapcamera) usedLinks.push({ label: '📸 MapCamera', url: purchaseLinks.used.mapcamera })

  return { new: newLinks, used: usedLinks }
}
