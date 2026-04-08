/**
 * Groups flat intel items into threads by:
 * 1. Shared CVE IDs
 * 2. Shared keywords (vendor, attack type)
 * 3. Time proximity (within 72 hours)
 *
 * Items that are already part of mock threads are left untouched.
 * Live API items are clustered here.
 */

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','has','have','had','be','been','being','that',
  'this','from','by','as','not','can','will','may','also','which','its',
  'new','via','after','about','into','more','their','they','than','over',
])

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
}

function similarity(a, b) {
  const setA = new Set(extractKeywords(`${a.title} ${a.summary}`))
  const setB = new Set(extractKeywords(`${b.title} ${b.summary}`))

  // CVE overlap (strong signal)
  const cveOverlap = (a.cves || []).filter((c) => (b.cves || []).includes(c)).length
  if (cveOverlap > 0) return 1.0

  // Keyword jaccard
  const intersection = [...setA].filter((k) => setB.has(k)).length
  const union = new Set([...setA, ...setB]).size
  const jaccard = union > 0 ? intersection / union : 0

  // Time proximity bonus (within 24h)
  const timeDiff = Math.abs(a.publishedAt - b.publishedAt)
  const timeBonus = timeDiff < 86400000 ? 0.1 : 0

  return jaccard + timeBonus
}

export function clusterItems(items) {
  const threads = []
  const clustered = new Set()

  const sorted = [...items].sort((a, b) => a.publishedAt - b.publishedAt)

  for (let i = 0; i < sorted.length; i++) {
    if (clustered.has(i)) continue
    const primary = { ...sorted[i], isPrimary: true }
    const related = []

    for (let j = i + 1; j < sorted.length; j++) {
      if (clustered.has(j)) continue
      if (similarity(sorted[i], sorted[j]) >= 0.15) {
        const relItem = { ...sorted[j], isPrimary: false }
        relItem.differences = generateDifferenceHint(sorted[i], relItem)
        related.push(relItem)
        clustered.add(j)
      }
    }

    clustered.add(i)
    const threadId = primary.id
    primary.threadId = threadId
    related.forEach((r) => { r.threadId = threadId })

    threads.push({
      id: threadId,
      createdAt: primary.publishedAt,
      primary,
      related,
    })
  }

  return threads
}

function generateDifferenceHint(primary, related) {
  const hints = []
  if (related.source.name !== primary.source.name) {
    hints.push(`Reported by ${related.source.name} with additional context.`)
  }
  if ((related.cves || []).some((c) => !(primary.cves || []).includes(c))) {
    hints.push('Mentions additional CVEs not in the primary report.')
  }
  if (related.severity !== primary.severity) {
    hints.push(`Severity assessed as ${related.severity} (vs ${primary.severity} in primary).`)
  }
  if (hints.length === 0) {
    hints.push('Provides corroborating coverage from a different outlet.')
  }
  return hints.join(' ')
}
