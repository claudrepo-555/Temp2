import axios from 'axios'

export async function fetchCISAKEV(limit = 20) {
  try {
    const { data } = await axios.get(
      '/api/cisa/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      { timeout: 10000 }
    )

    const vulns = (data?.vulnerabilities || [])
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, limit)

    return vulns.map((v) => ({
      id: `cisa-${v.cveID}`,
      threadId: `cisa-${v.cveID}`,
      isPrimary: true,
      title: `CISA KEV: ${v.cveID} – ${v.vulnerabilityName}`,
      summary: `${v.shortDescription} Required action: ${v.requiredAction} (Due: ${v.dueDate})`,
      source: { name: 'CISA KEV', type: 'advisory', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
      publishedAt: new Date(v.dateAdded).getTime(),
      severity: 'critical',
      category: 'Zero-Day',
      cves: [v.cveID],
      tags: [v.vendorProject, v.product, 'CISA KEV', 'Actively Exploited'].filter(Boolean),
      isRead: false,
      isStarred: false,
    }))
  } catch {
    return []
  }
}
