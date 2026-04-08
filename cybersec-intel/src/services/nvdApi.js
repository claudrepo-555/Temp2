import axios from 'axios'

const SEVERITY_MAP = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'info',
}

function cvssToSeverity(cvssScore) {
  if (cvssScore >= 9.0) return 'critical'
  if (cvssScore >= 7.0) return 'high'
  if (cvssScore >= 4.0) return 'medium'
  if (cvssScore > 0) return 'low'
  return 'info'
}

function transformCve(cveItem) {
  const id = cveItem.cve?.id || 'Unknown'
  const descriptions = cveItem.cve?.descriptions || []
  const enDesc = descriptions.find((d) => d.lang === 'en')?.value || 'No description available.'

  const metrics = cveItem.cve?.metrics || {}
  let severity = 'info'
  let cvssScore = null

  const cvssV31 = metrics.cvssMetricV31?.[0]?.cvssData
  const cvssV30 = metrics.cvssMetricV30?.[0]?.cvssData
  const cvssV2 = metrics.cvssMetricV2?.[0]?.cvssData

  if (cvssV31) {
    cvssScore = cvssV31.baseScore
    severity = cvssToSeverity(cvssScore)
  } else if (cvssV30) {
    cvssScore = cvssV30.baseScore
    severity = cvssToSeverity(cvssScore)
  } else if (cvssV2) {
    cvssScore = cvssV2.baseScore
    severity = cvssToSeverity(cvssScore)
  }

  const cisaExploited = cveItem.cve?.cisaExploitAdd ? true : false
  const references = cveItem.cve?.references || []
  const cpes = cveItem.cve?.configurations?.[0]?.nodes?.[0]?.cpeMatch || []
  const vendors = [...new Set(cpes.map((c) => c.criteria?.split(':')[3]).filter(Boolean))]

  const publishedAt = new Date(cveItem.cve?.published || Date.now())

  return {
    id: `nvd-${id}`,
    threadId: `nvd-${id}`,
    isPrimary: true,
    title: `${id} – ${enDesc.slice(0, 80)}${enDesc.length > 80 ? '…' : ''}`,
    summary: enDesc,
    source: {
      name: 'NVD / NIST',
      type: 'advisory',
      url: `https://nvd.nist.gov/vuln/detail/${id}`,
    },
    publishedAt: publishedAt.getTime(),
    severity,
    category: 'CVE',
    cves: [id],
    cvssScore,
    tags: [
      ...vendors.slice(0, 4),
      cisaExploited ? 'CISA KEV' : null,
      severity === 'critical' ? 'Critical' : null,
    ].filter(Boolean),
    isRead: false,
    isStarred: false,
  }
}

export async function fetchRecentCVEs(daysBack = 7, maxResults = 20) {
  const end = new Date()
  const start = new Date(Date.now() - daysBack * 86400000)
  const fmt = (d) => d.toISOString().split('.')[0] + '.000'

  const url = `/api/nvd/rest/json/cves/2.0?pubStartDate=${fmt(start)}&pubEndDate=${fmt(end)}&resultsPerPage=${maxResults}&cvssV3Severity=CRITICAL`

  try {
    const { data } = await axios.get(url, { timeout: 10000 })
    const items = data?.vulnerabilities || []
    return items.map(transformCve).filter((item) => item.severity === 'critical' || item.severity === 'high')
  } catch {
    return []
  }
}
