import axios from 'axios'

const FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', type: 'news' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'Bleeping Computer', type: 'news' },
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', type: 'blog' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading', type: 'news' },
  { url: 'https://www.cisa.gov/uscert/ncas/alerts.xml', source: 'CISA Alerts', type: 'advisory' },
]

const CVE_RE = /CVE-\d{4}-\d+/gi
const SEVERITY_KEYWORDS = {
  critical: ['critical', 'emergency', 'actively exploited', '0-day', 'zero-day', 'rce', 'remote code'],
  high: ['high severity', 'severe', 'dangerous', 'worm', 'ransomware', 'backdoor'],
  medium: ['medium', 'moderate', 'elevated'],
}

function guessSeverity(text) {
  const lower = text.toLowerCase()
  for (const [sev, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return sev
  }
  return 'low'
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

function guessCategory(text) {
  const lower = text.toLowerCase()
  if (lower.includes('ransomware')) return 'Ransomware'
  if (lower.includes('apt') || lower.includes('nation') || lower.includes('state-sponsored')) return 'APT'
  if (lower.includes('supply chain') || lower.includes('pypi') || lower.includes('npm')) return 'Supply Chain'
  if (/cve-\d{4}-\d+/.test(lower)) return 'Zero-Day'
  if (lower.includes('patch tuesday')) return 'Patch Tuesday'
  return 'News'
}

async function fetchFeed({ url, source, type }) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15`
  try {
    const { data } = await axios.get(apiUrl, { timeout: 8000 })
    if (data.status !== 'ok') return []

    return (data.items || []).map((item, i) => {
      const rawText = `${item.title} ${stripHtml(item.description || item.content)}`
      const cves = [...new Set((rawText.match(CVE_RE) || []).map((c) => c.toUpperCase()))]
      const cleanSummary = stripHtml(item.description || item.content).slice(0, 500)
      const severity = guessSeverity(rawText)
      const category = guessCategory(rawText)
      const pubDate = new Date(item.pubDate).getTime() || Date.now()

      return {
        id: `feed-${source.replace(/\s+/g, '')}-${i}-${pubDate}`,
        threadId: null,
        isPrimary: true,
        title: item.title || 'Untitled',
        summary: cleanSummary || 'No summary available.',
        source: { name: source, type, url: item.link },
        publishedAt: pubDate,
        severity,
        category,
        cves,
        tags: cves.slice(0, 3),
        isRead: false,
        isStarred: false,
      }
    })
  } catch {
    return []
  }
}

export async function fetchAllNewsFeeds() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed))
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
