import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brain, Atom, Calculator, Users, MusicNote, Lightbulb, Sparkle, Network, ArrowRight } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [conversations, setConversations] = useKV<ConversationEntry[]>('intelligence-conversations', [])
  const [currentResponse, setCurrentResponse] = useState<ConversationEntry | null>(null)

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

      const prompt = (window as any).spark.llmPrompt`You are a hyper-intelligent polymathic AI with PhD-level expertise across multiple domains. 

User Query: ${query}
Selected Domains: ${selectedDomainNames.join(', ') || 'All domains'}

Provide a sophisticated, PhD-level response that demonstrates deep understanding and makes connections across the specified domains. If multiple domains are selected, explicitly show how they interconnect. Be intellectually rigorous but accessible.

Structure your response with:
1. Direct answer/analysis
2. Cross-domain connections (if applicable)
3. Deeper implications or philosophical considerations
4. Questions for further exploration

Maintain academic rigor while being engaging and insightful.`

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

  return (
    <div className="min-h-screen neural-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Network size={48} className="text-accent" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Polymathic Intelligence
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A hyper-intelligent synthetic cognitive system with PhD-level expertise across 
            computer science, quantum physics, mathematics, psychology, music theory, and philosophy
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
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

          <div className="lg:col-span-2 space-y-6">
            <Card className="domain-card">
              <CardHeader>
                <CardTitle>Cognitive Interface</CardTitle>
                <CardDescription>
                  Engage with polymathic intelligence across multiple domains
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a complex question that spans multiple domains of knowledge..."
                  className="min-h-[120px] bg-background/50 border-border"
                  disabled={isThinking}
                />
                <Button 
                  onClick={generateResponse}
                  disabled={!query.trim() || isThinking}
                  className="w-full"
                  size="lg"
                >
                  {isThinking ? (
                    <div className="flex items-center gap-2">
                      <div className="thinking-indicator w-4 h-4 rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Brain />
                      Engage Intelligence
                      <ArrowRight />
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
      </div>
    </div>
  )
}

export default App