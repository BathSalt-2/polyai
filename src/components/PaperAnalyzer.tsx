import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, MagnifyingGlass, Graph, Lightning, Sparkle, ArrowsLeftRight, TreeStructure, ListChecks, Question, Network } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResearchPaper, PaperAnalysis, analyzePaperStructure, extractKeyTerms, detectDomains, comparePapers, buildCitationGraph, findCentralPapers, suggestReadingOrder } from '@/lib/paperAnalysis'
import { QuestionGenerator } from '@/components/QuestionGenerator'

interface PaperAnalyzerProps {
  domains: Array<{ id: string; name: string; color: string }>
}

export function PaperAnalyzer({ domains }: PaperAnalyzerProps) {
  const [papers, setPapers] = useKV<ResearchPaper[]>('research-papers', [])
  const [analyses, setAnalyses] = useKV<PaperAnalysis[]>('paper-analyses', [])
  
  const [paperInput, setPaperInput] = useState({
    title: '',
    authors: '',
    abstract: '',
    content: '',
    domain: 'auto-detect'
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<PaperAnalysis | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [comparePaper1, setComparePaper1] = useState<string>('')
  const [comparePaper2, setComparePaper2] = useState<string>('')
  const [comparisonResult, setComparisonResult] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'library' | 'questions'>('library')

  const addPaper = () => {
    if (!paperInput.title || !paperInput.abstract) return

    const detectedDomains = detectDomains(paperInput.abstract + ' ' + paperInput.content)
    const keywords = extractKeyTerms(paperInput.abstract + ' ' + paperInput.content)

    const newPaper: ResearchPaper = {
      id: Date.now().toString(),
      title: paperInput.title,
      authors: paperInput.authors.split(',').map(a => a.trim()).filter(Boolean),
      abstract: paperInput.abstract,
      content: paperInput.content,
      domain: (paperInput.domain && paperInput.domain !== 'auto-detect') ? paperInput.domain : (detectedDomains[0] || 'general'),
      keywords,
      timestamp: Date.now()
    }

    setPapers(current => [newPaper, ...(current || [])])
    setPaperInput({ title: '', authors: '', abstract: '', content: '', domain: 'auto-detect' })
  }

  const analyzePaper = async (paper: ResearchPaper) => {
    setIsAnalyzing(true)
    setSelectedPaper(paper)

    try {
      const structure = analyzePaperStructure(paper.content)
      const detectedDomains = detectDomains(paper.abstract + ' ' + paper.content)

      const domainNames = detectedDomains.map(id => 
        domains.find(d => d.id === id)?.name || id
      )

      const analysisPrompt = (window as any).spark.llmPrompt`You are a PhD-level research analyst with expertise across multiple academic domains. Analyze this research paper in depth.

Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Domain: ${paper.domain}
Detected Cross-Domain Connections: ${domainNames.join(', ')}

Abstract:
${paper.abstract}

Full Content:
${paper.content.substring(0, 4000)}...

Provide a comprehensive PhD-level analysis including:

1. EXECUTIVE SUMMARY (2-3 sentences)
2. KEY FINDINGS (bullet points, be specific)
3. METHODOLOGY (describe research approach and techniques)
4. THEORETICAL IMPLICATIONS (what does this mean for the field?)
5. CROSS-DOMAIN INSIGHTS (connections to other fields: ${domainNames.join(', ')})
6. CRITICAL ANALYSIS (strengths, limitations, assumptions)
7. RESEARCH QUESTIONS (what questions does this raise?)

Be intellectually rigorous and precise. Structure your response clearly with these exact section headers.`

      const response = await (window as any).spark.llm(analysisPrompt, 'gpt-4o')

      const parseSection = (text: string, header: string): string => {
        const regex = new RegExp(`${header}[:\\s]+(.*?)(?=\\n\\d+\\.|\\n[A-Z][A-Z]|$)`, 'is')
        const match = text.match(regex)
        return match ? match[1].trim() : ''
      }

      const parseBullets = (text: string, header: string): string[] => {
        const section = parseSection(text, header)
        return section
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
          .map(line => line.replace(/^[-•]\s*/, '').trim())
          .filter(Boolean)
      }

      const analysis: PaperAnalysis = {
        paperId: paper.id,
        summary: parseSection(response, 'EXECUTIVE SUMMARY') || parseSection(response, '1. EXECUTIVE SUMMARY'),
        keyFindings: parseBullets(response, 'KEY FINDINGS') || parseBullets(response, '2. KEY FINDINGS'),
        methodology: parseSection(response, 'METHODOLOGY') || parseSection(response, '3. METHODOLOGY'),
        implications: parseBullets(response, 'THEORETICAL IMPLICATIONS') || parseBullets(response, '4. THEORETICAL IMPLICATIONS'),
        connections: detectedDomains,
        criticalAnalysis: parseSection(response, 'CRITICAL ANALYSIS') || parseSection(response, '6. CRITICAL ANALYSIS'),
        crossDomainInsights: parseBullets(response, 'CROSS-DOMAIN INSIGHTS') || parseBullets(response, '5. CROSS-DOMAIN INSIGHTS'),
        questions: parseBullets(response, 'RESEARCH QUESTIONS') || parseBullets(response, '7. RESEARCH QUESTIONS'),
        technicalDepth: detectedDomains.length >= 2 ? 'research' : 'phd',
        timestamp: Date.now()
      }

      setAnalyses(current => [analysis, ...(current || [])])
      setSelectedAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing paper:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleComparison = async () => {
    if (!comparePaper1 || !comparePaper2) return

    const paper1 = (papers || []).find(p => p.id === comparePaper1)
    const paper2 = (papers || []).find(p => p.id === comparePaper2)

    if (!paper1 || !paper2) return

    const basicComparison = comparePapers(paper1, paper2)

    const comparisonPrompt = (window as any).spark.llmPrompt`Compare and contrast these two research papers at a PhD level.

Paper 1: "${paper1.title}"
Authors: ${paper1.authors.join(', ')}
Abstract: ${paper1.abstract}

Paper 2: "${paper2.title}"
Authors: ${paper2.authors.join(', ')}
Abstract: ${paper2.abstract}

Provide a sophisticated comparative analysis covering:
1. Methodological differences and similarities
2. Theoretical frameworks and how they relate
3. Complementary insights and potential synergies
4. Contradictions or tensions between the papers
5. Combined implications for the field(s)
6. Suggested synthesis or future research directions

Be precise and academically rigorous.`

    try {
      const analysis = await (window as any).spark.llm(comparisonPrompt, 'gpt-4o')
      setComparisonResult({
        ...basicComparison,
        deepAnalysis: analysis,
        paper1,
        paper2
      })
    } catch (error) {
      console.error('Error comparing papers:', error)
    }
  }

  const generateLiteratureReview = async () => {
    if ((papers || []).length < 2) return

    const papersToReview = papers || []
    const graph = buildCitationGraph(papersToReview)
    const centralPapers = findCentralPapers(graph)
    const orderedPapers = suggestReadingOrder(papersToReview)

    const reviewPrompt = (window as any).spark.llmPrompt`Generate a comprehensive literature review synthesizing these ${papersToReview.length} research papers.

Papers:
${papersToReview.map((p, i) => `${i + 1}. "${p.title}" by ${p.authors.join(', ')}
   Abstract: ${p.abstract}`).join('\n\n')}

Create a PhD-level literature review that:
1. Identifies major themes across the literature
2. Maps the conceptual landscape and relationships between papers
3. Highlights key debates or disagreements
4. Identifies gaps in current research
5. Suggests directions for future investigation
6. Demonstrates interdisciplinary connections

Structure this as a formal literature review suitable for an academic paper.`

    try {
      const review = await (window as any).spark.llm(reviewPrompt, 'gpt-4o')
      return review
    } catch (error) {
      console.error('Error generating literature review:', error)
      return null
    }
  }

  const filteredPapers = searchQuery
    ? (papers || []).filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (papers || [])

  return (
    <div className="space-y-6">
      {(papers || []).length >= 2 && (
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeView === 'library' ? 'default' : 'outline'}
            onClick={() => setActiveView('library')}
            className="flex-1"
          >
            <FileText className="mr-2" size={18} />
            Paper Library & Analysis
          </Button>
          <Button
            variant={activeView === 'questions' ? 'default' : 'outline'}
            onClick={() => setActiveView('questions')}
            className="flex-1"
          >
            <Question className="mr-2" size={18} />
            Research Question Generator
          </Button>
        </div>
      )}

      {activeView === 'questions' && (papers || []).length >= 2 ? (
        <QuestionGenerator papers={papers || []} domains={domains} />
      ) : (
        <>
          <Card className="domain-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-accent" />
                Research Paper Analysis
              </CardTitle>
              <CardDescription>
                Add research papers for deep AI-powered analysis and synthesis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Input
                  placeholder="Paper title..."
                  value={paperInput.title}
                  onChange={(e) => setPaperInput(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Authors (comma-separated)..."
                  value={paperInput.authors}
                  onChange={(e) => setPaperInput(prev => ({ ...prev, authors: e.target.value }))}
                />
                <Select value={paperInput.domain || "auto-detect"} onValueChange={(value) => setPaperInput(prev => ({ ...prev, domain: value === "auto-detect" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain (or auto-detect)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto-detect">Auto-detect</SelectItem>
                    {domains.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Abstract..."
                  value={paperInput.abstract}
                  onChange={(e) => setPaperInput(prev => ({ ...prev, abstract: e.target.value }))}
                  className="min-h-[100px]"
                />
                <Textarea
                  placeholder="Full paper content (paste the entire paper for best analysis)..."
                  value={paperInput.content}
                  onChange={(e) => setPaperInput(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px] code-font text-sm"
                />
              </div>
              <Button 
                onClick={addPaper} 
                disabled={!paperInput.title || !paperInput.abstract}
                className="w-full"
              >
                <FileText className="mr-2" />
                Add Paper to Library
              </Button>
            </CardContent>
          </Card>

          {(papers || []).length > 0 && (
            <>
              <Card className="domain-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MagnifyingGlass className="text-accent" />
                    Paper Library ({(papers || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search papers by title, author, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background/50"
                  />
                  
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredPapers.map(paper => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className="knowledge-card cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground mb-1">{paper.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {paper.authors.join(', ')}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {domains.find(d => d.id === paper.domain)?.name || paper.domain}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {paper.abstract}
                              </p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {paper.keywords.slice(0, 5).map(keyword => (
                                  <Badge key={keyword} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                              <Button
                                onClick={() => analyzePaper(paper)}
                                size="sm"
                                className="w-full"
                                disabled={isAnalyzing}
                              >
                                {isAnalyzing && selectedPaper?.id === paper.id ? (
                                  <>
                                    <div className="thinking-indicator w-3 h-3 rounded-full mr-2"></div>
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Lightning className="mr-2" size={16} />
                                    Deep Analysis
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="domain-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowsLeftRight className="text-accent" />
                      Compare Papers
                    </CardTitle>
                    <CardDescription>
                      Analyze relationships between two papers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={comparePaper1} onValueChange={setComparePaper1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select first paper" />
                      </SelectTrigger>
                      <SelectContent>
                        {(papers || []).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={comparePaper2} onValueChange={setComparePaper2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select second paper" />
                      </SelectTrigger>
                      <SelectContent>
                        {(papers || []).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleComparison}
                      disabled={!comparePaper1 || !comparePaper2 || comparePaper1 === comparePaper2}
                      className="w-full"
                    >
                      <ArrowsLeftRight className="mr-2" />
                      Compare Papers
                    </Button>
                  </CardContent>
                </Card>

                <Card className="domain-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="text-accent" />
                      Analysis Tools
                    </CardTitle>
                    <CardDescription>
                      Advanced synthesis capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      disabled={(papers || []).length < 2}
                      onClick={async () => {
                        const review = await generateLiteratureReview()
                        if (review) {
                          alert('Literature review generated! (In production, this would open in a dialog)')
                        }
                      }}
                    >
                      <TreeStructure className="mr-2" size={16} />
                      Generate Literature Review
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      disabled={(papers || []).length < 3}
                      onClick={() => {
                        const graph = buildCitationGraph(papers || [])
                        const central = findCentralPapers(graph)
                        alert(`Central papers: ${central.length} identified`)
                      }}
                    >
                      <Graph className="mr-2" size={16} />
                      Build Citation Graph
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      disabled={(papers || []).length < 2}
                      onClick={() => {
                        const ordered = suggestReadingOrder(papers || [])
                        alert(`Reading order optimized for ${ordered.length} papers`)
                      }}
                    >
                      <ListChecks className="mr-2" size={16} />
                      Suggest Reading Order
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {(papers || []).length >= 2 && activeView === 'library' && (
                <Card className="domain-card border-accent/30 bg-accent/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkle className="text-accent" size={32} />
                        <div>
                          <h4 className="font-semibold mb-1">Ready to Generate Research Questions?</h4>
                          <p className="text-sm text-muted-foreground">
                            You have {(papers || []).length} papers in your library. Generate comprehensive research questions automatically.
                          </p>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => setActiveView('questions')}
                      >
                        <Lightning className="mr-2" />
                        Generate Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          {selectedAnalysis && selectedPaper && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkle className="text-accent" />
                  {selectedPaper.title}
                </DialogTitle>
                <DialogDescription>
                  PhD-level research paper analysis
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="bg-secondary/20 rounded-lg p-4 border border-secondary/30">
                  <h4 className="font-semibold text-sm mb-2 text-secondary">Executive Summary</h4>
                  <p className="text-sm leading-relaxed">{selectedAnalysis.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightning size={16} className="text-accent" />
                    Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {selectedAnalysis.keyFindings.map((finding, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Methodology</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAnalysis.methodology}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Network size={16} className="text-purple-400" />
                    Cross-Domain Insights
                  </h4>
                  <div className="space-y-2">
                    {selectedAnalysis.crossDomainInsights.map((insight, idx) => (
                      <div key={idx} className="bg-primary/10 rounded-lg p-3 text-sm border border-primary/20">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Critical Analysis</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAnalysis.criticalAnalysis}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Question size={16} className="text-yellow-400" />
                    Research Questions
                  </h4>
                  <ul className="space-y-2">
                    {selectedAnalysis.questions.map((question, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">?</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Technical Depth: {selectedAnalysis.technicalDepth}
                  </Badge>
                  {selectedAnalysis.connections.map(domain => (
                    <Badge key={domain} variant="outline">
                      {domains.find(d => d.id === domain)?.name || domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!comparisonResult} onOpenChange={() => setComparisonResult(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          {comparisonResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowsLeftRight className="text-accent" />
                  Comparative Analysis
                </DialogTitle>
                <DialogDescription>
                  Deep comparison of research papers
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h5 className="font-semibold text-sm mb-2 text-blue-400">Paper 1</h5>
                    <p className="text-sm font-medium">{comparisonResult.paper1.title}</p>
                    <p className="text-xs text-muted-foreground">{comparisonResult.paper1.authors.join(', ')}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <h5 className="font-semibold text-sm mb-2 text-purple-400">Paper 2</h5>
                    <p className="text-sm font-medium">{comparisonResult.paper2.title}</p>
                    <p className="text-xs text-muted-foreground">{comparisonResult.paper2.authors.join(', ')}</p>
                  </div>
                </div>

                {comparisonResult.similarities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Shared Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {comparisonResult.similarities.map((keyword: string) => (
                        <Badge key={keyword} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Deep Comparative Analysis</h4>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{comparisonResult.deepAnalysis}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
