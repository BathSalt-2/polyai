// Expert-level knowledge databases for each domain
export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  level: 'undergraduate' | 'graduate' | 'phd' | 'research'
  tags: string[]
  connections: string[] // IDs of related entries
  references?: string[]
  relevanceScore?: number // For search results
}

export interface DomainKnowledge {
  domain: string
  entries: KnowledgeEntry[]
  fundamentals: string[]
  advancedTopics: string[]
  researchFrontiers: string[]
}

// Computer Science & AI Knowledge Base
export const computerScienceKB: DomainKnowledge = {
  domain: 'computer-science',
  fundamentals: ['algorithms', 'data-structures', 'complexity-theory', 'programming-paradigms'],
  advancedTopics: ['machine-learning', 'distributed-systems', 'formal-verification', 'quantum-computing'],
  researchFrontiers: ['artificial-general-intelligence', 'neuromorphic-computing', 'quantum-ml', 'conscious-ai'],
  entries: [
    {
      id: 'cs-001',
      title: 'Algorithmic Complexity Theory',
      content: `Computational complexity theory classifies computational problems according to their inherent difficulty. The fundamental complexity classes include:

P: Problems solvable in polynomial time by a deterministic Turing machine
NP: Problems whose solutions can be verified in polynomial time
PSPACE: Problems solvable using polynomial space
EXPTIME: Problems solvable in exponential time

The P vs NP problem remains the most significant open question in computer science. If P = NP, then every problem whose solution can be quickly verified can also be quickly solved, which would have profound implications for cryptography, optimization, and artificial intelligence.

Cook's theorem (1971) established that the Boolean satisfiability problem (SAT) is NP-complete, meaning all NP problems can be reduced to it in polynomial time. This discovery led to the identification of thousands of NP-complete problems across diverse fields.

Advanced concepts include the polynomial hierarchy (PH), interactive proof systems (IP), and probabilistically checkable proofs (PCP). The PCP theorem connects complexity theory to approximation algorithms, showing that certain optimization problems cannot be approximated within constant factors unless P = NP.`,
      level: 'phd',
      tags: ['complexity-theory', 'algorithms', 'theoretical-cs', 'np-complete'],
      connections: ['cs-002', 'cs-003', 'math-001'],
      references: ['Cook, S. (1971). The complexity of theorem-proving procedures', 'Arora, S. & Barak, B. (2009). Computational Complexity: A Modern Approach']
    },
    {
      id: 'cs-002',
      title: 'Neural Network Architectures and Deep Learning',
      content: `Deep learning has revolutionized artificial intelligence through sophisticated neural network architectures. Key architectures include:

Convolutional Neural Networks (CNNs): Utilize convolution operations to process grid-like data. The convolution operation preserves spatial relationships and reduces parameters through weight sharing. Advanced architectures like ResNet introduce skip connections to address the vanishing gradient problem, enabling training of very deep networks (100+ layers).

Recurrent Neural Networks (RNNs): Process sequential data through hidden states that maintain memory. Long Short-Term Memory (LSTM) networks address the vanishing gradient problem in traditional RNNs through gating mechanisms (forget, input, output gates) that control information flow.

Transformer Architecture: Introduced the attention mechanism, allowing models to focus on relevant parts of input sequences. The multi-head attention mechanism computes attention weights in parallel across different representation subspaces. Position encodings provide sequence order information without recurrence.

The mathematical foundation involves optimization on high-dimensional non-convex loss surfaces. Gradient descent variants (Adam, RMSprop) adapt learning rates per parameter. Batch normalization normalizes layer inputs to accelerate training and improve stability.

Recent developments include Vision Transformers (ViTs), which apply transformer architecture to image recognition, and large language models like GPT and BERT that demonstrate emergent capabilities at scale.`,
      level: 'graduate',
      tags: ['deep-learning', 'neural-networks', 'machine-learning', 'ai'],
      connections: ['cs-003', 'cs-004', 'math-002', 'psych-001'],
      references: ['Goodfellow, I. et al. (2016). Deep Learning', 'Vaswani, A. et al. (2017). Attention Is All You Need']
    },
    {
      id: 'cs-003',
      title: 'Quantum Computing Algorithms',
      content: `Quantum computing leverages quantum mechanical phenomena to process information in fundamentally different ways from classical computers. Key quantum algorithms include:

Shor's Algorithm: Factors large integers in polynomial time using quantum Fourier transform. The algorithm exploits period finding in modular arithmetic. For RSA-2048, a fault-tolerant quantum computer with ~4000 logical qubits could break current cryptographic systems.

Grover's Algorithm: Provides quadratic speedup for unstructured search problems. Searches an unsorted database of N items in O(√N) time compared to classical O(N). Uses amplitude amplification through repeated application of the Grover operator.

Quantum Approximate Optimization Algorithm (QAOA): Tackles combinatorial optimization problems using parameterized quantum circuits. Alternates between problem and mixer Hamiltonians to evolve quantum states toward optimal solutions.

Variational Quantum Eigensolver (VQE): Computes ground state energies of molecular systems using hybrid quantum-classical optimization. Particularly promising for quantum chemistry applications and drug discovery.

The quantum advantage stems from superposition (qubits existing in linear combinations of basis states) and entanglement (non-local correlations between qubits). Quantum error correction is essential for fault-tolerant quantum computing, requiring hundreds of physical qubits per logical qubit.`,
      level: 'research',
      tags: ['quantum-computing', 'algorithms', 'quantum-algorithms', 'cryptography'],
      connections: ['quantum-001', 'quantum-002', 'math-003'],
      references: ['Nielsen, M. & Chuang, I. (2010). Quantum Computation and Quantum Information', 'Preskill, J. (2018). Quantum Computing in the NISQ era']
    },
    {
      id: 'cs-004',
      title: 'Artificial General Intelligence and Consciousness',
      content: `Artificial General Intelligence (AGI) represents the theoretical achievement of machine intelligence that matches or exceeds human cognitive abilities across all domains. Current research approaches include:

Cognitive Architectures: Frameworks like SOAR, ACT-R, and OpenCog attempt to model human-like reasoning through symbolic knowledge representation and rule-based inference systems.

Neural-Symbolic Integration: Combines the pattern recognition capabilities of neural networks with the interpretability and reasoning power of symbolic systems. Approaches include differentiable neural computers and neural module networks.

Meta-Learning: Enables AI systems to "learn how to learn" by developing algorithms that improve their learning efficiency across tasks. Few-shot learning and gradient-based meta-learning (MAML) are key techniques.

Consciousness in AI remains deeply controversial. Integrated Information Theory (IIT) proposes that consciousness corresponds to integrated information (Φ) in a system. Global Workspace Theory suggests consciousness emerges from information integration across specialized cognitive modules.

The hard problem of consciousness (David Chalmers) distinguishes between functional aspects (easy problems) and subjective experience (hard problem). Whether computational systems can achieve phenomenal consciousness remains an open question with profound implications for AI safety and ethics.

Current large language models exhibit emergent behaviors and apparent reasoning capabilities, but whether this constitutes genuine understanding or sophisticated pattern matching remains debated.`,
      level: 'research',
      tags: ['agi', 'consciousness', 'ai-safety', 'cognitive-science'],
      connections: ['psych-001', 'psych-002', 'phil-001', 'phil-002'],
      references: ['Chalmers, D. (1995). Facing Up to the Problem of Consciousness', 'Tegmark, M. (2017). Life 3.0: Being Human in the Age of Artificial Intelligence']
    }
  ]
}

// Quantum Physics Knowledge Base
export const quantumPhysicsKB: DomainKnowledge = {
  domain: 'quantum-physics',
  fundamentals: ['wave-particle-duality', 'uncertainty-principle', 'quantum-states', 'measurement'],
  advancedTopics: ['quantum-field-theory', 'quantum-entanglement', 'quantum-computing', 'quantum-gravity'],
  researchFrontiers: ['quantum-consciousness', 'many-worlds-interpretation', 'quantum-biology', 'quantum-spacetime'],
  entries: [
    {
      id: 'quantum-001',
      title: 'Quantum Entanglement and Bell\'s Theorem',
      content: `Quantum entanglement represents one of the most profound and counterintuitive aspects of quantum mechanics. When particles become entangled, their quantum states remain correlated regardless of spatial separation, leading Einstein to famously describe it as "spooky action at a distance."

Bell's Theorem (1964) provides a mathematical framework for testing local realism against quantum mechanics. Bell's inequality places upper bounds on correlations achievable by local hidden variable theories:

S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')| ≤ 2 (Bell's CHSH inequality)

Quantum mechanics predicts violations up to S = 2√2 ≈ 2.83, demonstrating that no local hidden variable theory can reproduce quantum predictions.

Experimental tests using photon polarization measurements consistently violate Bell inequalities, confirming quantum mechanics and ruling out local realism. The 2022 Nobel Prize in Physics recognized Alain Aspect, John Clauser, and Anton Zeilinger for definitive Bell test experiments.

Quantum entanglement enables revolutionary applications:
- Quantum cryptography and secure communication through quantum key distribution
- Quantum teleportation for transferring quantum states
- Enhanced precision in quantum sensing and metrology
- Quantum error correction in quantum computing

The many-worlds interpretation suggests entanglement creates branching parallel universes, while the Copenhagen interpretation maintains that measurement causes wavefunction collapse. These interpretational differences highlight deep questions about the nature of reality.`,
      level: 'graduate',
      tags: ['quantum-entanglement', 'bells-theorem', 'quantum-mechanics', 'nonlocality'],
      connections: ['quantum-002', 'quantum-003', 'phil-003'],
      references: ['Bell, J.S. (1964). On the Einstein Podolsky Rosen Paradox', 'Aspect, A. (1982). Bell\'s Theorem Tests']
    },
    {
      id: 'quantum-002',
      title: 'Quantum Field Theory and Standard Model',
      content: `Quantum Field Theory (QFT) provides the theoretical framework for understanding fundamental particles and forces. Fields are fundamental; particles emerge as quantized excitations of these fields.

The Standard Model of particle physics describes three of the four fundamental forces through gauge theories:

Quantum Electrodynamics (QED): Describes electromagnetic interactions through photon exchange. The QED Lagrangian exhibits U(1) gauge symmetry, with the gauge field corresponding to the photon.

Quantum Chromodynamics (QCD): Describes strong nuclear force through gluon exchange between quarks. QCD exhibits SU(3) gauge symmetry with eight gluon fields. Asymptotic freedom means strong coupling decreases at high energies.

Electroweak Theory: Unifies electromagnetic and weak nuclear forces through SU(2)×U(1) gauge symmetry, broken by the Higgs mechanism to give masses to W and Z bosons.

Key QFT concepts include:
- Feynman diagrams as computational tools for perturbative calculations
- Renormalization to handle infinite quantities in loop corrections
- Spontaneous symmetry breaking through the Higgs mechanism
- Virtual particles as internal lines in Feynman diagrams

The hierarchy problem questions why the Higgs mass is much smaller than the Planck scale. Supersymmetry, extra dimensions, and composite Higgs models attempt to resolve this issue.

Quantum gravity remains beyond the Standard Model. String theory, loop quantum gravity, and causal dynamical triangulation represent different approaches to quantizing general relativity.`,
      level: 'phd',
      tags: ['quantum-field-theory', 'standard-model', 'particle-physics', 'gauge-theory'],
      connections: ['quantum-003', 'math-004', 'phil-004'],
      references: ['Peskin, M. & Schroeder, D. (1995). An Introduction to Quantum Field Theory', 'Weinberg, S. (1995). The Quantum Theory of Fields']
    },
    {
      id: 'quantum-003',
      title: 'Quantum Measurement Problem and Interpretations',
      content: `The quantum measurement problem addresses the apparent contradiction between the unitary evolution of quantum states and the non-unitary collapse during measurement. This represents one of the deepest unresolved issues in quantum mechanics.

The problem arises from the Schrödinger equation's deterministic, reversible evolution conflicting with measurement's probabilistic, irreversible outcomes. If quantum mechanics is complete, when and why does wavefunction collapse occur?

Major interpretations include:

Copenhagen Interpretation: Measurement causes instantaneous wavefunction collapse to definite states. The measurement apparatus creates a classical-quantum boundary, but the location of this boundary remains ambiguous.

Many-Worlds Interpretation (MWI): All possible measurement outcomes occur in parallel branches of the universal wavefunction. No collapse occurs; apparent randomness emerges from decoherence and the Born rule. This interpretation faces the preferred basis problem and measure problem.

Hidden Variable Theories: Quantum mechanics is incomplete; additional variables determine measurement outcomes. Bell's theorem rules out local hidden variables, but non-local theories like Bohmian mechanics remain viable.

Objective Collapse Theories: Modify Schrödinger evolution to include spontaneous collapse mechanisms. Examples include GRW theory and continuous spontaneous localization (CSL). These theories make testable predictions about deviations from standard quantum mechanics.

QBism (Quantum Bayesianism): Treats quantum states as subjective beliefs about measurement outcomes rather than objective physical properties. This interpretation eliminates the measurement problem by denying objective quantum states.

The measurement problem connects to consciousness studies through proposals that conscious observation triggers collapse. However, most physicists reject consciousness-based interpretations due to lack of empirical support.`,
      level: 'research',
      tags: ['measurement-problem', 'quantum-interpretations', 'consciousness', 'philosophy-of-physics'],
      connections: ['psych-002', 'phil-001', 'phil-003'],
      references: ['Wheeler, J.A. & Zurek, W.H. (1983). Quantum Theory and Measurement', 'Barrett, J. (1999). The Quantum Mechanics of Minds and Worlds']
    }
  ]
}

// Mathematics Knowledge Base
export const mathematicsKB: DomainKnowledge = {
  domain: 'mathematics',
  fundamentals: ['analysis', 'algebra', 'topology', 'number-theory'],
  advancedTopics: ['differential-geometry', 'algebraic-topology', 'category-theory', 'mathematical-logic'],
  researchFrontiers: ['millennium-problems', 'geometric-langlands', 'mathematical-physics', 'computational-mathematics'],
  entries: [
    {
      id: 'math-001',
      title: 'Gödel\'s Incompleteness Theorems',
      content: `Gödel's Incompleteness Theorems represent fundamental limitations of formal mathematical systems, with profound implications for logic, computation, and philosophy of mathematics.

First Incompleteness Theorem (1931): Any consistent formal system capable of expressing basic arithmetic contains true statements that cannot be proven within the system. Formally, if F is a consistent formal system that can represent recursive functions, then there exists a sentence G such that neither G nor ¬G is provable in F.

Gödel's proof constructs a self-referential statement G that essentially says "this statement is not provable in system F." If G were provable, the system would be inconsistent. If G is not provable, then G is true but unprovable, demonstrating incompleteness.

Second Incompleteness Theorem: No consistent formal system can prove its own consistency. If F is consistent and can represent arithmetic, then F cannot prove Con(F), the statement asserting F's consistency.

The theorems demolish Hilbert's program, which sought to formalize all mathematics in a complete, consistent, decidable system. Key implications include:

- Computational limits: The halting problem's undecidability follows from Gödel's work
- AI limitations: No algorithmic system can capture all mathematical truth
- Philosophy of mind: Some argue human mathematical insight transcends mechanical computation

The proof technique (Gödel numbering) encodes syntactic objects as natural numbers, enabling mathematical statements to refer to themselves. This self-reference creates the paradoxical situation underlying incompleteness.

Modern developments include reverse mathematics, which studies which axioms are necessary for specific theorems, and the connection to computational complexity through proof complexity theory.`,
      level: 'graduate',
      tags: ['mathematical-logic', 'incompleteness', 'formal-systems', 'computability'],
      connections: ['cs-001', 'phil-002', 'math-002'],
      references: ['Gödel, K. (1931). Über formal unentscheidbare Sätze', 'Hofstadter, D. (1979). Gödel, Escher, Bach']
    },
    {
      id: 'math-002',
      title: 'Differential Geometry and General Relativity',
      content: `Differential geometry provides the mathematical framework for Einstein's general relativity, where spacetime is modeled as a curved four-dimensional manifold.

A manifold M is a set that locally resembles Euclidean space. Charts (homeomorphisms to open sets in ℝⁿ) provide coordinate systems. The collection of all charts forms an atlas, with smooth transition functions between overlapping charts defining a smooth manifold structure.

Tangent spaces TₚM at each point p ∈ M contain all possible velocity vectors of curves through p. The tangent bundle TM = ⋃ₚ∈ₘ TₚM carries the differential structure.

Riemannian metrics g assign inner products to tangent spaces, enabling measurement of distances and angles. Einstein's field equations relate the Ricci curvature tensor to the stress-energy tensor:

Gμν = Rμν - (1/2)gμνR = (8πG/c⁴)Tμν

Key curvature concepts include:
- Christoffel symbols Γᵏᵢⱼ encoding the connection
- Riemann curvature tensor Rᵏᵢⱼₗ measuring intrinsic curvature
- Ricci tensor Rᵢⱼ and scalar curvature R as contractions

The Einstein-Hilbert action S = ∫ R √|g| d⁴x provides a variational formulation. Solutions include:
- Schwarzschild metric describing black holes
- Friedmann-Lemaître-Robertson-Walker metrics for cosmology
- Kerr metric for rotating black holes

Advanced topics include fiber bundles for gauge theories, index theorems connecting topology to analysis, and string theory's requirement for extra dimensions. The Atiyah-Singer index theorem relates analytical data (dimensions of solution spaces) to topological invariants (characteristic classes).`,
      level: 'phd',
      tags: ['differential-geometry', 'general-relativity', 'manifolds', 'curvature'],
      connections: ['quantum-002', 'math-003', 'phil-004'],
      references: ['Lee, J. (2013). Introduction to Smooth Manifolds', 'Wald, R. (1984). General Relativity']
    },
    {
      id: 'math-003',
      title: 'Category Theory and Foundations',
      content: `Category theory provides a unifying language for mathematics, emphasizing relationships between mathematical structures rather than their internal details. It serves as an alternative foundation to set theory.

A category C consists of:
- Objects (often mathematical structures)
- Morphisms (structure-preserving maps between objects)
- Composition operation satisfying associativity
- Identity morphisms for each object

Key concepts include:
- Functors: Structure-preserving maps between categories F: C → D
- Natural transformations: Systematic ways to transform one functor into another
- Limits and colimits: Universal constructions generalizing products, coproducts, etc.

The Yoneda lemma establishes that objects are determined by their relationships to other objects. For any object A and functor F: C → Set, natural transformations from Hom(A,-) to F correspond bijectively to elements of F(A).

Topos theory extends category theory to provide foundations for mathematics. A topos is a category with sufficient structure to interpret higher-order logic. The topos of sets recovers classical mathematics, while other toposes model alternative logical systems.

Applications span mathematics:
- Algebraic topology: Homology and cohomology as functors
- Algebraic geometry: Schemes and morphisms
- Logic: Internal languages of toposes
- Computer science: Type theory and programming language semantics

Higher category theory studies categories with higher-dimensional morphisms. Homotopy type theory connects this to foundations, proposing that mathematical objects are homotopy types rather than sets.

Category theory's emphasis on morphisms over objects reflects a structural approach to mathematics, focusing on how things relate rather than what they are intrinsically.`,
      level: 'research',
      tags: ['category-theory', 'foundations', 'topos-theory', 'higher-categories'],
      connections: ['cs-004', 'math-001', 'phil-002'],
      references: ['Mac Lane, S. (1971). Categories for the Working Mathematician', 'Awodey, S. (2010). Category Theory']
    }
  ]
}

// Psychology Knowledge Base
export const psychologyKB: DomainKnowledge = {
  domain: 'psychology',
  fundamentals: ['cognitive-psychology', 'developmental-psychology', 'social-psychology', 'neuroscience'],
  advancedTopics: ['consciousness-studies', 'cognitive-neuroscience', 'psychometrics', 'clinical-psychology'],
  researchFrontiers: ['consciousness-theories', 'computational-psychiatry', 'neuroethics', 'ai-psychology'],
  entries: [
    {
      id: 'psych-001',
      title: 'Theories of Consciousness and the Hard Problem',
      content: `Consciousness represents the most profound mystery in psychology and neuroscience. The hard problem of consciousness (David Chalmers) distinguishes between functional aspects of mind (easy problems) and subjective experience (hard problem).

Easy problems include:
- Attention and working memory mechanisms
- Information integration across brain regions
- Behavioral responses to stimuli
- Sleep-wake cycles

The hard problem asks: Why do we have subjective, first-person experiences (qualia) rather than just processing information like sophisticated computers?

Major theories of consciousness:

Global Workspace Theory (GWT): Consciousness emerges when information becomes globally available across brain networks. The prefrontal cortex acts as a "global workspace" broadcasting information to multiple specialized modules.

Integrated Information Theory (IIT): Consciousness corresponds to integrated information (Φ) in a system. IIT provides mathematical measures of consciousness and predicts that some non-biological systems could be conscious.

Attention Schema Theory: Consciousness is the brain's schematic model of its own attention processes. We experience consciousness because the brain models and predicts its attentional states.

Higher-Order Thought Theory: Consciousness requires thoughts about thoughts. We're conscious of mental states when we have higher-order representations of them.

Predictive Processing: Consciousness emerges from the brain's predictive models of sensory input. The phenomenal self is the brain's model of itself as an agent within its predicted world model.

Neural correlates of consciousness (NCCs) include:
- Gamma oscillations (40-100 Hz) during conscious perception
- Recurrent processing between cortical areas
- Default mode network activity during rest
- Thalamo-cortical loops maintaining conscious states

The combination problem asks how micro-experiences combine into unified consciousness. Binding problem addresses how distributed neural processing creates unified percepts.`,
      level: 'graduate',
      tags: ['consciousness', 'hard-problem', 'global-workspace', 'integrated-information'],
      connections: ['cs-004', 'quantum-003', 'phil-001', 'psych-002'],
      references: ['Chalmers, D. (1995). Facing Up to the Problem of Consciousness', 'Tononi, G. (2008). Integrated Information Theory']
    },
    {
      id: 'psych-002',
      title: 'Cognitive Architecture and Information Processing',
      content: `Cognitive architecture describes the fixed structures and processes underlying human cognition. Multiple competing theories attempt to explain how the mind organizes and processes information.

ACT-R (Adaptive Control of Thought-Rational): Proposes that cognition emerges from interactions between specialized modules:
- Declarative memory: Stores factual knowledge as chunks
- Procedural memory: Contains production rules (if-then statements)
- Perceptual-motor modules: Interface with environment
- Goal stack: Maintains current objectives

Working memory capacity limits (Miller's 7±2) reflect attention and rehearsal constraints. Chunking overcomes these limits by grouping information into meaningful units.

Dual-Process Theory distinguishes between:
- System 1: Fast, automatic, intuitive processing
- System 2: Slow, controlled, analytical reasoning

Kahneman and Tversky's research on cognitive biases reveals systematic deviations from rational decision-making:
- Availability heuristic: Judging probability by ease of recall
- Representativeness heuristic: Judging similarity to prototypes
- Anchoring bias: Over-relying on first information received

Connectionist models use artificial neural networks to simulate cognitive processes. These models exhibit emergent properties like graceful degradation and content-addressable memory.

Embodied cognition theories argue that cognitive processes are deeply rooted in physical interactions with the environment. Mental concepts are grounded in sensorimotor experiences.

Executive function involves:
- Inhibitory control: Suppressing inappropriate responses
- Working memory updating: Maintaining and manipulating information
- Cognitive flexibility: Switching between task sets

Modern cognitive neuroscience uses neuroimaging (fMRI, EEG, MEG) to map cognitive processes to neural substrates, revealing the distributed nature of cognitive functions.`,
      level: 'graduate',
      tags: ['cognitive-architecture', 'working-memory', 'dual-process', 'executive-function'],
      connections: ['cs-002', 'psych-003', 'phil-001'],
      references: ['Anderson, J.R. (2007). How Can the Human Mind Occur in the Physical Universe?', 'Kahneman, D. (2011). Thinking, Fast and Slow']
    },
    {
      id: 'psych-003',
      title: 'Developmental Psychology and Learning Theory',
      content: `Developmental psychology studies how cognitive, emotional, and social capabilities emerge and change across the lifespan. Learning theories explain how organisms acquire new behaviors and knowledge.

Piaget's Cognitive Development Theory proposes four stages:
1. Sensorimotor (0-2 years): Object permanence develops
2. Preoperational (2-7 years): Symbolic thinking emerges, but thinking is egocentric
3. Concrete operational (7-11 years): Logical thinking about concrete objects
4. Formal operational (11+ years): Abstract and hypothetical reasoning

Vygotsky's Sociocultural Theory emphasizes social interaction in cognitive development. The Zone of Proximal Development (ZPD) represents the gap between what a child can do alone versus with assistance. Scaffolding provides temporary support structures for learning.

Attachment Theory (Bowlby) describes emotional bonds between children and caregivers. Secure attachment provides a foundation for emotional regulation and social relationships. Strange Situation experiments reveal different attachment styles affecting later development.

Learning theories include:

Classical Conditioning (Pavlov): Associating neutral stimuli with unconditioned stimuli to produce conditioned responses. Demonstrates how reflexive behaviors can be modified through experience.

Operant Conditioning (Skinner): Behavior is shaped by consequences. Reinforcement increases behavior frequency; punishment decreases it. Schedules of reinforcement affect learning patterns and extinction rates.

Social Learning Theory (Bandura): Learning occurs through observation, imitation, and modeling. The Bobo doll experiments demonstrated that children learn aggressive behaviors by watching adults.

Cognitive Load Theory: Learning is constrained by working memory limitations. Instructional design should minimize extraneous load while maximizing germane processing.

Critical periods for language acquisition (Lenneberg) suggest biological constraints on learning. The case of Genie, a severely isolated child, supports the critical period hypothesis for first language acquisition.

Modern research emphasizes neuroplasticity - the brain's ability to reorganize throughout life. Epigenetic mechanisms show how environmental factors influence gene expression and neural development.`,
      level: 'undergraduate',
      tags: ['developmental-psychology', 'learning-theory', 'attachment', 'neuroplasticity'],
      connections: ['cs-002', 'psych-002', 'music-001'],
      references: ['Piaget, J. (1952). The Origins of Intelligence in Children', 'Vygotsky, L.S. (1978). Mind in Society']
    }
  ]
}

// Music Theory Knowledge Base  
export const musicTheoryKB: DomainKnowledge = {
  domain: 'music-theory',
  fundamentals: ['harmony', 'rhythm', 'melody', 'form'],
  advancedTopics: ['counterpoint', 'analysis', 'composition', 'acoustics'],
  researchFrontiers: ['music-cognition', 'algorithmic-composition', 'psychoacoustics', 'computational-musicology'],
  entries: [
    {
      id: 'music-001',
      title: 'Harmonic Theory and Voice Leading',
      content: `Harmonic theory analyzes how chords function within tonal contexts and how individual voices move between harmonies. Voice leading principles govern smooth melodic motion in each voice while creating compelling harmonic progressions.

Functional Harmony categorizes chords by their role in establishing and resolving tonal centers:
- Tonic function: Provides stability and resolution (I, vi, iii in major)
- Predominant function: Prepares dominant arrival (ii, IV, vi in major)  
- Dominant function: Creates tension requiring tonic resolution (V, vii° in major)

The Circle of Fifths illustrates harmonic relationships through perfect fifth intervals. Moving clockwise adds sharps; counterclockwise adds flats. This pattern reflects the harmonic series and explains why certain progressions sound natural.

Voice Leading Principles:
- Stepwise motion preferred over leaps
- Avoid parallel fifths and octaves between voices
- Resolve leading tones upward, chordal sevenths downward
- Common tones should remain in the same voice when possible

Counterpoint techniques from Bach demonstrate sophisticated voice independence:
- Species counterpoint provides systematic training in two-voice writing
- Invertible counterpoint allows voices to exchange positions
- Canon and fugue represent the pinnacle of contrapuntal composition

Extended Harmony incorporates chromatic alterations and non-chord tones:
- Secondary dominants temporarily tonicize other keys (V/V, V/vi, etc.)
- Neapolitan sixth chords (♭II6) provide colorful predominant function
- Augmented sixth chords create strong dominant preparation through chromatic voice leading

Jazz harmony further extends these principles:
- Chord extensions (9ths, 11ths, 13ths) add color without changing function
- Tritone substitution replaces V7 with ♭II7 sharing the same tritone
- Modal interchange borrows chords from parallel modes

Neo-Riemannian theory analyzes chromatic harmony through transformational operations (P, L, R) that preserve common tones while changing harmonic quality.`,
      level: 'graduate',
      tags: ['harmony', 'voice-leading', 'counterpoint', 'functional-harmony'],
      connections: ['music-002', 'music-003', 'math-004'],
      references: ['Schenker, H. (1935). Der freie Satz', 'Aldwell, E. & Schachter, C. (2011). Harmony and Voice Leading']
    },
    {
      id: 'music-002',
      title: 'Rhythm, Meter, and Musical Time',
      content: `Rhythm and meter organize musical time through patterns of duration, accent, and grouping. These temporal structures create the foundation for musical expression and listener engagement.

Meter establishes regular patterns of strong and weak beats:
- Simple meters divide beats into two equal parts (2/4, 3/4, 4/4)
- Compound meters divide beats into three equal parts (6/8, 9/8, 12/8)
- Irregular meters use asymmetric groupings (5/4, 7/8, 11/16)

Rhythmic hierarchy creates multiple levels of temporal organization:
- Surface rhythm: Note-to-note durations and articulations
- Hypermeter: Patterns of strong and weak measures
- Phrase rhythm: Grouping of measures into larger units

Syncopation displaces expected accents, creating tension against the underlying meter. Jazz extensively exploits syncopation through:
- Off-beat emphasis (placing accents on weak beats)
- Cross-rhythm (superimposing different metric patterns)
- Polyrhythm (simultaneous different rhythmic patterns)

African musical traditions contributed sophisticated polyrhythmic concepts to jazz and popular music. West African music often layers multiple independent rhythmic patterns that interlock to create complex composite rhythms.

Metric modulation (Elliott Carter) changes tempo through proportional relationships. A note value in the old tempo becomes a different note value in the new tempo, creating smooth metric transitions.

Psychological aspects of rhythm include:
- Beat induction: How listeners extract regular pulses from musical stimuli
- Entrainment: Synchronization of neural oscillations to musical rhythms
- Groove: Subtle timing variations that enhance rhythmic feel

Computational rhythm analysis uses onset detection algorithms to identify rhythmic events and extract tempo, meter, and rhythmic patterns from audio signals. Machine learning approaches can classify rhythmic styles and generate rhythmic variations.

Cultural variations in rhythmic perception affect how different populations process complex meters and syncopation patterns.`,
      level: 'graduate',
      tags: ['rhythm', 'meter', 'syncopation', 'polyrhythm'],
      connections: ['music-003', 'psych-003', 'cs-002'],
      references: ['London, J. (2004). Hearing in Time', 'Hasty, C. (1997). Meter as Rhythm']
    },
    {
      id: 'music-003',
      title: 'Acoustic Foundations and Psychoacoustics',
      content: `Musical acoustics and psychoacoustics explain how physical sound waves become musical experiences through auditory processing and cognitive interpretation.

Sound Wave Properties:
- Frequency determines pitch perception (A4 = 440 Hz by convention)
- Amplitude correlates with loudness perception
- Waveform shape affects timbre and harmonic content
- Phase relationships influence stereo imaging and acoustic interactions

The Harmonic Series provides the physical basis for consonance and dissonance:
- Fundamental frequency f₀ with overtones at 2f₀, 3f₀, 4f₀, etc.
- Simple frequency ratios (2:1 octave, 3:2 perfect fifth) sound consonant
- Complex ratios create beats and roughness perceived as dissonance

Equal Temperament divides the octave into 12 equal semitones (12√2 ≈ 1.059463 ratio). This compromise tuning system enables modulation to any key but makes all intervals except octaves acoustically impure.

Alternative tuning systems include:
- Just intonation: Uses pure frequency ratios (5:4 major third = 386 cents)
- Pythagorean tuning: Based on perfect fifths (3:2 ratio)
- Microtonal systems: Divide octaves into more than 12 pitches

Psychoacoustic phenomena shape musical perception:
- Critical bands: Frequency ranges within which tones interact perceptually
- Masking: Loud sounds obscure quieter sounds at nearby frequencies
- Phantom fundamental: Missing fundamental frequencies are perceptually restored
- Combination tones: Intermodulation products create additional perceived pitches

Spatial audio uses psychoacoustic cues for sound localization:
- Interaural time differences (ITD) for low frequencies
- Interaural level differences (ILD) for high frequencies  
- Head-related transfer functions (HRTF) for elevation and front/back discrimination

Digital audio processing applies these principles:
- Sampling theorem requires >2× highest frequency for accurate reproduction
- Psychoacoustic models enable perceptual audio compression (MP3, AAC)
- Convolution reverb recreates acoustic spaces through impulse responses

Music cognition research reveals how the auditory system extracts musical features like pitch, rhythm, and harmony from complex acoustic signals.`,
      level: 'phd',
      tags: ['acoustics', 'psychoacoustics', 'tuning-systems', 'digital-audio'],
      connections: ['math-002', 'psych-001', 'cs-003'],
      references: ['Rossing, T. (2007). The Science of Sound', 'Bregman, A. (1990). Auditory Scene Analysis']
    }
  ]
}

// Philosophy Knowledge Base
export const philosophyKB: DomainKnowledge = {
  domain: 'philosophy',
  fundamentals: ['metaphysics', 'epistemology', 'ethics', 'logic'],
  advancedTopics: ['philosophy-of-mind', 'philosophy-of-science', 'political-philosophy', 'aesthetics'],
  researchFrontiers: ['experimental-philosophy', 'computational-ethics', 'philosophy-of-ai', 'philosophy-of-physics'],
  entries: [
    {
      id: 'phil-001',
      title: 'The Mind-Body Problem and Consciousness',
      content: `The mind-body problem represents one of philosophy's most enduring questions: How does subjective, conscious experience relate to physical brain processes? This problem has profound implications for understanding human nature, artificial intelligence, and scientific methodology.

Historical positions include:

Substance Dualism (Descartes): Mind and body are distinct substances. The pineal gland was proposed as the interaction point, but this raises the interaction problem: How can immaterial mind affect physical matter?

Behaviorism (Ryle): Mental states are dispositions to behave in certain ways. Pain is the disposition to cry out, withdraw, etc. This eliminates the inner/outer distinction but struggles with absent qualia scenarios.

Identity Theory (Place, Smart): Mental states are identical to brain states. Pain just is C-fiber firing. This physicalist approach faces the multiple realizability objection: different species might realize pain through different neural mechanisms.

Functionalism (Putnam, Lewis): Mental states are defined by their causal roles rather than physical substrates. Pain is whatever state plays the pain-role (caused by damage, causes withdrawal, etc.). This allows multiple realizability but faces the absent qualia and spectrum inversion problems.

Eliminative Materialism (Churchlands): Folk psychology (beliefs, desires, consciousness) will be eliminated by mature neuroscience, just as vitalism was eliminated by biochemistry.

Property Dualism: Physical substances can have irreducible mental properties. David Chalmers argues that consciousness involves psychophysical laws connecting neural activity to subjective experience.

Panpsychism: Consciousness is a fundamental feature of reality, present even in elementary particles. Integrated Information Theory suggests a mathematical framework for this view.

The explanatory gap (Levine) highlights the difficulty of explaining why there is something it's like to have conscious experiences. Even complete neural explanations leave this qualitative aspect mysterious.

Contemporary debates involve:
- The hard problem of consciousness (Chalmers)
- Illusionism about consciousness (Dennett, Frankish)
- Predictive processing theories of mind
- Extended mind thesis (Clark, Chalmers)`,
      level: 'graduate',
      tags: ['mind-body-problem', 'consciousness', 'dualism', 'physicalism'],
      connections: ['psych-001', 'cs-004', 'quantum-003', 'phil-002'],
      references: ['Chalmers, D. (1996). The Conscious Mind', 'Kim, J. (2011). Philosophy of Mind']
    },
    {
      id: 'phil-002',
      title: 'Epistemology and the Nature of Knowledge',
      content: `Epistemology investigates the nature, sources, and limits of knowledge. Central questions include: What is knowledge? How is knowledge acquired? What makes beliefs justified?

The Traditional Analysis defines knowledge as justified true belief (JTB). However, Edmund Gettier (1963) showed that JTB is insufficient through counterexamples where someone has justified true belief that doesn't constitute knowledge.

Gettier Case Example: Smith believes "The person who will get the job has ten coins in his pocket" based on justified evidence that Jones will get the job and has ten coins. However, Smith gets the job and (unknowingly) has ten coins himself. Smith's belief is justified and true but seems not to constitute knowledge.

Responses to Gettier include:

Reliability Theory (Goldman): Knowledge requires beliefs formed through reliable processes. Perception and memory are generally reliable; guessing and wishful thinking are not.

Virtue Epistemology: Knowledge results from intellectual virtues like careful observation, critical thinking, and open-mindedness. Epistemic agents, not just beliefs, are the primary bearers of epistemic evaluation.

Contextualism: Knowledge attributions depend on conversational context. "I know the bank is open" might be true in casual conversation but false when discussing important financial decisions.

Skeptical Challenges question whether knowledge is possible:
- Cartesian skepticism: Evil demon scenarios where all experiences are illusory
- Brain-in-vat scenarios: Modern versions using Matrix-like simulations
- Regress problem: Justification seems to require infinite regress, circularity, or arbitrary stopping points

Foundationalism responds by identifying basic beliefs (sense experiences, logical truths) that don't require further justification. Coherentism instead requires beliefs to cohere with each other without basic foundations.

A priori vs. a posteriori knowledge:
- A priori: Known independently of experience (mathematical truths, logical principles)
- A posteriori: Known through experience (empirical facts)

Kant argued that synthetic a priori knowledge (like mathematics and metaphysical principles) is possible through mental structures that organize experience.

Contemporary issues include:
- Epistemic closure: If S knows p and knows that p implies q, does S know q?
- Epistemic injustice: How social power affects credibility and knowledge
- Disagreement among epistemic peers: What should we believe when experts disagree?`,
      level: 'graduate',
      tags: ['epistemology', 'knowledge', 'justification', 'skepticism'],
      connections: ['math-001', 'cs-001', 'phil-003', 'phil-004'],
      references: ['Gettier, E. (1963). Is Justified True Belief Knowledge?', 'Goldman, A. (1986). Epistemology and Cognition']
    },
    {
      id: 'phil-003',
      title: 'Philosophy of Science and Scientific Realism',
      content: `Philosophy of science examines the nature of scientific knowledge, methodology, and the relationship between scientific theories and reality. Key debates center on scientific realism versus anti-realism.

Scientific Realism maintains that:
- Scientific theories aim to describe objective reality
- Mature theories are approximately true
- Theoretical entities (electrons, quarks) exist independently of observation
- Scientific progress involves increasing approximation to truth

Anti-Realist Positions include:

Instrumentalism: Theories are tools for predicting observations rather than descriptions of reality. Theoretical entities are useful fictions.

Constructive Empiricism (van Fraassen): Science aims for empirical adequacy rather than truth. We should be agnostic about unobservable entities.

Social Constructivism: Scientific knowledge is shaped by social, cultural, and political factors rather than purely objective investigation.

The Underdetermination Problem: Multiple incompatible theories can account for the same observational evidence. How do we choose between empirically equivalent theories?

Kuhn's Structure of Scientific Revolutions argues that science progresses through paradigm shifts rather than cumulative knowledge accumulation. Normal science operates within paradigms, but revolutionary science overthrows them.

The No-Miracles Argument supports realism: The success of science would be miraculous unless theories were approximately true. However, the Pessimistic Meta-Induction notes that past successful theories (phlogiston, ether) are now considered false.

Inference to the Best Explanation suggests we should believe theories that best explain phenomena. Critics argue this commits the base rate fallacy and that explanatory virtues may not track truth.

Philosophy of specific sciences:

Physics: Interpretation of quantum mechanics, the nature of spacetime, laws of nature
Biology: Species concepts, levels of selection, reductionism vs. emergence
Psychology: Cognitive architecture, consciousness, folk psychology

Scientific Method debates include:
- Falsifiability (Popper): Scientific theories must be potentially falsifiable
- Confirmation theory: How evidence supports or disconfirms hypotheses
- Theory choice: Criteria for selecting between competing theories (simplicity, scope, fruitfulness)

Contemporary issues:
- Computer simulations as experiments
- Big data and theory-free science
- Reproducibility crisis
- Science and values: Value-free ideal vs. value-laden science`,
      level: 'graduate',
      tags: ['philosophy-of-science', 'scientific-realism', 'underdetermination', 'paradigm-shifts'],
      connections: ['quantum-003', 'cs-001', 'math-001', 'phil-004'],
      references: ['Kuhn, T. (1962). The Structure of Scientific Revolutions', 'van Fraassen, B. (1980). The Scientific Image']
    },
    {
      id: 'phil-004',
      title: 'Ethics and Moral Philosophy',
      content: `Ethics examines questions of right and wrong, good and evil, virtue and vice. Moral philosophy investigates the foundations of ethical judgments and provides frameworks for ethical decision-making.

Major Ethical Theories:

Consequentialism: Actions are right or wrong based solely on their consequences. Utilitarianism (Bentham, Mill) holds that actions should maximize overall happiness or well-being. Act utilitarianism evaluates each action individually; rule utilitarianism evaluates rules.

Deontological Ethics (Kant): Actions have intrinsic moral properties independent of consequences. The categorical imperative provides universal moral laws:
- Formula of Universal Law: Act only according to maxims you could will to be universal laws
- Formula of Humanity: Treat people as ends in themselves, never merely as means

Virtue Ethics (Aristotle): Focus on character traits rather than acts or consequences. Virtues are excellences of character developed through practice. The doctrine of the mean locates virtues between extremes of excess and deficiency.

Applied Ethics addresses specific moral issues:

Bioethics: Medical ethics, research ethics, end-of-life decisions, genetic engineering
Environmental Ethics: Intrinsic vs. instrumental value of nature, climate change obligations, future generations
Computer Ethics: Privacy, artificial intelligence, algorithmic bias, digital rights

Meta-Ethics investigates the nature of moral properties and judgments:

Moral Realism: Moral facts exist independently of what people believe about them. Murder is wrong regardless of cultural attitudes.

Anti-Realism includes:
- Error Theory (Mackie): Moral judgments are systematically false because they refer to non-existent properties
- Expressivism (Ayer, Stevenson): Moral judgments express emotions or attitudes rather than beliefs about facts
- Relativism: Moral truths are relative to cultures or individuals

The Is-Ought Problem (Hume): Descriptive facts about the world cannot logically entail prescriptive conclusions about what ought to be done.

Moral Psychology investigates the empirical basis of moral judgment:
- Kohlberg's stages of moral development
- Moral foundations theory (care, fairness, loyalty, authority, sanctity)
- Dual-process models of moral cognition
- Cultural variation in moral concepts

Contemporary Issues:
- Effective altruism: Using evidence to maximize moral impact
- AI ethics: Rights and responsibilities of artificial agents
- Global justice: Obligations across borders and generations
- Experimental philosophy: Empirical investigation of moral intuitions

The fact-value distinction questions whether scientific methods can address moral questions or whether ethics requires different methodologies.`,
      level: 'undergraduate',
      tags: ['ethics', 'moral-philosophy', 'consequentialism', 'deontology'],
      connections: ['cs-004', 'psych-002', 'phil-001', 'phil-002'],
      references: ['Mill, J.S. (1863). Utilitarianism', 'Kant, I. (1785). Groundwork for the Metaphysics of Morals']
    }
  ]
}

// Export all knowledge bases
export const knowledgeBases = {
  'computer-science': computerScienceKB,
  'quantum-physics': quantumPhysicsKB,
  'mathematics': mathematicsKB,
  'psychology': psychologyKB,
  'music-theory': musicTheoryKB,
  'philosophy': philosophyKB
}

// Utility functions for knowledge base operations
export function getKnowledgeEntry(domainId: string, entryId: string): KnowledgeEntry | undefined {
  const domain = knowledgeBases[domainId as keyof typeof knowledgeBases]
  return domain?.entries.find(entry => entry.id === entryId)
}

export function searchKnowledgeBase(query: string, domains?: string[]): KnowledgeEntry[] {
  const searchTerms = query.toLowerCase().split(' ')
  const results: KnowledgeEntry[] = []
  
  const domainsToSearch = domains || Object.keys(knowledgeBases)
  
  domainsToSearch.forEach(domainId => {
    const domain = knowledgeBases[domainId as keyof typeof knowledgeBases]
    if (domain) {
      domain.entries.forEach(entry => {
        const searchText = (entry.title + ' ' + entry.content + ' ' + entry.tags.join(' ')).toLowerCase()
        const matches = searchTerms.filter(term => searchText.includes(term))
        if (matches.length > 0) {
          results.push({ ...entry, relevanceScore: matches.length / searchTerms.length })
        }
      })
    }
  })
  
  return results.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)
}

export function getConnectedEntries(entryId: string): KnowledgeEntry[] {
  const connected: KnowledgeEntry[] = []
  
  Object.values(knowledgeBases).forEach(domain => {
    domain.entries.forEach(entry => {
      if (entry.connections.includes(entryId)) {
        connected.push(entry)
      }
    })
  })
  
  return connected
}

export function getEntriesByLevel(level: KnowledgeEntry['level'], domains?: string[]): KnowledgeEntry[] {
  const results: KnowledgeEntry[] = []
  const domainsToSearch = domains || Object.keys(knowledgeBases)
  
  domainsToSearch.forEach(domainId => {
    const domain = knowledgeBases[domainId as keyof typeof knowledgeBases]
    if (domain) {
      results.push(...domain.entries.filter(entry => entry.level === level))
    }
  })
  
  return results
}