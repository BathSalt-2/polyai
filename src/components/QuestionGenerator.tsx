import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Question, Sparkle, MagnifyingGlass, Graph, Lightning, Target, ArrowsLeftRight, Network, Lightbulb, TrendUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResearchPaper, ResearchQuestion, QuestionGenerationResult, identifyResearchGaps, clusterPapersByTheme } from '@/lib/paperAnalysis'

interface QuestionGeneratorProps {
  papers: ResearchPaper[]
  domains: Array<{ id: string; name: string; color: string }>
}

export function QuestionGenerator({ papers, domains }: QuestionGeneratorProps) {
  const isMobile = useIsMobile()
  const [generatedQuestions, setGeneratedQuestions] = useKV<QuestionGenerationResult[]>('generated-questions', [])
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterComplexity, setFilterComplexity] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedResult, setSelectedResult] = useState<QuestionGenerationResult | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<ResearchQuestion | null>(null)

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev =>
      prev.includes(paperId)
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    )
  }

  const selectAllPapers = () => {
    setSelectedPapers(papers.map(p => p.id))
  }

  const clearSelection = () => {
    setSelectedPapers([])
  }

  const generateQuestions = async () => {
    if (selectedPapers.length === 0) return

    setIsGenerating(true)

    try {
      const selectedPapersData = papers.filter(p => selectedPapers.includes(p.id))
      const gaps = identifyResearchGaps(selectedPapersData)
      const clusters = clusterPapersByTheme(selectedPapersData)

      const paperSummaries = selectedPapersData.map(p => ({
        title: p.title,
        authors: p.authors,
        abstract: p.abstract,
        domain: p.domain,
        keywords: p.keywords
      }))

      const domainList = [...new Set(selectedPapersData.map(p => p.domain))].map(id =>
        domains.find(d => d.id === id)?.name || id
      )

      const questionPrompt = (window as any).spark.llmPrompt`You are a PhD-level research strategist analyzing a collection of ${selectedPapersData.length} research papers. Generate comprehensive research questions that advance the field(s).

Papers Collection:
${paperSummaries.map((p, i) => `${i + 1}. "${p.title}" by ${p.authors.join(', ')}
   Domain: ${p.domain}
   Keywords: ${p.keywords.join(', ')}
   Abstract: ${p.abstract.substring(0, 300)}...`).join('\n\n')}

Domains Covered: ${domainList.join(', ')}

Identified Research Gaps:
- Methodological: ${gaps.methodologicalGaps.join('; ') || 'None identified'}
- Cross-domain: ${gaps.crossDomainGaps.join('; ') || 'None identified'}

Generate 12-15 research questions across these categories:
1. METHODOLOGICAL (3-4 questions): Questions about research methods, techniques, or approaches
2. THEORETICAL (3-4 questions): Questions about underlying theories, frameworks, or conceptual models
3. EMPIRICAL (2-3 questions): Questions requiring new data collection or experiments
4. CROSS-DOMAIN (2-3 questions): Questions bridging multiple fields
5. FUTURE DIRECTIONS (2-3 questions): Questions about where the field(s) should go next

For each question, provide:
- The question itself (clear, specific, answerable)
- Category (one of the 5 above)
- Complexity level (undergraduate/graduate/phd/research)
- Related paper titles from the collection (if applicable)
- Brief rationale (why this question matters, 1-2 sentences)

Also provide:
- GAP ANALYSIS: What's missing from current research? (2-3 paragraphs)
- SYNTHESIS OPPORTUNITIES: How could findings be integrated? (3-5 bullet points)
- METHODOLOGICAL GAPS: What methods are underutilized? (3-4 bullet points)
- CROSS-DOMAIN POTENTIAL: What interdisciplinary connections exist? (3-4 bullet points)
- FUTURE DIRECTIONS: Where should research go next? (4-5 bullet points)

Format your response as JSON with this structure:
{
  "questions": [
    {
      "question": "question text",
      "category": "methodological|theoretical|empirical|cross-domain|future-direction",
      "complexity": "undergraduate|graduate|phd|research",
      "relatedPapers": ["paper title 1", "paper title 2"],
      "rationale": "rationale text"
    }
  ],
  "gapAnalysis": "text",
  "synthesisOpportunities": ["opportunity 1", "opportunity 2"],
  "methodologicalGaps": ["gap 1", "gap 2"],
  "crossDomainPotential": ["potential 1", "potential 2"],
  "futureDirections": ["direction 1", "direction 2"]
}`

      const response = await (window as any).spark.llm(questionPrompt, 'gpt-4o', true)
      const parsedResponse = JSON.parse(response)

      const questions: ResearchQuestion[] = parsedResponse.questions.map((q: any, idx: number) => {
        const relatedPaperIds = selectedPapersData
          .filter(p => q.relatedPapers?.some((title: string) =>
            p.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(p.title.toLowerCase())
          ))
          .map(p => p.id)

        const questionDomains = [...new Set(
          relatedPaperIds
            .map(id => selectedPapersData.find(p => p.id === id)?.domain)
            .filter(Boolean) as string[]
        )]

        return {
          id: `${Date.now()}-${idx}`,
          question: q.question,
          category: q.category,
          complexity: q.complexity,
          relatedPapers: relatedPaperIds,
          domains: questionDomains.length > 0 ? questionDomains : selectedPapersData.map(p => p.domain).slice(0, 1),
          rationale: q.rationale,
          timestamp: Date.now()
        }
      })

      const result: QuestionGenerationResult = {
        questions,
        gapAnalysis: parsedResponse.gapAnalysis,
        synthesisOpportunities: parsedResponse.synthesisOpportunities || [],
        methodologicalGaps: parsedResponse.methodologicalGaps || [],
        crossDomainPotential: parsedResponse.crossDomainPotential || [],
        futureDirections: parsedResponse.futureDirections || [],
        timestamp: Date.now()
      }

      setGeneratedQuestions(current => [result, ...(current || [])])
      setSelectedResult(result)
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'methodological': return <Target size={16} className="text-blue-400" />
      case 'theoretical': return <Lightbulb size={16} className="text-purple-400" />
      case 'empirical': return <MagnifyingGlass size={16} className="text-cyan-400" />
      case 'cross-domain': return <Network size={16} className="text-green-400" />
      case 'future-direction': return <TrendUp size={16} className="text-yellow-400" />
      default: return <Question size={16} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'methodological': return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
      case 'theoretical': return 'text-purple-400 border-purple-400/30 bg-purple-400/10'
      case 'empirical': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10'
      case 'cross-domain': return 'text-green-400 border-green-400/30 bg-green-400/10'
      case 'future-direction': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      default: return 'text-muted-foreground'
    }
  }

  const getComplexityBadgeVariant = (complexity: string) => {
    switch (complexity) {
      case 'undergraduate': return 'secondary'
      case 'graduate': return 'outline'
      case 'phd': return 'default'
      case 'research': return 'destructive'
      default: return 'secondary'
    }
  }

  const latestResult = (generatedQuestions || [])[0]

  const filteredQuestions = latestResult?.questions.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false
    if (filterComplexity !== 'all' && q.complexity !== filterComplexity) return false
    return true
  }) || []

  return (
    <div className="space-y-6">
      <Card className="domain-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="text-accent" />
            Automated Research Question Generation
          </CardTitle>
          <CardDescription>
            Generate comprehensive research questions from your paper collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedPapers.length} of {papers.length} papers selected
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAllPapers}>
                Select All
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>

          <ScrollArea className="h-64 border border-border rounded-lg p-4">
            <div className="space-y-2">
              {papers.map(paper => (
                <div
                  key={paper.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedPapers.includes(paper.id)}
                    onCheckedChange={() => togglePaperSelection(paper.id)}
                    className="mt-1"
                    id={paper.id}
                  />
                  <label htmlFor={paper.id} className="flex-1 cursor-pointer">
                    <div className="font-medium text-sm">{paper.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {paper.authors.slice(0, 2).join(', ')}
                      {paper.authors.length > 2 && ' et al.'}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {domains.find(d => d.id === paper.domain)?.name || paper.domain}
                      </Badge>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button
            onClick={generateQuestions}
            disabled={selectedPapers.length === 0 || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="thinking-indicator w-4 h-4 rounded-full"></div>
                Generating Research Questions...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lightning />
                Generate Questions from {selectedPapers.length} Papers
                <Sparkle />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {latestResult && (
        <>
          <Card className="domain-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Question className="text-accent" />
                  Generated Questions ({filteredQuestions.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="methodological">Methodological</SelectItem>
                      <SelectItem value="theoretical">Theoretical</SelectItem>
                      <SelectItem value="empirical">Empirical</SelectItem>
                      <SelectItem value="cross-domain">Cross-Domain</SelectItem>
                      <SelectItem value="future-direction">Future Directions</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterComplexity} onValueChange={setFilterComplexity}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                AI-generated research questions based on your paper collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredQuestions.map((question, idx) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card
                          className={`knowledge-card cursor-pointer border ${getCategoryColor(question.category)}`}
                          onClick={() => setExpandedQuestion(question)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getCategoryIcon(question.category)}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-foreground mb-2">
                                  {question.question}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {question.category}
                                  </Badge>
                                  <Badge variant={getComplexityBadgeVariant(question.complexity)} className="text-xs">
                                    {question.complexity}
                                  </Badge>
                                  {question.domains.map(domain => (
                                    <Badge key={domain} variant="secondary" className="text-xs">
                                      {domains.find(d => d.id === domain)?.name || domain}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {question.rationale}
                                </p>
                                {question.relatedPapers.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    Related to {question.relatedPapers.length} paper(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="domain-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MagnifyingGlass className="text-accent" />
                  Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {latestResult.gapAnalysis}
                </p>
              </CardContent>
            </Card>

            <Card className="domain-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ArrowsLeftRight className="text-accent" />
                  Synthesis Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestResult.synthesisOpportunities.map((opp, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="domain-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="text-blue-400" />
                  Methodological Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestResult.methodologicalGaps.map((gap, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="domain-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Network className="text-green-400" />
                  Cross-Domain Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestResult.crossDomainPotential.map((potential, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{potential}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="domain-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp className="text-yellow-400" />
                Future Research Directions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {latestResult.futureDirections.map((direction, idx) => (
                  <div
                    key={idx}
                    className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold text-sm">{idx + 1}.</span>
                      <span className="text-sm leading-relaxed">{direction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!expandedQuestion} onOpenChange={() => setExpandedQuestion(null)}>
        <DialogContent className="max-w-3xl">
          {expandedQuestion && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(expandedQuestion.category)}
                  Research Question Details
                </DialogTitle>
                <DialogDescription>
                  {expandedQuestion.category.charAt(0).toUpperCase() + expandedQuestion.category.slice(1)} question at {expandedQuestion.complexity} level
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className={`border-l-4 pl-4 py-2 ${getCategoryColor(expandedQuestion.category)}`}>
                  <h4 className="text-lg font-semibold leading-relaxed">
                    {expandedQuestion.question}
                  </h4>
                </div>

                <div>
                  <h5 className="text-sm font-semibold mb-2">Rationale</h5>
                  <p className="text-sm leading-relaxed">{expandedQuestion.rationale}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Category</h5>
                    <Badge variant="outline" className="text-xs">
                      {expandedQuestion.category}
                    </Badge>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Complexity</h5>
                    <Badge variant={getComplexityBadgeVariant(expandedQuestion.complexity)} className="text-xs">
                      {expandedQuestion.complexity}
                    </Badge>
                  </div>
                </div>

                {expandedQuestion.domains.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Domains</h5>
                    <div className="flex flex-wrap gap-2">
                      {expandedQuestion.domains.map(domain => (
                        <Badge key={domain} variant="secondary">
                          {domains.find(d => d.id === domain)?.name || domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {expandedQuestion.relatedPapers.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Related Papers</h5>
                    <div className="space-y-2">
                      {expandedQuestion.relatedPapers.map(paperId => {
                        const paper = papers.find(p => p.id === paperId)
                        if (!paper) return null
                        return (
                          <div key={paperId} className="bg-background/30 rounded-lg p-3 border border-border">
                            <div className="font-medium text-sm">{paper.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {paper.authors.join(', ')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
