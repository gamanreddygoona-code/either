export type UICategory = 
  | "Node Graph Canvas" 
  | "Web Copilot & Chat" 
  | "Workspace & Agent Sandbox" 
  | "Control Plane & Dashboard" 
  | "Visual Workflow Platform";

export type ArchitecturePattern = 
  | "Hierarchical Supervisor" 
  | "Peer-to-Peer Handoffs" 
  | "Sequential Pipeline" 
  | "Graph DAG / Dynamic Routing" 
  | "Consensus & Debate";

export interface SwarmUIProject {
  id: string;
  name: string;
  repo: string;
  tagline: string;
  description: string;
  category: UICategory;
  stars: string;
  license: string;
  primaryLanguage: string;
  uiFramework: string;
  githubUrl: string;
  docsUrl?: string;
  demoUrl?: string;
  supportedArchitectures: ArchitecturePattern[];
  features: {
    visualGraphBuilder: boolean;
    humanInTheLoop: boolean;
    localModelsSupport: boolean;
    dockerSandbox: boolean;
    liveTracesVisualizer: boolean;
    handoffSupport: boolean;
    persistentMemory: boolean;
    apiExport: boolean;
    customToolIntegration: boolean;
    multiUserTeamAuth: boolean;
  };
  scorecard: {
    easeOfSetup: number;
    visualClarity: number;
    swarmOrchestrationDepth: number;
    observabilityAndTracing: number;
    productionReadiness: number;
  };
  quickstart: {
    installMethod: "pip" | "npm" | "docker" | "git";
    installCommand: string;
    launchCommand: string;
    dockerCompose?: string;
  };
  keyPros: string[];
  keyCons: string[];
  bestFor: string;
  architectureDetails: string;
  codeSnippet: {
    title?: string;
    language: string;
    filename?: string;
    code: string;
  };
}

export interface AgentSimulationNode {
  id: string;
  name: string;
  role: string;
  status: "idle" | "thinking" | "executing" | "waiting" | "done";
  avatar: string;
  tools: string[];
  systemPrompt?: string;
  activeTask?: string;
  metrics?: {
    tasksCompleted?: number;
    tokensUsed?: number;
    tokensProcessed?: number;
    latencyMs?: number;
    [key: string]: any;
  };
}

export interface SimulationMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  type: string;
  status?: string;
  timestamp: string;
}

export interface AppConnector {
  id: string;
  name: string;
  category: "storage" | "calendar" | "productivity" | "communication" | "automation" | "code" | "email";
  icon: string;
  brandColor: string;
  description: string;
  status: "connected" | "disconnected" | "syncing";
  connectedAccount?: string;
  lastSynced?: string;
  itemCount: number;
  dataItems: {
    id: string;
    title: string;
    type: string;
    updatedAt: string;
    summary?: string;
    url?: string;
  }[];
  authFields: {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "password" | "oauth";
  }[];
}

export interface UrlTrafficReport {
  url: string;
  domain: string;
  isSelfApp: boolean;
  status: "ONLINE" | "UNREACHABLE";
  httpStatus: number;
  latencyMs: number;
  totalVisitors: number;
  onlineUsers: number;
  peakOnline24h: number;
  bounceRatePercent: number;
  avgDurationSec: number;
  serverLocation: string;
  dnsResolvedIp: string;
  tlsSecure: boolean;
  hourlyTraffic: { hour: string; visitors: number; online: number }[];
  countryDistribution: { country: string; code: string; percent: number; flag: string }[];
  lastChecked: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  model?: string;
  mode?: "live" | "fallback";
  toolsUsed?: {
    name: string;
    icon?: string;
    live?: boolean;
    status: "running" | "completed" | "failed";
    details?: string;
  }[];
  sources?: {
    title: string;
    uri?: string;
    url?: string;
    type?: string;
  }[];
  attachments?: {
    name: string;
    type: string;
    size: string;
    url?: string;
  }[];
  analyticsData?: UrlTrafficReport;
}

export interface ChatTab {
  id: string;
  title: string;
  type: "chat" | "meeting" | "routine" | "search" | "project";
  messages: ChatMessage[];
  model: string;
  createdAt: string;
  connectedAppIds: string[];
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  summary: string;
  actionItems: {
    id: string;
    task: string;
    assignee: string;
    completed: boolean;
  }[];
  transcriptSnippet: string;
  appSource: "Google Calendar" | "Gmail" | "Zoom" | "Slack Huddle" | "WhatsApp" | "Manual";
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  triggerApp: string;
  actionApp: string;
  lastRun?: string;
  prompt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: "folder" | "doc" | "chat" | "dataset";
  children?: ProjectItem[];
  updatedAt: string;
  content?: string;
}

export interface DedicatedServer {
  id: string;
  name: string;
  host: string;
  port: number;
  type: "local-wifi" | "vps-cloud" | "docker-daemon";
  status: "online" | "offline" | "deploying" | "error";
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  activeDeployments: {
    folderName: string;
    targetPort: number;
    url: string;
    deployedAt: string;
    status: "running" | "stopped";
  }[];
  lastHeartbeat: string;
}

export interface DaemonLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warn" | "error";
  agentName: string;
  targetService: string;
  message: string;
  details?: string;
}

export interface FolderInspectionResult {
  path: string;
  folderName: string;
  projectType: "Node.js / React" | "Python / FastAPI" | "Go" | "Dockerized" | "Static Web" | "Unknown";
  totalFiles: number;
  keyFiles: string[];
  entryPoint?: string;
  packageManager?: "npm" | "pnpm" | "yarn" | "pip" | "uv";
  scripts?: Record<string, string>;
  dependenciesCount?: number;
  gitBranch?: string;
}

export interface CustomSkill {
  id: string;
  name: string;
  description: string;
  triggerPattern: string;
  instructions: string;
  toolsRequired: string[];
  createdAt: string;
  isAiGenerated: boolean;
}

export interface PersistentMemory {
  id: string;
  category: "user_preference" | "project_context" | "system_rule" | "entity_info";
  key: string;
  value: string;
  lastAccessed: string;
  importance: "high" | "medium" | "low";
}

export interface WiFiDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  type: "cctv-rtsp" | "smart-hub" | "iot-sensor" | "network-node";
  status: "online" | "offline" | "streaming";
  streamUrl?: string;
  location?: string;
  lastPing: string;
  snapshotUrl?: string;
}

export interface ThreatIntelResult {
  queryType: "image" | "entity" | "ip" | "domain";
  entityName: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  summary: string;
  publicSources: {
    title: string;
    uri: string;
    type: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  plan: string;
  avatarGradient: string;
  avatarUrl?: string;
  version: string;
  contextEnabled: boolean;
  isAuthenticated?: boolean;
}

/* ================= Agent 2 Video Swarm Types ================= */

export interface VideoVariant {
  id: string;
  sceneId: string;
  url: string;
  thumbnail: string;
  prompt: string;
  style: "Cinematic" | "Anime" | "Realistic" | "Documentary";
  durationSec: number;
  selected?: boolean;
}

export interface VideoScene {
  id: string;
  index: number;
  startSec: number;
  endSec: number;
  scriptChunk: string;
  prompt: string;
  status: "pending" | "generating" | "variants_ready" | "selected";
  variants: VideoVariant[];
  selectedVariantId?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  script: string;
  totalDurationSec: number;
  scenes: VideoScene[];
  currentSceneIdx: number;
  status: "draft" | "segmented" | "generating" | "awaiting_selection" | "completed" | "editing";
  finalTimeline?: {
    stitchedVideoUrl?: string;
    syncNotes: string;
    editedClips: { sceneId: string; variantId: string; startSec: number; endSec: number; transition: string }[];
  };
  createdAt: string;
}

export interface Agent2Skill {
  id: string;
  name: string;
  description: string;
  trigger: string;
  prompt: string;
  category: "research" | "video" | "edit" | "sync";
}

/* ================= AI Trading Agent & Terminal Types ================= */

export interface CandleStickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  ema200: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  atr: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  volatility: "LOW" | "NORMAL" | "HIGH" | "EXTREME";
}

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  price: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  timeframe: string;
  strategy: string;
  rationale: string;
  technicalSummary: {
    rsi: number;
    macdCross: "BULLISH" | "BEARISH" | "NONE";
    emaTrend: "STRONG_UP" | "WEAK_UP" | "DOWN" | "CONSOLIDATING";
    keySupport: number;
    keyResistance: number;
  };
}

export interface TradePosition {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  valueUsd: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: string;
  mode: "paper" | "live";
}

export interface TradeOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP_LOSS";
  price: number;
  amount: number;
  totalUsd: number;
  status: "FILLED" | "PENDING" | "CANCELLED" | "STOPPED_OUT" | "TAKE_PROFIT";
  pnl?: number;
  timestamp: string;
  mode: "paper" | "live";
  reason?: string;
}

export interface TradingPortfolio {
  cashBalance: number;
  initialBalance: number;
  totalEquity: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: number;
  openPositions: TradePosition[];
  orderHistory: TradeOrder[];
  mode: "paper" | "live";
}

export interface TradingBotConfig {
  enabled: boolean;
  symbol: string;
  strategy: "ai_confluence" | "rsi_reversion" | "breakout_momentum" | "ema_cross" | "scalper";
  riskPerTradePercent: number;
  maxOpenPositions: number;
  scanIntervalSeconds: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  mode: "paper" | "live";
  lastScanTime?: string;
  lastAction?: string;
}

