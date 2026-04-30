import { NextRequest, NextResponse } from 'next/server'

interface FlickrPhoto {
  id: string
  url_m?: string
  url_l?: string
  owner: string
  ownername?: string
}

interface FlickrResponse {
  photos?: {
    photo?: FlickrPhoto[]
  }
}

export async function GET(req: NextRequest) {
  const lens = req.nextUrl.searchParams.get('lens') || ''
  const apiKey = process.env.FLICKR_API_KEY

  console.log('Flickr検索:', lens)

  if (!apiKey) {
    console.log('FLICKR_API_KEY未設定')
    return NextResponse.json({ photos: [] })
  }

  try {
    const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${encodeURIComponent(lens)}&sort=interestingness-desc&per_page=3&format=json&nojsoncallback=1&extras=url_m,url_l,owner_name`

    const res = await fetch(url)
    const data = (await res.json()) as FlickrResponse

    console.log('Flickrレスポンス:', JSON.stringify(data).slice(0, 200))

    if (!data.photos?.photo?.length) {
      return NextResponse.json({ photos: [] })
    }

    const photos = data.photos.photo.map((p: FlickrPhoto) => ({
      id: p.id,
      url_m: p.url_m,
      url_l: p.url_l,
      owner: p.ownername ?? p.owner,
      flickrUrl: `https://www.flickr.com/photos/${p.owner}/${p.id}`,
    }))

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Flickrエラー:', error)
    return NextResponse.json({ photos: [] })
  }
}
