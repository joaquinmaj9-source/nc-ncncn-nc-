export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  try {
    const { query } = req.body
    if (!query) return res.status(400).json({ error: 'no query' })

    // search wikipedia
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`
    )
    const searchData = await searchRes.json()
    const title = searchData?.query?.search?.[0]?.title
    if (!title) return res.status(200).json({ found: false })

    // get summary + image
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
    const summary = await summaryRes.json()

    return res.status(200).json({
      found: true,
      title: summary.title || title,
      extract: summary.extract ? summary.extract.substring(0, 300).toLowerCase() : null,
      image: summary.thumbnail?.source || null,
      url: summary.content_urls?.desktop?.page || null,
    })
  } catch (err) {
    console.error('enrich error:', err)
    return res.status(200).json({ found: false })
  }
}
