import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Brain, Atom, Calculator, Users, MusicNote, Lightbulb, Sparkle, Network, ArrowRight, BookOpen, MagnifyingGlass, Stack, GraduationCap, FileText, List, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { knowledgeBases, searchKnowledgeBase, getKnowledgeEntry, getConnectedEntries, KnowledgeEntry } from '@/lib/knowledgeBase'
import { PaperAnalyzer } from '@/components/PaperAnalyzer'

const domains = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    icon: Brain,
    description: 'Software engineering, algorithms, AI development',
    color: 'text-blue-400'
  },
  {
    id: 'quantum-physics',
    name: 'Quantum Physics',
    icon: Atom,
    description: 'Quantum theory, quantum mechanics, quantum computing',
    color: 'text-purple-400'
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: Calculator,
    description: 'Calculus, advanced mathematics, mathematical proofs',
    color: 'text-cyan-400'
  },
  {
    id: 'psychology',
    name: 'Psychology',
    icon: Users,
    description: 'Cognitive science, behavioral analysis, consciousness',
    color: 'text-green-400'
  },
  {
    id: 'music-theory',
    name: 'Music Theory',
    icon: MusicNote,
    description: 'Composition, harmony, musical mathematics',
    color: 'text-yellow-400'
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    icon: Lightbulb,
    description: 'Ethics, metaphysics, logic, consciousness studies',
    color: 'text-orange-400'
  }
]

interface ConversationEntry {
  id: string
  query: string
  response: string
  domains: string[]
  timestamp: number
  reflection?: string
}

function App() {
  const isMobile = useIsMobile()
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [isThinking, setIsThinking] = useState(false)
  const [conversations, setConversations] = useKV<ConversationEntry[]>('intelligence-conversations', [])
  const [currentResponse, setCurrentResponse] = useState<ConversationEntry | null>(null)
  const [activeTab, setActiveTab] = useState('interface')
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [domainSheetOpen, setDomainSheetOpen] = useState(false)

  const searchResults = searchQuery ? searchKnowledgeBase(searchQuery, selectedDomains.length > 0 ? selectedDomains : undefined) : []
  const filteredResults = selectedLevel === 'all' ? searchResults : searchResults.filter(entry => entry.level === selectedLevel)

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    )
  }

  const generateResponse = async () => {
    if (!query.trim()) return

    setIsThinking(true)
    setCurrentResponse(null)

    try {
      const selectedDomainNames = selectedDomains.map(id => 
        domains.find(d => d.id === id)?.name
      ).filter(Boolean) as string[]

      // Get relevant knowledge entries to inform the response
      const relevantEntries = searchQuery ? 
        searchKnowledgeBase(query, selectedDomains.length > 0 ? selectedDomains : undefined).slice(0, 3) : []

      const knowledgeContext = relevantEntries.length > 0 ? 
        `\n\nRelevant expert knowledge from database:\n${relevantEntries.map(entry => 
          `${entry.title} (${entry.level}): ${entry.content.substring(0, 500)}...`
        ).join('\n\n')}` : ''

      const prompt = (window as any).spark.llmPrompt`You are a hyper-intelligent polymathic AI with PhD-level expertise across multiple domains. You have access to a comprehensive knowledge database with expert-level content.

User Query: ${query}
Selected Domains: ${selectedDomainNames.join(', ') || 'All domains'}${knowledgeContext}

Provide a sophisticated, PhD-level response that demonstrates deep understanding and makes connections across the specified domains. If multiple domains are selected, explicitly show how they interconnect. Be intellectually rigorous but accessible.

Structure your response with:
1. Direct answer/analysis
2. Cross-domain connections (if applicable)  
3. Deeper implications or philosophical considerations
4. Questions for further exploration

Maintain academic rigor while being engaging and insightful. Reference the expert knowledge when relevant.`

      const response = await (window as any).spark.llm(prompt, 'gpt-4o')

      const reflectionPrompt = (window as any).spark.llmPrompt`Reflect on this response you just provided: "${response}"

As a meta-cognitive AI, analyze:
1. What reasoning patterns did you use?
2. What connections between domains were most significant?
3. What assumptions or limitations might exist in this analysis?
4. How could this thinking be extended or refined?

Provide a brief meta-commentary on your own reasoning process.`

      const reflection = await (window as any).spark.llm(reflectionPrompt, 'gpt-4o')

      const newConversation: ConversationEntry = {
        id: Date.now().toString(),
        query,
        response,
        domains: selectedDomains,
        timestamp: Date.now(),
        reflection
      }

      setCurrentResponse(newConversation)
      setConversations(prev => [newConversation, ...(prev || [])])
      setQuery('')
    } catch (error) {
      console.error('Error generating response:', error)
    } finally {
      setIsThinking(false)
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'undergraduate': return <BookOpen size={16} className="text-blue-400" />
      case 'graduate': return <GraduationCap size={16} className="text-purple-400" />
      case 'phd': return <Brain size={16} className="text-cyan-400" />
      case 'research': return <Lightbulb size={16} className="text-yellow-400" />
      default: return <BookOpen size={16} />
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'undergraduate': return 'secondary'
      case 'graduate': return 'outline'  
      case 'phd': return 'default'
      case 'research': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen neural-bg">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Network size={isMobile ? 32 : 48} className="text-accent" />
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Polymathic Intelligence
            </h1>
          </div>
          <p className="text-sm sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            A hyper-intelligent synthetic cognitive system with PhD-level expertise across 
            computer science, quantum physics, mathematics, psychology, music theory, and philosophy
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-4 sm:mb-6 ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4'}`}>
            <TabsTrigger value="interface" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Brain size={isMobile ? 16 : 18} />
              {isMobile ? 'Chat' : 'Cognitive Interface'}
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BookOpen size={isMobile ? 16 : 18} />
              {isMobile ? 'Knowledge' : 'Knowledge Base'}
            </TabsTrigger>
            <TabsTrigger value="papers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText size={isMobile ? 16 : 18} />
              {isMobile ? 'Papers' : 'Research Papers'}
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Stack size={isMobile ? 16 : 18} />
              {isMobile ? 'Explore' : 'Domain Explorer'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interface" className="space-y-0">
            <div className={`grid gap-4 sm:gap-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
              {isMobile ? (
                <Sheet open={domainSheetOpen} onOpenChange={setDomainSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full mb-4 justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkle className="text-accent" size={18} />
                        {selectedDomains.length === 0 
                          ? 'Select Knowledge Domains' 
                          : `${selectedDomains.length} Domain${selectedDomains.length > 1 ? 's' : ''} Selected`}
                      </div>
                      <List size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Sparkle className="text-accent" />
                        Knowledge Domains
                      </SheetTitle>
                      <SheetDescription>
                        Select domains for interdisciplinary analysis
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(80vh-120px)] mt-4">
                      <div className="space-y-3 pr-4">
                        {domains.map((domain) => {
                          const Icon = domain.icon
                          const isSelected = selectedDomains.includes(domain.id)
                          return (
                            <motion.div
                              key={domain.id}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card 
                                className={`cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border hover:border-muted-foreground'
                                }`}
                                onClick={() => handleDomainToggle(domain.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <Icon size={24} className={domain.color} />
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm">{domain.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {domain.description}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                    {selectedDomains.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap gap-2">
                          {selectedDomains.map(domainId => {
                            const domain = domains.find(d => d.id === domainId)
                            return (
                              <Badge key={domainId} variant="secondary" className="text-xs">
                                {domain?.name}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              ) : (
                <div className="lg:col-span-1 space-y-6">
                  <Card className="domain-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkle className="text-accent" />
                        Knowledge Domains
                      </CardTitle>
                      <CardDescription>
                        Select domains for interdisciplinary analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {domains.map((domain) => {
                        const Icon = domain.icon
                        const isSelected = selectedDomains.includes(domain.id)
                        return (
                          <motion.div
                            key={domain.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                              onClick={() => handleDomainToggle(domain.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Icon size={24} className={domain.color} />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">{domain.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {domain.description}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {selectedDomains.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="domain-card">
                        <CardHeader>
                          <CardTitle className="text-sm">Active Domains</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedDomains.map(domainId => {
                              const domain = domains.find(d => d.id === domainId)
                              return (
                                <Badge key={domainId} variant="secondary" className="text-xs">
                                  {domain?.name}
                                </Badge>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              )}

              <div className={`space-y-4 sm:space-y-6 ${isMobile ? '' : 'lg:col-span-2'}`}>
                <Card className="domain-card">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Cognitive Interface</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Engage with polymathic intelligence across multiple domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask a complex question that spans multiple domains of knowledge..."
                      className="min-h-[100px] sm:min-h-[120px] bg-background/50 border-border text-sm sm:text-base"
                      disabled={isThinking}
                    />
                    <Button 
                      onClick={generateResponse}
                      disabled={!query.trim() || isThinking}
                      className="w-full"
                      size={isMobile ? 'default' : 'lg'}
                    >
                      {isThinking ? (
                        <div className="flex items-center gap-2">
                          <div className="thinking-indicator w-4 h-4 rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Brain size={isMobile ? 18 : 20} />
                          Engage Intelligence
                          <ArrowRight size={isMobile ? 18 : 20} />
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <AnimatePresence>
                  {currentResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="domain-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="text-accent" />
                            Synthesis Response
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {currentResponse.domains.map(domainId => {
                              const domain = domains.find(d => d.id === domainId)
                              return (
                                <Badge key={domainId} variant="outline" className="text-xs">
                                  {domain?.name}
                                </Badge>
                              )
                            })}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-background/30 rounded-lg p-4 border border-border">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Query:</p>
                            <p className="text-foreground">{currentResponse.query}</p>
                          </div>
                          
                          <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                              {currentResponse.response}
                            </div>
                          </div>

                          {currentResponse.reflection && (
                            <>
                              <Separator className="my-6" />
                              <div className="bg-secondary/20 rounded-lg p-4 border border-secondary/30">
                                <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                                  <Network size={16} />
                                  Meta-Cognitive Reflection
                                </h4>
                                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                  {currentResponse.reflection}
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(conversations?.length || 0) > 0 && !currentResponse && (
                  <Card className="domain-card">
                    <CardHeader>
                      <CardTitle>Previous Explorations</CardTitle>
                      <CardDescription>
                        Recent intellectual discourse and synthesis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(conversations || []).slice(0, 3).map((conv) => (
                        <motion.div
                          key={conv.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-background/30 rounded-lg border border-border hover:border-muted-foreground transition-colors cursor-pointer"
                          onClick={() => setCurrentResponse(conv)}
                        >
                          <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                            {conv.query}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {conv.domains.slice(0, 3).map(domainId => {
                                const domain = domains.find(d => d.id === domainId)
                                return (
                                  <Badge key={domainId} variant="outline" className="text-xs">
                                    {domain?.name}
                                  </Badge>
                                )
                              })}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(conv.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4 sm:space-y-6">
            <Card className="domain-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MagnifyingGlass className="text-accent" />
                  Knowledge Database Search
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Explore expert-level content across all domains
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex gap-2 sm:gap-4 ${isMobile ? 'flex-col' : ''}`}>
                  <div className="flex-1">
                    <Input
                      placeholder="Search knowledge base..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className={isMobile ? 'w-full' : 'w-48'}>
                      <SelectValue placeholder="Filter by level" />
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

                {selectedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Filtering by domains:</span>
                    {selectedDomains.map(domainId => {
                      const domain = domains.find(d => d.id === domainId)
                      return (
                        <Badge key={domainId} variant="secondary" className="text-xs">
                          {domain?.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {searchQuery && (
              <Card className="domain-card">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Search Results ({filteredResults.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className={isMobile ? 'h-[60vh]' : 'h-96'}>
                    <div className="space-y-3 sm:space-y-4">
                      {filteredResults.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="knowledge-card p-3 sm:p-4 bg-background/30 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{entry.title}</h4>
                            <div className="flex items-center gap-2">
                              {getLevelIcon(entry.level)}
                              <Badge variant={getLevelBadgeVariant(entry.level)} className="text-xs level-indicator">
                                {entry.level}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-3">
                            {entry.content.substring(0, 200)}...
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="papers" className="space-y-6">
            <PaperAnalyzer domains={domains} />
          </TabsContent>

          <TabsContent value="explorer" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Object.entries(knowledgeBases).map(([domainId, domainData]) => {
                const domain = domains.find(d => d.id === domainId)
                const Icon = domain?.icon || BookOpen
                return (
                  <Card key={domainId} className="domain-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Icon size={20} className={domain?.color || 'text-foreground'} />
                        {domain?.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {domainData.entries.length} expert articles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium mb-2">Fundamentals</h5>
                        <div className="flex flex-wrap gap-1">
                          {domainData.fundamentals.slice(0, 3).map(topic => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium mb-2">Research Frontiers</h5>
                        <div className="flex flex-wrap gap-1">
                          {domainData.researchFrontiers.slice(0, 2).map(topic => (
                            <Badge key={topic} variant="destructive" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedDomains([domainId])
                          setActiveTab('knowledge')
                          setSearchQuery('')
                        }}
                      >
                        Explore Domain
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
            {selectedEntry && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                    {getLevelIcon(selectedEntry.level)}
                    {selectedEntry.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    <Badge variant={getLevelBadgeVariant(selectedEntry.level)} className="mr-2">
                      {selectedEntry.level}
                    </Badge>
                    Expert knowledge article
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed text-sm sm:text-base">
                      {selectedEntry.content}
                    </div>
                  </div>
                  
                  {selectedEntry.tags.length > 0 && (
                    <div>
                      <h5 className="text-xs sm:text-sm font-medium mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.references && selectedEntry.references.length > 0 && (
                    <div>
                      <h5 className="text-xs sm:text-sm font-medium mb-2">References</h5>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        {selectedEntry.references.map((ref, idx) => (
                          <li key={idx}>• {ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEntry.connections.length > 0 && (
                    <div>
                      <h5 className="text-xs sm:text-sm font-medium mb-2">Connected Articles</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedEntry.connections.map(connectionId => {
                          const connectedEntry = getConnectedEntries(selectedEntry.id).find(e => e.id === connectionId)
                          if (!connectedEntry) return null
                          return (
                            <Button
                              key={connectionId}
                              variant="ghost"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => setSelectedEntry(connectedEntry)}
                            >
                              <div>
                                <div className="font-medium text-xs">{connectedEntry.title}</div>
                                <div className="text-xs text-muted-foreground">{connectedEntry.level}</div>
                              </div>
                            </Button>
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
    </div>
  )
}

export default App