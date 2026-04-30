import { NextRequest, NextResponse } from 'next/server'

interface UnsplashPhoto {
  urls: { small: string; regular: string }
  alt_description: string | null
  links: { html: string }
}

interface UnsplashSearchResult {
  results: UnsplashPhoto[]
}

function getLensUseCase(lensName: string): string {
  const name = lensName.toLowerCase()
  if (
    name.includes('200') || name.includes('300') ||
    name.includes('400') || name.includes('500') ||
    name.includes('600')
  ) {
    return 'wildlife bird telephoto photography'
  }
  if (
    name.includes('85') || name.includes('135') ||
    name.includes('f1.2') || name.includes('f1.4')
  ) {
    return 'portrait photography bokeh shallow depth'
  }
  if (
    name.includes('16') || name.includes('14') ||
    name.includes('20') || name.includes('wide')
  ) {
    return 'landscape wide angle nature photography'
  }
  if (name.includes('macro') || name.includes('105')) {
    return 'macro flower insect close up photography'
  }
  if (
    name.includes('28') || name.includes('35') ||
    name.includes('50')
  ) {
    return 'street documentary everyday photography'
  }
  return 'professional photography artistic'
}

export async function GET(req: NextRequest) {
  const lens = req.nextUrl.searchParams.get('lens')
  console.log(`[lens-image] request: lens="${lens}"`)

  if (!lens) {
    return NextResponse.json({ images: [] })
  }

  const query = getLensUseCase(lens)
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`

  console.log(`[lens-image] Unsplash query: "${query}" (lens: "${lens}")`)

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    })

    console.log(`[lens-image] Unsplash status: ${res.status}`)

    if (!res.ok) {
      const body = await res.text()
      console.error(`[lens-image] Unsplash error body: ${body}`)
      return NextResponse.json({ images: [] })
    }

    const data = (await res.json()) as UnsplashSearchResult
    console.log(`[lens-image] results count: ${data.results?.length ?? 0}`)

    const images = (data.results ?? []).map((photo) => ({
      small: photo.urls.small,
      regular: photo.urls.regular,
      alt: photo.alt_description ?? lens,
      link: photo.links.html,
    }))

    console.log(`[lens-image] returning ${images.length} images for "${lens}"`)
    return NextResponse.json({ images })
  } catch (err) {
    console.error('[lens-image] unexpected error:', err)
    return NextResponse.json({ images: [] })
  }
}
