const now = Date.now()
const h = (n) => now - n * 3600000
const d = (n) => now - n * 86400000

export const MOCK_THREADS = [
  {
    id: "thread-001",
    createdAt: h(4),
    primary: {
      id: "item-001",
      threadId: "thread-001",
      isPrimary: true,
      title: "Critical RCE in Ivanti Connect Secure - Zero-Day Actively Exploited",
      summary:
        "Ivanti has disclosed two critical zero-day vulnerabilities (CVE-2025-0282 and CVE-2025-0283) in Connect Secure and Policy Secure gateways. CVE-2025-0282 is a stack-based buffer overflow (CVSS 9.0) allowing unauthenticated remote code execution. Threat actors are actively exploiting it in the wild, with Mandiant attributing exploitation to UNC5337, a China-nexus espionage group. Over 2,000 devices globally have been compromised. Organizations are urged to run Ivanti Integrity Checker Tool (ICT) immediately and apply the Jan 22 patch.",
      source: { name: "CISA Advisory", type: "advisory", url: "#" },
      publishedAt: h(4),
      severity: "critical",
      category: "Zero-Day",
      cves: ["CVE-2025-0282", "CVE-2025-0283"],
      tags: ["Ivanti", "VPN", "RCE", "China-Nexus", "UNC5337"],
      isRead: false,
      isStarred: true,
    },
    related: [
      {
        id: "item-001b",
        threadId: "thread-001",
        isPrimary: false,
        title: "Mandiant Details UNC5337 Exploitation of Ivanti Zero-Days",
        summary:
          "Mandiant confirms the threat actor UNC5337 deployed SPAWN malware ecosystem including SPAWNANT, SPAWNMOLE, and SPAWNSNAIL on compromised Ivanti devices. The group maintained persistence by disabling Ivanti built-in security features. Mandiant notes this is the same group behind prior Ivanti CS exploitation in Jan 2024.",
        differences:
          "Mandiant attributes the campaign to a specific China-nexus actor (UNC5337) and details the SPAWN malware family used for persistence - information not in the CISA advisory.",
        source: { name: "Mandiant Blog", type: "research", url: "#" },
        publishedAt: h(3),
        severity: "critical",
        tags: ["UNC5337", "SPAWN", "Mandiant", "Persistence"],
        cves: ["CVE-2025-0282"],
      },
      {
        id: "item-001c",
        threadId: "thread-001",
        isPrimary: false,
        title: "Ivanti Patches CVE-2025-0282: What You Need to Know",
        summary:
          "Ivanti released Connect Secure 22.7R2.5 addressing both CVEs. The patch also includes mitigations against the ICT bypass techniques observed in active exploitation. Admins should factory-reset devices before patching due to observed persistence mechanisms that survive upgrades.",
        differences:
          "Provides specific patch version (22.7R2.5) and critical guidance that factory reset is required before patching - operational detail absent from initial advisory and Mandiant report.",
        source: { name: "Bleeping Computer", type: "news", url: "#" },
        publishedAt: h(2),
        severity: "high",
        tags: ["Patch", "Ivanti", "Remediation"],
        cves: ["CVE-2025-0282", "CVE-2025-0283"],
      },
    ],
  },
  {
    id: "thread-002",
    createdAt: h(18),
    primary: {
      id: "item-002",
      threadId: "thread-002",
      isPrimary: true,
      title: "ALPHV/BlackCat Ransomware Hits Change Healthcare - 100M+ Records Exposed",
      summary:
        "UnitedHealth Group subsidiary Change Healthcare suffered a devastating ransomware attack by ALPHV/BlackCat in February 2024. The breach exposed protected health information (PHI) of approximately 100 million individuals - the largest healthcare data breach in US history. The attack caused weeks of prescription processing outages across the US. ALPHV subsequently exit-scammed their affiliates after receiving a $22M ransom payment.",
      source: { name: "HHS OCR Notification", type: "advisory", url: "#" },
      publishedAt: h(18),
      severity: "critical",
      category: "Ransomware",
      cves: [],
      tags: ["ALPHV", "BlackCat", "Healthcare", "Ransomware", "PHI", "UnitedHealth"],
      isRead: true,
      isStarred: true,
    },
    related: [
      {
        id: "item-002b",
        threadId: "thread-002",
        isPrimary: false,
        title: "ALPHV Exit Scam: Affiliates Denied $22M Ransom Share",
        summary:
          "After Change Healthcare paid a $22 million ransom, ALPHV/BlackCat took the full payment and shut down their infrastructure in an apparent exit scam, denying the RaaS affiliate their cut. The affiliate subsequently threatened to release the 4TB of stolen data independently unless a second ransom was paid.",
        differences:
          "Reveals the affiliate dynamics and the unprecedented exit scam angle - the group kept ransom proceeds while an affiliate still held the stolen data, creating dual extortion risk.",
        source: { name: "Krebs on Security", type: "blog", url: "#" },
        publishedAt: h(16),
        severity: "high",
        tags: ["RaaS", "Exit Scam", "Extortion"],
        cves: [],
      },
      {
        id: "item-002c",
        threadId: "thread-002",
        isPrimary: false,
        title: "RansomHub Picks Up Where BlackCat Left Off on Change Healthcare Data",
        summary:
          "Emerging ransomware group RansomHub, believed to include former BlackCat affiliates, began listing Change Healthcare data on their leak site demanding a separate ransom. This confirms the 4TB data set was retained by the affiliate post-exit-scam.",
        differences:
          "Introduces a new threat actor (RansomHub) as a secondary extortion vector, escalating the breach beyond the initial ALPHV campaign.",
        source: { name: "Dark Reading", type: "news", url: "#" },
        publishedAt: h(14),
        severity: "high",
        tags: ["RansomHub", "Double Extortion", "Data Leak"],
        cves: [],
      },
    ],
  },
  {
    id: "thread-003",
    createdAt: d(2),
    primary: {
      id: "item-003",
      threadId: "thread-003",
      isPrimary: true,
      title: "Salt Typhoon Breaches AT&T, Verizon, T-Mobile - Wiretap Systems Compromised",
      summary:
        "Chinese state-sponsored threat actor Salt Typhoon (also known as FamousSparrow, GhostEmperor) has breached at least eight major US telecommunications providers including AT&T, Verizon, and T-Mobile. The attackers accessed lawful intercept systems mandated by CALEA, potentially compromising government surveillance capabilities. The FBI and CISA confirmed the intrusion was ongoing for months.",
      source: { name: "CISA / FBI Joint Advisory", type: "advisory", url: "#" },
      publishedAt: d(2),
      severity: "critical",
      category: "APT",
      cves: [],
      tags: ["Salt Typhoon", "China", "Telecom", "CALEA", "Wiretap", "AT&T", "Verizon"],
      isRead: false,
      isStarred: false,
    },
    related: [
      {
        id: "item-003b",
        threadId: "thread-003",
        isPrimary: false,
        title: "Salt Typhoon Used Cisco IOS XE Vulnerability as Initial Access Vector",
        summary:
          "Investigators determined Salt Typhoon exploited CVE-2023-20198 (Cisco IOS XE privilege escalation) as an initial access vector into telecom infrastructure. The group then deployed custom GhostEmperor rootkit to maintain long-term stealth persistence in carrier-grade routers.",
        differences:
          "Identifies the specific initial access vector (CVE-2023-20198) and persistence mechanism (GhostEmperor rootkit) not included in the initial advisory.",
        source: { name: "The Record", type: "news", url: "#" },
        publishedAt: d(2) + h(3),
        severity: "critical",
        tags: ["CVE-2023-20198", "Cisco", "GhostEmperor", "Rootkit"],
        cves: ["CVE-2023-20198"],
      },
      {
        id: "item-003c",
        threadId: "thread-003",
        isPrimary: false,
        title: "Senate Intelligence Committee Demands Telecom CEOs Testify on Salt Typhoon",
        summary:
          "The Senate Intelligence Committee issued urgent summons to CEOs of affected carriers. Senators called the breach the worst telecom hack in US history. FCC Chair proposed mandatory cybersecurity annual certifications for carriers under Communications Act Section 214.",
        differences:
          "Covers the political and regulatory fallout, including proposed mandatory telecom security certifications - a policy dimension not in technical reports.",
        source: { name: "Politico", type: "news", url: "#" },
        publishedAt: d(1),
        severity: "high",
        tags: ["Congress", "FCC", "Regulation", "Policy"],
        cves: [],
      },
    ],
  },
  {
    id: "thread-004",
    createdAt: d(1),
    primary: {
      id: "item-004",
      threadId: "thread-004",
      isPrimary: true,
      title: "Microsoft April 2025 Patch Tuesday - 149 CVEs Including 3 Actively Exploited",
      summary:
        "Microsoft April 2025 Patch Tuesday addresses 149 vulnerabilities across Windows, Office, Azure, and Exchange Server. Three are flagged as actively exploited: CVE-2025-29824 (Windows CLFS driver elevation of privilege, CVSS 7.8), CVE-2025-26663 (Windows LDAP use-after-free RCE, CVSS 8.1), and CVE-2025-27482 (Windows Remote Desktop Gateway RCE, CVSS 8.8). 11 vulnerabilities are rated Critical.",
      source: { name: "Microsoft Security Update Guide", type: "advisory", url: "#" },
      publishedAt: d(1),
      severity: "high",
      category: "Patch Tuesday",
      cves: ["CVE-2025-29824", "CVE-2025-26663", "CVE-2025-27482"],
      tags: ["Microsoft", "Patch Tuesday", "Windows", "CLFS", "LDAP", "RDP"],
      isRead: false,
      isStarred: false,
    },
    related: [
      {
        id: "item-004b",
        threadId: "thread-004",
        isPrimary: false,
        title: "CVE-2025-29824 Exploited by RansomEXX Before Patch Release",
        summary:
          "Microsoft confirmed CVE-2025-29824 (CLFS elevation of privilege) was exploited by Storm-2460, a threat actor associated with RansomEXX ransomware, to gain SYSTEM privileges after initial access. The zero-day was used in targeted attacks against organizations in the IT and finance sectors in the US, Venezuela, and Saudi Arabia.",
        differences:
          "Microsoft bulletin listed it as exploited but gave no attribution. Subsequent analysis identifies Storm-2460/RansomEXX as the operator and names specific targeted sectors and geographies.",
        source: { name: "Microsoft Threat Intelligence", type: "research", url: "#" },
        publishedAt: d(1) + h(4),
        severity: "critical",
        tags: ["Storm-2460", "RansomEXX", "CLFS", "Zero-Day", "SYSTEM"],
        cves: ["CVE-2025-29824"],
      },
      {
        id: "item-004c",
        threadId: "thread-004",
        isPrimary: false,
        title: "Patch Tuesday Prioritization: LDAP RCE CVE-2025-26663 Needs Immediate Action",
        summary:
          "Security researchers warn CVE-2025-26663, a use-after-free bug in Windows LDAP, is particularly dangerous as it requires no authentication and is network-accessible via default LDAP ports. Proof-of-concept code is expected within 72 hours. All Windows Server versions from 2016 onwards are affected.",
        differences:
          "Highlights that LDAP RCE may be more urgently weaponizable than the actively-exploited CLFS bug, with PoC imminent. Provides specific affected server versions and remediation priority guidance not in official bulletin.",
        source: { name: "Rapid7 Blog", type: "research", url: "#" },
        publishedAt: d(1) + h(2),
        severity: "critical",
        tags: ["LDAP", "PoC", "Unauthenticated", "Windows Server"],
        cves: ["CVE-2025-26663"],
      },
    ],
  },
  {
    id: "thread-005",
    createdAt: h(8),
    primary: {
      id: "item-005",
      threadId: "thread-005",
      isPrimary: true,
      title: "PyPI Supply Chain Attack: Malicious 'aiocpa' Package Steals Crypto Keys",
      summary:
        "A malicious PyPI package named aiocpa masquerading as a legitimate CPA API client was downloaded 12,000+ times before detection. The package contained obfuscated code that exfiltrated cryptocurrency wallet private keys and Telegram bot tokens to an attacker-controlled endpoint. The attacker published 23 updates over 3 weeks to avoid detection while gradually adding malicious functionality.",
      source: { name: "Phylum Research", type: "research", url: "#" },
      publishedAt: h(8),
      severity: "high",
      category: "Supply Chain",
      cves: [],
      tags: ["PyPI", "Supply Chain", "Crypto", "Malware", "Python"],
      isRead: false,
      isStarred: false,
    },
    related: [
      {
        id: "item-005b",
        threadId: "thread-005",
        isPrimary: false,
        title: "aiocpa Malware C2 Infrastructure Links to Previous npm Attack Campaign",
        summary:
          "Threat intelligence analysts traced the C2 infrastructure used by aiocpa to the same hosting provider and ASN as a 2024 npm supply chain campaign targeting Ethereum developers. The attacker appears to be a single operator with cross-ecosystem capabilities targeting crypto developers specifically.",
        differences:
          "Links the PyPI campaign to a prior npm attack via C2 infrastructure overlap, suggesting a serial supply chain attacker rather than an opportunistic one.",
        source: { name: "Socket Security", type: "research", url: "#" },
        publishedAt: h(6),
        severity: "high",
        tags: ["npm", "C2", "Attribution", "Cross-ecosystem"],
        cves: [],
      },
    ],
  },
  {
    id: "thread-006",
    createdAt: d(3) - h(1),
    primary: {
      id: "item-006",
      threadId: "thread-006",
      isPrimary: true,
      title: "Critical Authentication Bypass in Fortinet FortiOS - CVE-2024-55591",
      summary:
        "Fortinet disclosed a critical authentication bypass vulnerability (CVE-2024-55591, CVSS 9.6) in FortiOS and FortiProxy web management interfaces. The vulnerability allows an attacker to gain super-admin access via crafted WebSocket requests to the Node.js websocket module. Exploitation in the wild was confirmed before the patch was available. Approximately 15,000 internet-exposed FortiGate devices remain unpatched.",
      source: { name: "Fortinet PSIRT", type: "advisory", url: "#" },
      publishedAt: d(3) - h(1),
      severity: "critical",
      category: "Zero-Day",
      cves: ["CVE-2024-55591"],
      tags: ["Fortinet", "FortiOS", "Authentication Bypass", "FortiGate", "VPN"],
      isRead: true,
      isStarred: false,
    },
    related: [
      {
        id: "item-006b",
        threadId: "thread-006",
        isPrimary: false,
        title: "Arctic Wolf: CVE-2024-55591 Used to Deploy Management Tunnels for Persistence",
        summary:
          "Arctic Wolf observed threat actors exploiting CVE-2024-55591 to create rogue admin accounts, export VPN configurations, and establish management tunnel backdoors. Post-exploitation lateral movement was observed within 4 hours of initial access in some cases.",
        differences:
          "Provides detailed post-exploitation TTP timeline - rogue admin creation, config export, and tunnel backdoors - observable behavior not described in the vendor advisory.",
        source: { name: "Arctic Wolf Labs", type: "research", url: "#" },
        publishedAt: d(2) + h(20),
        severity: "critical",
        tags: ["TTP", "Persistence", "Lateral Movement", "FortiGate"],
        cves: ["CVE-2024-55591"],
      },
    ],
  },
  {
    id: "thread-007",
    createdAt: h(1),
    primary: {
      id: "item-007",
      threadId: "thread-007",
      isPrimary: true,
      title: "NVD: CVE-2025-31201 - Apple WebKit Type Confusion RCE (CVSS 8.8)",
      summary:
        "Apple patched CVE-2025-31201, a type confusion vulnerability in WebKit, affecting Safari, iOS, iPadOS, and macOS. The bug allows a malicious web page to execute arbitrary code in the renderer process. Apple confirmed awareness of reports that the issue may have been actively exploited. The vulnerability affects all WebKit-based browsers on Apple platforms including Chrome and Firefox on iOS due to App Store policy requirements.",
      source: { name: "NVD / Apple PSIRT", type: "advisory", url: "#" },
      publishedAt: h(1),
      severity: "high",
      category: "Zero-Day",
      cves: ["CVE-2025-31201"],
      tags: ["Apple", "WebKit", "Safari", "iOS", "RCE", "Browser"],
      isRead: false,
      isStarred: false,
    },
    related: [],
  },
  {
    id: "thread-008",
    createdAt: d(1) + h(2),
    primary: {
      id: "item-008",
      threadId: "thread-008",
      isPrimary: true,
      title: "Lazarus Group Deploys Marstech1 macOS Backdoor via npm Packages",
      summary:
        "North Korean Lazarus Group (UNC4736 / TraderTraitor) published malicious npm packages as part of Operation Dream Job, targeting blockchain and cryptocurrency developers. The packages delivered a novel macOS backdoor named Marstech1 with capabilities including keylogging, clipboard monitoring (targeting crypto wallet addresses), and remote shell access. 233 GitHub repositories were identified as potentially compromised.",
      source: { name: "SecurityScorecard STRIKE", type: "research", url: "#" },
      publishedAt: d(1) + h(2),
      severity: "high",
      category: "APT",
      cves: [],
      tags: ["Lazarus", "North Korea", "npm", "macOS", "Crypto", "Marstech1"],
      isRead: true,
      isStarred: true,
    },
    related: [
      {
        id: "item-008b",
        threadId: "thread-008",
        isPrimary: false,
        title: "GitHub Suspends 233 Repos Linked to Lazarus Operation Dream Job",
        summary:
          "GitHub took down 233 repositories identified as part of Lazarus Group infrastructure after the SecurityScorecard report. Many repos posed as open-source crypto tools with legitimate-looking commit histories. Some packages had been downloaded thousands of times before removal.",
        differences:
          "Confirms GitHub takedown action and adds detail on the social engineering aspect - repos mimicked legitimate projects with manufactured commit histories, a social proof tactic unique to this campaign.",
        source: { name: "BleepingComputer", type: "news", url: "#" },
        publishedAt: d(1) + h(6),
        severity: "high",
        tags: ["GitHub", "Takedown", "Social Engineering"],
        cves: [],
      },
    ],
  },
]

export const CATEGORIES = [
  { id: "all", label: "All Intel", icon: "inbox" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "Zero-Day", label: "Zero-Days", icon: "zap" },
  { id: "Ransomware", label: "Ransomware", icon: "lock" },
  { id: "APT", label: "APT / Nation-State", icon: "globe" },
  { id: "Supply Chain", label: "Supply Chain", icon: "package" },
  { id: "Patch Tuesday", label: "Patch Tuesday", icon: "shield-check" },
]
