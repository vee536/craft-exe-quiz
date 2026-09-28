import { Question, Team, JeopardyBoardConfig, EventState, Round2WagerState, Round3State } from '../types';

// 30 Teams for CRAFT.exe (30 -> 20 -> 10 -> 1)
export const INITIAL_30_TEAMS: Team[] = [
  { id: 'team-1', name: 'Team Redstone', score: 0, round1Score: 14, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-2', name: 'Team Netherite', score: 0, round1Score: 13, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-3', name: 'Team Obsidian', score: 0, round1Score: 13, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-4', name: 'Team EnderByte', score: 0, round1Score: 12, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-5', name: 'Team DiamondKernel', score: 0, round1Score: 12, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-6', name: 'Team CreeperCode', score: 0, round1Score: 11, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-7', name: 'Team BlazeStack', score: 0, round1Score: 11, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-8', name: 'Team VoidPointers', score: 0, round1Score: 11, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-9', name: 'Team GhastProtocol', score: 0, round1Score: 10, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-10', name: 'Team ShulkerShell', score: 0, round1Score: 10, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: true, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-11', name: 'Team ElytraPackets', score: 0, round1Score: 10, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-12', name: 'Team WitherSync', score: 0, round1Score: 9, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-13', name: 'Team BedrockMutex', score: 0, round1Score: 9, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-14', name: 'Team CopperLogic', score: 0, round1Score: 9, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-15', name: 'Team PrismarineHash', score: 0, round1Score: 8, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-16', name: 'Team AmethystQuery', score: 0, round1Score: 8, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-17', name: 'Team SculkSensor', score: 0, round1Score: 8, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-18', name: 'Team WardenThreat', score: 0, round1Score: 8, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-19', name: 'Team PistonPipeline', score: 0, round1Score: 7, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-20', name: 'Team IronGolemCI', score: 0, round1Score: 7, round2Score: 0, round3StartingScore: 0, isQualifiedR2: true, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  // Below Top 20 (R1 Eliminated unless qualified)
  { id: 'team-21', name: 'Team MagmaCube', score: 0, round1Score: 6, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-22', name: 'Team SlimeChunk', score: 0, round1Score: 6, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-23', name: 'Team Endermite', score: 0, round1Score: 5, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-24', name: 'Team PhantomDaemon', score: 0, round1Score: 5, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-25', name: 'Team DrownedSocket', score: 0, round1Score: 5, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-26', name: 'Team StrayThread', score: 0, round1Score: 4, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-27', name: 'Team HuskProcess', score: 0, round1Score: 4, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-28', name: 'Team VexMemory', score: 0, round1Score: 3, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-29', name: 'Team EvokerProxy', score: 0, round1Score: 3, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
  { id: 'team-30', name: 'Team RavagerCluster', score: 0, round1Score: 2, round2Score: 0, round3StartingScore: 0, isQualifiedR2: false, isFinalistR3: false, selectionTurnsTaken: 0, stealsCount: 0, blazeRodUsed: false },
];

export const INITIAL_CATEGORIES = [
  'Programming & Algorithms',
  'Cybersecurity & Cryptography',
  'DBMS & SQL',
  'AI & Machine Learning',
  'Cloud & Networks'
];

export const INITIAL_POINT_TIERS = [100, 200, 300, 400, 500];

// ROUND 1: 15 Main Questions (1 mark each, paper quiz)
export const ROUND_1_MAIN_QUESTIONS: Question[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `r1-main-${i + 1}`,
  category: 'Overworld Written Quiz',
  points: 1,
  difficulty: i < 5 ? 'Easy' : i < 10 ? 'Medium' : 'Hard',
  questionText: `[Question ${i + 1}/15] ${
    [
      'What is the time complexity of binary search on a sorted array of size n?',
      'Which layer of the OSI model handles end-to-end transport and flow control (TCP/UDP)?',
      'What does the ACID acronym stand for in relational database management systems?',
      'In Python, what is the data type resulting from dividing 4 / 2?',
      'Which HTTP response status code indicates "Unauthorized" access?',
      'What cryptographic principle ensures that a sender cannot deny having sent a message?',
      'In Git, what command records changes to the repository with an explanatory message?',
      'What data structure is typically used to implement Breadth-First Search (BFS)?',
      'Which SQL clause is used to eliminate duplicate rows from the query output?',
      'In modern operating systems, what is the condition where two processes wait indefinitely for resources held by each other?',
      'What port does unencrypted DNS typically use by default?',
      'Which CPU scheduling algorithm gives each process a small fixed unit of CPU time (time quantum)?',
      'In neural networks, what is the term for computing gradients backwards through layers?',
      'Which Linux command displays active processes and real-time CPU/memory utilization?',
      'In object-oriented programming, what principle allows a subclass to provide a specific implementation of a parent method?'
    ][i]
  }`,
  correctAnswer: [
    'O(log n)',
    'Layer 4 — Transport Layer',
    'Atomicity, Consistency, Isolation, Durability',
    'float (2.0)',
    '401 Unauthorized',
    'Non-repudiation',
    'git commit -m "message"',
    'Queue (FIFO)',
    'DISTINCT',
    'Deadlock',
    'Port 53 (UDP)',
    'Round Robin (RR)',
    'Backpropagation',
    'top / htop',
    'Polymorphism (Method Overriding)'
  ][i],
  isUsed: false,
}));

// ROUND 1: 5 Tie-Break Questions
export const ROUND_1_TIEBREAK_QUESTIONS: Question[] = [
  {
    id: 'r1-tie-1',
    category: 'R1 Tie-Breaker',
    points: 1,
    difficulty: 'Medium',
    questionText: '[Tie-Break 1/5] What is the difference between a process and a thread in modern operating systems?',
    correctAnswer: 'A process is an independent execution unit with its own virtual memory space; a thread is a lightweight execution stream within a process that shares memory.',
    isUsed: false,
  },
  {
    id: 'r1-tie-2',
    category: 'R1 Tie-Breaker',
    points: 1,
    difficulty: 'Medium',
    questionText: '[Tie-Break 2/5] In Python, what is the difference between `is` and `==`?',
    correctAnswer: '`==` checks for equality of values; `is` checks for object identity (exact memory location).',
    isUsed: false,
  },
  {
    id: 'r1-tie-3',
    category: 'R1 Tie-Breaker',
    points: 1,
    difficulty: 'Hard',
    questionText: '[Tie-Break 3/5] What is the purpose of the ARP (Address Resolution Protocol) in IPv4 networks?',
    correctAnswer: 'To map a known IPv4 network address to a physical MAC hardware address on a local area network.',
    isUsed: false,
  },
  {
    id: 'r1-tie-4',
    category: 'R1 Tie-Breaker',
    points: 1,
    difficulty: 'Hard',
    questionText: '[Tie-Break 4/5] Explain the concept of database normalization and its primary objective.',
    correctAnswer: 'Organizing database tables to minimize data redundancy and eliminate anomalies (insert, update, delete).',
    isUsed: false,
  },
  {
    id: 'r1-tie-5',
    category: 'R1 Tie-Breaker',
    points: 1,
    difficulty: 'Expert',
    questionText: '[Tie-Break 5/5] In asymmetric cryptography, how does digital signature verification prove authenticity and integrity?',
    correctAnswer: 'The sender signs a cryptographic hash with their private key; the receiver decrypts the signature with the sender\'s public key and verifies that the computed hash matches.',
    isUsed: false,
  }
];

// ROUND 1: 2 Emergency Questions
export const ROUND_1_EMERGENCY_QUESTIONS: Question[] = [
  {
    id: 'r1-emg-1',
    category: 'R1 Emergency',
    points: 1,
    difficulty: 'Hard',
    questionText: '[Emergency 1/2] What is the difference between TCP and UDP headers in terms of size and reliability overhead?',
    correctAnswer: 'TCP header is minimum 20 bytes (connection-oriented, checksums, sequence/ack numbers, retransmission); UDP header is 8 bytes (stateless, connectionless, lightweight).',
    isUsed: false,
  },
  {
    id: 'r1-emg-2',
    category: 'R1 Emergency',
    points: 1,
    difficulty: 'Expert',
    questionText: '[Emergency 2/2] In distributed systems, state the CAP Theorem trade-off during a network partition.',
    correctAnswer: 'Under a network partition (P), a distributed system must choose between serving consistent data (Consistency) or answering all requests (Availability).',
    isUsed: false,
  }
];

// ROUND 2: 8 Main Wager Questions (All 20 teams answer all 8 questions)
export const ROUND_2_MAIN_QUESTIONS: Question[] = [
  {
    id: 'r2-main-q1',
    category: 'Algorithms & Complexity',
    points: 400,
    difficulty: 'Medium',
    questionText: '[QUESTION 1/8] What is the worst-case time complexity of QuickSort, and under what condition does it occur?',
    correctAnswer: 'O(n^2), occurring when the chosen pivot is consistently the smallest or largest element (e.g. sorted array with first/last element pivot).',
    explanation: 'Randomized pivot or median-of-three mitigates this behavior to O(n log n).',
    isUsed: false,
  },
  {
    id: 'r2-main-q2',
    category: 'Cybersecurity & Defense',
    points: 400,
    difficulty: 'Medium',
    questionText: '[QUESTION 2/8] What type of cryptographic attack involves precomputing large tables of hash chains to rapidly crack password digests?',
    correctAnswer: 'Rainbow Table Attack',
    explanation: 'Salting passwords with unique random values per credential invalidates rainbow tables.',
    isUsed: false,
  },
  {
    id: 'r2-main-q3',
    category: 'Database Internals',
    points: 400,
    difficulty: 'Hard',
    questionText: '[QUESTION 3/8] In B+ Tree indexes, why are sequential range queries significantly faster than standard B-Trees?',
    correctAnswer: 'All data/pointers reside in the leaf nodes, which are linked together in a continuous doubly-linked list.',
    explanation: 'Once the first matching leaf node is reached, range scanning traverses the linked list without backtracking up internal tree nodes.',
    isUsed: false,
  },
  {
    id: 'r2-main-q4',
    category: 'Networking & Protocols',
    points: 400,
    difficulty: 'Hard',
    questionText: '[QUESTION 4/8] What is the exact 3-step TCP handshake packet flag exchange used to establish a reliable connection?',
    correctAnswer: 'SYN, SYN-ACK, ACK',
    explanation: 'Client sends SYN; Server responds with SYN-ACK; Client confirms with ACK.',
    isUsed: false,
  },
  {
    id: 'r2-main-q5',
    category: 'Cloud & Virtualization',
    points: 400,
    difficulty: 'Hard',
    questionText: '[QUESTION 5/8] In Linux containers (Docker), which kernel feature restricts and isolates resource allocation (CPU, memory, disk I/O) for a container process?',
    correctAnswer: 'cgroups (Control Groups)',
    explanation: 'Namespaces provide visibility isolation (PID, network, mounts); cgroups enforce hardware resource limitations.',
    isUsed: false,
  },
  {
    id: 'r2-main-q6',
    category: 'Machine Learning',
    points: 400,
    difficulty: 'Hard',
    questionText: '[QUESTION 6/8] In deep learning for sequence modeling, what architectural mechanism introduced in "Attention Is All You Need" replaced recurrent connections?',
    correctAnswer: 'Self-Attention / Multi-Head Attention (The Transformer)',
    explanation: 'Self-attention calculates relations between all positions in a sequence simultaneously in parallel.',
    isUsed: false,
  },
  {
    id: 'r2-main-q7',
    category: 'Web Security',
    points: 400,
    difficulty: 'Expert',
    questionText: '[QUESTION 7/8] What HTTP response security header prevents a web page from being rendered inside an <iframe\>, mitigating Clickjacking attacks?',
    correctAnswer: 'X-Frame-Options (or Content-Security-Policy: frame-ancestors)',
    explanation: 'Setting X-Frame-Options to DENY or SAMEORIGIN blocks malicious iframe overlay wrapping.',
    isUsed: false,
  },
  {
    id: 'r2-main-q8',
    category: 'System Architecture',
    points: 400,
    difficulty: 'Expert',
    questionText: '[QUESTION 8/8] In high-throughput distributed microservices, what design pattern ensures consistency across distributed database transactions using a sequence of local transactions and compensating transactions?',
    correctAnswer: 'Saga Pattern (Choreography or Orchestration)',
    explanation: 'Saga avoids distributed 2-Phase-Commit deadlocks by emitting events and executing compensating rollback steps upon failures.',
    isUsed: false,
  }
];

// ROUND 2: 3 Tie-Break Questions (Sudden-Death for 10th Qualifier)
export const ROUND_2_TIEBREAK_QUESTIONS: Question[] = [
  {
    id: 'r2-tie-1',
    category: 'Nether Tie-Breaker',
    points: 400,
    difficulty: 'Hard',
    questionText: '[R2 Tie-Break 1/3] Identify the standard port number for HTTPS and the standard port number for SSH.',
    correctAnswer: 'HTTPS = 443, SSH = 22',
    explanation: 'Standard IANA registered TCP ports.',
    isUsed: false,
  },
  {
    id: 'r2-tie-2',
    category: 'Nether Tie-Breaker',
    points: 400,
    difficulty: 'Hard',
    questionText: '[R2 Tie-Break 2/3] What is the difference between symmetric encryption (e.g. AES) and asymmetric encryption (e.g. RSA) in terms of key count and speed?',
    correctAnswer: 'Symmetric uses one shared key and is computationally fast; asymmetric uses a public/private key pair and is computationally slower.',
    isUsed: false,
  },
  {
    id: 'r2-tie-3',
    category: 'Nether Tie-Breaker',
    points: 400,
    difficulty: 'Expert',
    questionText: '[R2 Tie-Break 3/3] What Linux permission command gives Read, Write, and Execute to User, Read and Execute to Group, and Read-only to Others in octal format?',
    correctAnswer: 'chmod 754 (or 751/755 depending on interpretation: 7=rwx, 5=r-x, 4=r--)',
    explanation: '7 = 4+2+1 (rwx), 5 = 4+1 (r-x), 4 = 4 (r--).',
    isUsed: false,
  }
];

// ROUND 2: 2 Emergency Questions
export const ROUND_2_EMERGENCY_QUESTIONS: Question[] = [
  {
    id: 'r2-emg-1',
    category: 'Nether Emergency',
    points: 400,
    difficulty: 'Hard',
    questionText: '[R2 Emergency 1/2] What is the CIDR subnet mask notation for a network supporting up to 254 usable host IP addresses?',
    correctAnswer: '/24 (Subnet Mask: 255.255.255.0)',
    isUsed: false,
  },
  {
    id: 'r2-emg-2',
    category: 'Nether Emergency',
    points: 400,
    difficulty: 'Expert',
    questionText: '[R2 Emergency 2/2] What is a SQL Injection vulnerability, and what primary programming pattern definitively prevents it?',
    correctAnswer: 'Injection of malicious SQL syntax through unsanitized user inputs. Prevented using Parameterized Queries / Prepared Statements (or ORM binding).',
    isUsed: false,
  }
];

// ROUND 3: Finals Buzzer Questions (10 Finalists)
export const ROUND_3_FINALS_QUESTIONS: Question[] = [
  {
    id: 'r3-finals-1',
    category: 'Code Output Analysis',
    points: 100,
    difficulty: 'Medium',
    questionText: '[Finals Buzzer 1] Predict the exact console output of this JavaScript snippet:',
    correctAnswer: '3, 3, 3',
    explanation: 'Because var has function scope and the setTimeout callbacks execute after the loop finishes with i=3.',
    codeSnippet: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    isUsed: false,
  },
  {
    id: 'r3-finals-2',
    category: 'C Pointer Arithmetic',
    points: 100,
    difficulty: 'Hard',
    questionText: '[Finals Buzzer 2] What does this C program print to stdout?',
    correctAnswer: '30',
    explanation: '*(arr + 2) dereferences the third element (index 2), which is 30.',
    codeSnippet: '#include <stdio.h>\nint main() {\n  int arr[] = {10, 20, 30, 40};\n  printf("%d\\n", *(arr + 2));\n  return 0;\n}',
    isUsed: false,
  },
  {
    id: 'r3-finals-3',
    category: 'Distributed Consensus',
    points: 100,
    difficulty: 'Expert',
    questionText: '[Finals Buzzer 3] Name two widely adopted consensus algorithms designed for replicated state machines in distributed fault-tolerant clusters.',
    correctAnswer: 'Raft and Paxos',
    explanation: 'Raft (used in etcd, Consul) and Paxos (used in Google Chubby, Spanner).',
    isUsed: false,
  },
  {
    id: 'r3-finals-4',
    category: 'Linux Kernel & Memory',
    points: 100,
    difficulty: 'Expert',
    questionText: '[Finals Buzzer 4] What kernel mechanism steps in to terminate processes when physical RAM and swap are completely exhausted?',
    correctAnswer: 'OOM Killer (Out-Of-Memory Killer)',
    explanation: 'The OOM Killer evaluates badness scores and sends SIGKILL to selected processes to prevent system panic.',
    isUsed: false,
  },
  {
    id: 'r3-finals-5',
    category: 'Cryptographic Protocols',
    points: 100,
    difficulty: 'Expert',
    questionText: '[Finals Buzzer 5] In modern TLS 1.3 handshakes, which key exchange mechanism guarantees Perfect Forward Secrecy (PFS)?',
    correctAnswer: 'Ephemeral Diffie-Hellman (ECDHE / DHE)',
    explanation: 'Keys are generated ephemerally per session; compromising the server private key does not decrypt past sessions.',
    isUsed: false,
  }
];

// ROUND 3: Architecture & Pipeline Tie-Breaker
export const ROUND_3_TIEBREAKER_QUESTIONS: Question[] = [
  {
    id: 'r3-tie-1',
    category: 'Architecture & Flowcharts',
    points: 100,
    difficulty: 'Hard',
    questionText: '[Final Tie-Break 1] In an event-driven microservices architecture, identify the missing component between the API Gateway and downstream consumer services:',
    correctAnswer: 'Distributed Message Broker / Event Bus (e.g. Apache Kafka, RabbitMQ)',
    codeSnippet: '[ Web Client ] ---> [ API Gateway ] ---> [ ???????? ]\n                                              |---> [ Order Service ]\n                                              |---> [ Billing Service ]\n                                              |---> [ Notification Service ]',
    isUsed: false,
  },
  {
    id: 'r3-tie-2',
    category: 'GitOps Deployment Pipeline',
    points: 100,
    difficulty: 'Hard',
    questionText: '[Final Tie-Break 2] In a GitOps continuous deployment workflow, what tool reconciles cluster drift against Git manifest state?',
    correctAnswer: 'GitOps Operator (e.g. ArgoCD, Flux CD)',
    codeSnippet: '[ Git Push ] ---> [ Repository ] <--- (Polls) [ ???????? Operator ] ---> [ Kubernetes Cluster ]',
    isUsed: false,
  }
];

export function buildInitialRound2WagerState(teams: Team[]): Round2WagerState {
  const r2Teams = teams.filter(t => t.isQualifiedR2);

  const questions = ROUND_2_MAIN_QUESTIONS.map((q, idx) => {
    const wagers: Record<string, any> = {};
    r2Teams.forEach(t => {
      wagers[t.id] = {
        teamId: t.id,
        wager: 100,
        isWagerSet: false,
        isDouble: false,
        isCorrect: null,
      };
    });

    return {
      questionIndex: idx,
      questionId: q.id,
      isRevealed: false,
      areWagersLocked: false,
      isScored: false,
      wagers,
    };
  });

  return {
    currentQuestionIndex: 0,
    isQuestionRevealed: false,
    questions,
    isCompleted: false,
  };
}

export function buildInitialRound3State(): Round3State {
  return {
    currentQuestionIndex: 0,
    questions: ROUND_3_FINALS_QUESTIONS.map(question => ({ questionId: question.id, attempts: {} })),
    isQuestionRevealed: false,
    isBuzzerOpen: false,
    buzzerWindowDurationSeconds: 10,
    buzzerWindowSecondsLeft: 10,
    isBuzzerWindowRunning: false,
    answerTimerDurationSeconds: 10,
    buzzerTeamId: null,
    lastResult: null,
  };
}

export function buildInitialBoard(categories: string[], pointTiers: number[], bank: Question[]): JeopardyBoardConfig {
  const matrix = categories.map((cat, catIdx) => {
    return pointTiers.map((pts, ptIdx) => {
      const matched = bank.find(q => q.category.toLowerCase() === cat.toLowerCase() && q.points === pts);
      return {
        categoryIndex: catIdx,
        pointIndex: ptIdx,
        points: pts,
        questionId: matched ? matched.id : `board-cell-${catIdx}-${ptIdx}`,
        isAnswered: false,
      };
    });
  });

  return {
    categories,
    pointTiers,
    matrix
  };
}

export function getInitialEventState(): EventState {
  const teams = INITIAL_30_TEAMS;
  const initialBoard = buildInitialBoard(INITIAL_CATEGORIES, INITIAL_POINT_TIERS, ROUND_2_MAIN_QUESTIONS);
  const round2Wager = buildInitialRound2WagerState(teams);
  const round3 = buildInitialRound3State();

  return {
    version: 2,
    lastUpdated: Date.now(),
    teams,
    currentRound: 'HOME',
    activeTieBreaker: 'NONE',
    previousRoundBeforeTieBreaker: 'HOME',
    round1Timer: {
      durationSeconds: 900, // 15:00
      secondsLeft: 900,
      isRunning: false,
      isExpired: false,
    },
    round2Wager,
    round3,
    questionBanks: {
      round1Main: ROUND_1_MAIN_QUESTIONS,
      round1TieBreakers: ROUND_1_TIEBREAK_QUESTIONS,
      round1Emergency: ROUND_1_EMERGENCY_QUESTIONS,
      round2Main: ROUND_2_MAIN_QUESTIONS,
      round2TieBreakers: ROUND_2_TIEBREAK_QUESTIONS,
      round2Emergency: ROUND_2_EMERGENCY_QUESTIONS,
      round2Jeopardy: ROUND_2_MAIN_QUESTIONS,
      round3Finals: ROUND_3_FINALS_QUESTIONS,
      round3TieBreakers: ROUND_3_TIEBREAKER_QUESTIONS,
    },
    jeopardyBoard: initialBoard,
    activeQuestion: {
      question: null,
      bankSource: null,
      selectingTeamId: null,
      isAnswerRevealed: false,
      isBlazeWagerActive: false,
      isStealOpen: false,
      timerSecondsLeft: 30,
      isTimerRunning: false,
      isTimerEnabled: true,
      defaultTimerDuration: 30,
    },
    winnerTeamId: null,
    soundMuted: false,
    soundVolume: 0.7,
  };
}
