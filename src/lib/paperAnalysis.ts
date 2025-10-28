export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  abstract: string
  content: string
  domain: string
  publicationDate?: string
  keywords: string[]
  citations?: string[]
  methodology?: string
  findings?: string[]
  timestamp: number
}

export interface PaperAnalysis {
  paperId: string
  summary: string
  keyFindings: string[]
  methodology: string
  implications: string[]
  connections: string[]
  criticalAnalysis: string
  crossDomainInsights: string[]
  questions: string[]
  technicalDepth: 'undergraduate' | 'graduate' | 'phd' | 'research'
  timestamp: number
}

export interface CitationGraph {
  papers: Map<string, ResearchPaper>
  connections: Map<string, string[]>
}

export const analyzePaperStructure = (content: string) => {
  const sections = {
    abstract: '',
    introduction: '',
    methodology: '',
    results: '',
    discussion: '',
    conclusion: '',
    references: [] as string[]
  }

  const lines = content.split('\n')
  let currentSection: keyof typeof sections | null = null

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim()
    
    if (lowerLine.includes('abstract')) {
      currentSection = 'abstract'
    } else if (lowerLine.includes('introduction')) {
      currentSection = 'introduction'
    } else if (lowerLine.includes('method')) {
      currentSection = 'methodology'
    } else if (lowerLine.includes('result')) {
      currentSection = 'results'
    } else if (lowerLine.includes('discussion')) {
      currentSection = 'discussion'
    } else if (lowerLine.includes('conclusion')) {
      currentSection = 'conclusion'
    } else if (lowerLine.includes('reference')) {
      currentSection = 'references'
    } else if (currentSection && line.trim()) {
      if (currentSection === 'references') {
        sections.references.push(line.trim())
      } else {
        const value = sections[currentSection]
        if (typeof value === 'string') {
          sections[currentSection] = value + line + '\n'
        }
      }
    }
  }

  return sections
}

export const extractKeyTerms = (text: string): string[] => {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'we', 'our', 'study', 'research', 'paper', 'article'])
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonWords.has(word))
  
  const frequency = new Map<string, number>()
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1)
  })
  
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word)
}

export const detectDomains = (text: string): string[] => {
  const domainKeywords = {
    'computer-science': ['algorithm', 'computational', 'neural', 'machine learning', 'artificial intelligence', 'software', 'programming', 'data structure', 'complexity', 'optimization'],
    'quantum-physics': ['quantum', 'entanglement', 'superposition', 'wavefunction', 'qubit', 'planck', 'uncertainty', 'schrodinger', 'heisenberg'],
    'mathematics': ['theorem', 'proof', 'equation', 'matrix', 'calculus', 'topology', 'algebraic', 'geometric', 'differential', 'integration'],
    'psychology': ['cognitive', 'behavioral', 'neural', 'consciousness', 'perception', 'memory', 'emotion', 'psychological', 'brain', 'mind'],
    'music-theory': ['harmonic', 'melodic', 'rhythm', 'composition', 'musical', 'chord', 'scale', 'tonality', 'counterpoint'],
    'philosophy': ['epistemology', 'metaphysics', 'ontology', 'ethics', 'phenomenology', 'consciousness', 'existence', 'knowledge', 'logic']
  }
  
  const lowerText = text.toLowerCase()
  const detectedDomains: string[] = []
  
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword))
    if (matches.length >= 2) {
      detectedDomains.push(domain)
    }
  }
  
  return detectedDomains
}

export const comparePapers = (paper1: ResearchPaper, paper2: ResearchPaper): {
  similarities: string[]
  differences: string[]
  complementarity: string
} => {
  const keywords1 = new Set(paper1.keywords)
  const keywords2 = new Set(paper2.keywords)
  
  const sharedKeywords = paper1.keywords.filter(k => keywords2.has(k))
  const uniqueTo1 = paper1.keywords.filter(k => !keywords2.has(k))
  const uniqueTo2 = paper2.keywords.filter(k => !keywords1.has(k))
  
  return {
    similarities: sharedKeywords,
    differences: [...uniqueTo1.map(k => `${paper1.title}: ${k}`), ...uniqueTo2.map(k => `${paper2.title}: ${k}`)],
    complementarity: sharedKeywords.length > 0 
      ? 'Papers share common themes and could inform each other'
      : 'Papers address distinct topics with potential for cross-pollination'
  }
}

export const buildCitationGraph = (papers: ResearchPaper[]): CitationGraph => {
  const graph: CitationGraph = {
    papers: new Map(),
    connections: new Map()
  }
  
  papers.forEach(paper => {
    graph.papers.set(paper.id, paper)
    graph.connections.set(paper.id, [])
  })
  
  papers.forEach(paper => {
    if (paper.citations) {
      paper.citations.forEach(citation => {
        const citedPaper = papers.find(p => 
          p.title.toLowerCase().includes(citation.toLowerCase()) ||
          citation.toLowerCase().includes(p.title.toLowerCase())
        )
        
        if (citedPaper) {
          const connections = graph.connections.get(paper.id) || []
          connections.push(citedPaper.id)
          graph.connections.set(paper.id, connections)
        }
      })
    }
  })
  
  return graph
}

export const findCentralPapers = (graph: CitationGraph): string[] => {
  const citationCounts = new Map<string, number>()
  
  graph.connections.forEach(citations => {
    citations.forEach(citedId => {
      citationCounts.set(citedId, (citationCounts.get(citedId) || 0) + 1)
    })
  })
  
  return Array.from(citationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)
}

export const suggestReadingOrder = (papers: ResearchPaper[]): ResearchPaper[] => {
  const technicalLevels = {
    'undergraduate': 1,
    'graduate': 2,
    'phd': 3,
    'research': 4
  }
  
  return [...papers].sort((a, b) => {
    const domainCompare = a.domain.localeCompare(b.domain)
    if (domainCompare !== 0) return domainCompare
    
    const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0
    const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0
    return dateA - dateB
  })
}
