import { SwarmUIProject } from "../types";

export const SWARM_UI_PROJECTS: SwarmUIProject[] = [
  {
    id: "agency-swarm",
    name: "Agency Swarm (Web Copilot & TUI)",
    repo: "VRSEN/agency-swarm",
    tagline: "Ergonomic multi-agent orchestration framework built on OpenAI Agents SDK with Web Copilot and Terminal UI.",
    description: "Agency Swarm offers an intuitive communication chart pattern where agents pass tasks via function handoffs. Includes a built-in copilot demo Web UI (`agency.copilot_demo()`), Gradio API templates, and rich Terminal UI for rapid multi-agent swarm prototyping.",
    category: "Web Copilot & Chat",
    stars: "8.4k+",
    license: "MIT",
    primaryLanguage: "Python",
    uiFramework: "React / HTML5 Copilot & Gradio / Rich TUI",
    githubUrl: "https://github.com/VRSEN/agency-swarm",
    docsUrl: "https://vrsen.github.io/agency-swarm/",
    supportedArchitectures: ["Peer-to-Peer Handoffs", "Hierarchical Supervisor"],
    features: {
      visualGraphBuilder: false,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: false,
    },
    scorecard: {
      easeOfSetup: 9,
      visualClarity: 8,
      swarmOrchestrationDepth: 9,
      observabilityAndTracing: 8,
      productionReadiness: 8,
    },
    quickstart: {
      installMethod: "pip",
      installCommand: "pip install agency-swarm",
      launchCommand: "python -c 'from agency_swarm import Agency; ...; agency.copilot_demo()'",
      dockerCompose: `version: '3.8'
services:
  agency-swarm:
    image: python:3.11-slim
    volumes:
      - ./:/app
    working_dir: /app
    command: bash -c "pip install agency-swarm && python main.py"
    ports:
      - "7860:7860"
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}`,
    },
    keyPros: [
      "Zero boilerplate agent-to-agent handoffs using OpenAI Agents SDK architecture.",
      "Clean visual communication charts defined with nested lists `[CEO, [CEO, Developer], [Developer, QA]]`.",
      "Instant out-of-the-box Web Copilot UI without configuring frontend servers.",
      "Support for streaming responses and tool-call visual debugging.",
    ],
    keyCons: [
      "Does not feature a drag-and-drop node graph canvas (code-first agency chart).",
      "Heavily optimized for OpenAI schema (requires litellm/instructor for custom local models).",
    ],
    bestFor: "Developers wanting reliable conversational handoffs between role-specialized agents with instant copilot web preview.",
    architectureDetails: "Communication chart is modeled as a directed graph. The entry point agent receives user prompt and delegates to sibling or subordinate agents via custom auto-generated `SendMessage` handoff tools.",
    codeSnippet: {
      language: "python",
      title: "agency_setup.py",
      code: `from agency_swarm import Agent, Agency, BaseTool
from pydantic import Field

# 1. Define Specialized Agents
ceo = Agent(
    name="CEO",
    description="Primary contact point for user requests and project oversight.",
    instructions="Delegate research to Researcher and coding to Programmer.",
)

researcher = Agent(
    name="Researcher",
    description="Performs deep web queries and extracts structured facts.",
    instructions="Provide concise verified source bullet points.",
)

dev = Agent(
    name="Programmer",
    description="Implements clean code and executes tests.",
    instructions="Write production-grade, well-typed code.",
)

# 2. Build Agency Communication Chart
agency = Agency(
    [
        ceo,                         # Entry point
        [ceo, researcher],          # CEO can delegate to Researcher
        [ceo, dev],                 # CEO can delegate to Programmer
        [researcher, dev],          # Researcher can share findings with Programmer
    ],
    shared_instructions="Deliver accurate and concise collaborative results."
)

if __name__ == "__main__":
    # Launches web copilot interface
    agency.copilot_demo()`,
    },
  },
  {
    id: "autogen-studio",
    name: "AutoGen Studio",
    repo: "microsoft/autogen",
    tagline: "Microsoft's low-code visual GUI for designing, testing, and debugging multi-agent workflows.",
    description: "AutoGen Studio is a web UI built on Microsoft's AutoGen framework. It enables users to visually create AI agents with custom skills, configure GroupChat managers, upload local files, and run interactive multi-agent chat sessions with step-by-step reasoning traces.",
    category: "Visual Workflow Platform",
    stars: "36.5k+",
    license: "MIT",
    primaryLanguage: "Python & TypeScript",
    uiFramework: "FastAPI + React / Tailwind CSS",
    githubUrl: "https://github.com/microsoft/autogen/tree/main/samples/apps/autogen-studio",
    docsUrl: "https://microsoft.github.io/autogen/docs/autogen-studio/overview",
    supportedArchitectures: ["Hierarchical Supervisor", "Consensus & Debate", "Sequential Pipeline"],
    features: {
      visualGraphBuilder: true,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: true,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: false,
    },
    scorecard: {
      easeOfSetup: 9,
      visualClarity: 9,
      swarmOrchestrationDepth: 8,
      observabilityAndTracing: 9,
      productionReadiness: 7,
    },
    quickstart: {
      installMethod: "pip",
      installCommand: "pip install autogenstudio",
      launchCommand: "autogenstudio ui --port 8081",
      dockerCompose: `version: '3.8'
services:
  autogenstudio:
    image: python:3.11-slim
    ports:
      - "8081:8081"
    command: bash -c "pip install autogenstudio && autogenstudio ui --host 0.0.0.0 --port 8081"
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}`,
    },
    keyPros: [
      "Declarative UI for creating agent personas, skills, and model configs.",
      "Rich multi-agent conversational playback with code execution outputs.",
      "Built-in gallery of preconfigured multi-agent teams (e.g. Travel Planner, Coder & Reviewer).",
      "Native support for local models via LiteLLM / Ollama endpoints.",
    ],
    keyCons: [
      "Transitioning architecture as Microsoft moves toward the new unified Microsoft Agent Framework.",
      "GroupChat can occasionally enter infinite back-and-forth loops if stopping conditions aren't tuned.",
    ],
    bestFor: "Rapid visual prototyping of conversational multi-agent teams and Python skill-execution workflows.",
    architectureDetails: "Uses AutoGen's `GroupChatManager` and `ConversableAgent` abstractions. State is persisted in a local SQLite DB, enabling export of workflow JSON specifications.",
    codeSnippet: {
      language: "bash",
      title: "autogen_studio_run.sh",
      code: `# 1. Install AutoGen Studio package
pip install autogenstudio

# 2. Configure Environment
export OPENAI_API_KEY="sk-..."

# 3. Launch the Web UI Studio on port 8081
autogenstudio ui --host 0.0.0.0 --port 8081

# Navigate to http://localhost:8081 to build agents, skills, and workflows visually!`,
    },
  },
  {
    id: "langflow",
    name: "Langflow",
    repo: "langflow-ai/langflow",
    tagline: "Visual drag-and-drop node graph canvas for multi-agent teams, LangGraph flows, and RAG pipelines.",
    description: "Langflow is one of the most popular open-source visual node-based frameworks for AI builders. It provides a visual authoring canvas for constructing complex multi-agent graphs, dynamic tool routers, supervisor agents, and interactive chat playgrounds with live state visualization.",
    category: "Node Graph Canvas",
    stars: "45.0k+",
    license: "MIT",
    primaryLanguage: "Python & TypeScript",
    uiFramework: "React + Tailwind + React Flow / FastAPI",
    githubUrl: "https://github.com/langflow-ai/langflow",
    docsUrl: "https://docs.langflow.org/",
    supportedArchitectures: ["Graph DAG / Dynamic Routing", "Hierarchical Supervisor", "Sequential Pipeline"],
    features: {
      visualGraphBuilder: true,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: true,
    },
    scorecard: {
      easeOfSetup: 8,
      visualClarity: 10,
      swarmOrchestrationDepth: 9,
      observabilityAndTracing: 9,
      productionReadiness: 9,
    },
    quickstart: {
      installMethod: "pip",
      installCommand: "pip install langflow",
      launchCommand: "langflow run",
      dockerCompose: `version: '3.8'
services:
  langflow:
    image: langflowai/langflow:latest
    ports:
      - "7860:7860"
    environment:
      - LANGFLOW_PORT=7860
    volumes:
      - langflow_data:/app/langflow
volumes:
  langflow_data:`,
    },
    keyPros: [
      "Stunning, flexible node-graph canvas with hundreds of pre-built integrations.",
      "Native multi-agent supervisor nodes and LangGraph routing support.",
      "Export any visual swarm flow directly into Python code or cURL REST API.",
      "Live interactive testing playground with token usage & step execution logs.",
    ],
    keyCons: [
      "Can feel overwhelming for developers who prefer pure code orchestration.",
      "Requires database persistence (Postgres/SQLite) for team sharing and session storage.",
    ],
    bestFor: "Teams wanting an enterprise-ready visual canvas to design multi-agent workflows, connect custom APIs, and deploy as microservices.",
    architectureDetails: "Directed Acyclic and Cyclic Graphs compiled into asynchronous LangChain/LangGraph runtimes. Nodes communicate through typed inputs/outputs and shared state stores.",
    codeSnippet: {
      language: "bash",
      title: "docker-run-langflow.sh",
      code: `# Run Langflow via Docker in 1 command
docker run -d -p 7860:7860 --name langflow langflowai/langflow:latest

# Or install natively with Python:
pip install langflow
langflow run --host 0.0.0.0 --port 7860`,
    },
  },
  {
    id: "dify",
    name: "Dify.ai",
    repo: "langgenius/dify",
    tagline: "Leading open-source visual multi-agent workflow platform, LLM orchestrator, and app builder.",
    description: "Dify is an open-source LLMOps platform featuring visual orchestration for multi-agent systems, ReAct agents, function-calling teams, knowledge base vector databases, and enterprise governance with ready-to-use web apps.",
    category: "Visual Workflow Platform",
    stars: "65.0k+",
    license: "Open Source / Apache 2.0 (Core)",
    primaryLanguage: "Python & TypeScript",
    uiFramework: "Next.js + Tailwind CSS / Flask + Celery",
    githubUrl: "https://github.com/langgenius/dify",
    docsUrl: "https://docs.dify.ai/",
    supportedArchitectures: ["Hierarchical Supervisor", "Sequential Pipeline", "Graph DAG / Dynamic Routing"],
    features: {
      visualGraphBuilder: true,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: true,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: true,
    },
    scorecard: {
      easeOfSetup: 7,
      visualClarity: 10,
      swarmOrchestrationDepth: 9,
      observabilityAndTracing: 10,
      productionReadiness: 10,
    },
    quickstart: {
      installMethod: "docker",
      installCommand: "git clone https://github.com/langgenius/dify.git && cd dify/docker && cp .env.example .env && docker compose up -d",
      launchCommand: "docker compose up -d",
      dockerCompose: `# Run inside dify/docker directory:
docker compose up -d`,
    },
    keyPros: [
      "Industrial-strength UI with multi-tenant workspaces and user authentication.",
      "Visual multi-agent nodes with parallel execution and conditional branching.",
      "Built-in RAG engine, dataset indexing, and dozens of third-party tool plugins.",
      "One-click embeddable web chat widgets and REST API generation.",
    ],
    keyCons: [
      "Heavier footprint to run self-hosted (requires Docker with Postgres, Redis, Vector DB, Celery).",
      "Geared heavily towards visual workflow nodes rather than pure script-based swarms.",
    ],
    bestFor: "Enterprise teams building production multi-agent apps with built-in data pipelines, auth, and analytics.",
    architectureDetails: "Microservice architecture with Next.js frontend, Flask API service, Celery worker pool for async task execution, and pluggable vector databases (Qdrant, Milvus, Weaviate, PgVector).",
    codeSnippet: {
      language: "bash",
      title: "dify_self_host.sh",
      code: `# Clone and start Dify in Docker
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker compose up -d

# Open browser at http://localhost/install to set up admin account`,
    },
  },
  {
    id: "openhands",
    name: "OpenHands (formerly OpenDevin) Agent Canvas",
    repo: "All-Hands-AI/OpenHands",
    tagline: "Autonomous multi-agent software development platform with visual workspace, code diffs, and terminal execution.",
    description: "OpenHands provides an open-source visual agent canvas where a swarm of specialized software development agents (planner, coder, reviewer) run commands inside isolated Docker sandboxes, edit repositories, and present live diffs.",
    category: "Workspace & Agent Sandbox",
    stars: "42.0k+",
    license: "MIT",
    primaryLanguage: "Python & TypeScript",
    uiFramework: "React + Tailwind / FastAPI + Docker SDK",
    githubUrl: "https://github.com/All-Hands-AI/OpenHands",
    docsUrl: "https://docs.all-hands.dev/",
    supportedArchitectures: ["Hierarchical Supervisor", "Sequential Pipeline"],
    features: {
      visualGraphBuilder: false,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: true,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: false,
    },
    scorecard: {
      easeOfSetup: 8,
      visualClarity: 9,
      swarmOrchestrationDepth: 9,
      observabilityAndTracing: 10,
      productionReadiness: 9,
    },
    quickstart: {
      installMethod: "docker",
      installCommand: `docker run -it --rm --pull=always \\
    -e SANDBOX_USER_ID=$(id -u) \\
    -e LLM_API_KEY="sk-..." \\
    -e LLM_MODEL="gpt-4o" \\
    -v /var/run/docker.sock:/var/run/docker.sock \\
    -p 3000:3000 \\
    --name openhands-app \\
    docker.all-hands.dev/all-hands-ai/openhands:0.14`,
      launchCommand: "docker start openhands-app",
    },
    keyPros: [
      "True multi-agent autonomous engineering workspace (interactive terminal, file tree, web browser preview).",
      "Secure Docker container sandbox prevents agents from harming host machine.",
      "Event-stream architecture with transparent step-by-step reasoning logs and action rollbacks.",
      "Supports local models via Ollama or any OpenAI-compatible server.",
    ],
    keyCons: [
      "Requires local Docker socket access.",
      "Focused specifically on software engineering and repo tasks rather than generic multi-agent chatbots.",
    ],
    bestFor: "Software engineers needing an AI agent swarm that can clone repos, plan tasks, write code, run terminal commands, and verify test suites.",
    architectureDetails: "Event-stream architecture connecting frontend WebSocket to AgentController backend. Agents emit Actions (run_command, edit_file, browse_url) which are executed in a containerized Docker sandbox.",
    codeSnippet: {
      language: "bash",
      title: "launch_openhands.sh",
      code: `# Run OpenHands containerized agent workspace
docker run -it --rm --pull=always \\
  -e SANDBOX_USER_ID=$(id -u) \\
  -e LLM_API_KEY="sk-..." \\
  -e LLM_MODEL="gemini/gemini-2.0-flash" \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/.openhands-state:/.openhands-state \\
  -p 3000:3000 \\
  docker.all-hands.dev/all-hands-ai/openhands:latest`,
    },
  },
  {
    id: "crewai-studio",
    name: "CrewAI UI Ecosystem (CrewAI Studio & Web UI)",
    repo: "amazingnerd/CrewAI-UI",
    tagline: "Visual dashboards and chat interfaces for role-playing multi-agent autonomous crews.",
    description: "Multiple open-source community UIs exist for CrewAI (such as `amazingnerd/CrewAI-UI`, `strnad/CrewAI-Studio`, and `zinyando/crewai_chat_ui`). They allow users to visually define agents with backstory, goals, tools, and assemble sequential or hierarchical multi-agent crews with chat interfaces.",
    category: "Control Plane & Dashboard",
    stars: "1.8k+ (UI Repos) / 28k+ (CrewAI Core)",
    license: "MIT",
    primaryLanguage: "Python & TypeScript",
    uiFramework: "Next.js / Streamlit / Qt GUI",
    githubUrl: "https://github.com/amazingnerd/CrewAI-UI",
    docsUrl: "https://docs.crewai.com/",
    supportedArchitectures: ["Hierarchical Supervisor", "Sequential Pipeline", "Consensus & Debate"],
    features: {
      visualGraphBuilder: true,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: false,
    },
    scorecard: {
      easeOfSetup: 8,
      visualClarity: 8,
      swarmOrchestrationDepth: 8,
      observabilityAndTracing: 8,
      productionReadiness: 7,
    },
    quickstart: {
      installMethod: "git",
      installCommand: "git clone https://github.com/amazingnerd/CrewAI-UI.git && cd CrewAI-UI && npm install",
      launchCommand: "npm run dev",
    },
    keyPros: [
      "Natural role-playing abstraction (Agent, Task, Crew, Process.hierarchical).",
      "Visual forms to configure agent Backstory, Memory, Delegation, and Tool bindings.",
      "Easy integration with LangChain tools and custom Python functions.",
    ],
    keyCons: [
      "Community UIs are separate from core CrewAI enterprise cloud service.",
      "Hierarchical process requires a capable manager LLM (e.g. GPT-4o or Claude 3.5 Sonnet) to delegate accurately.",
    ],
    bestFor: "Developers wanting role-based autonomous task pipelines with visual agent creation tools.",
    architectureDetails: "Crew orchestrates tasks either in `Process.sequential` (output of task 1 feeds task 2) or `Process.hierarchical` (manager agent plans subtasks and delegates to workers with feedback loops).",
    codeSnippet: {
      language: "python",
      title: "crew_hierarchical_example.py",
      code: `from crewai import Agent, Task, Crew, Process
from langchain_community.tools import DuckDuckGoSearchRun

search_tool = DuckDuckGoSearchRun()

# 1. Define Agents
researcher = Agent(
    role='Senior Market Analyst',
    goal='Uncover groundbreaking trends in AI Agent swarms',
    backstory='You are an expert researcher with a keen eye for open-source tools.',
    tools=[search_tool],
    verbose=True
)

writer = Agent(
    role='Lead Technical Writer',
    goal='Craft compelling and technical comparison reports',
    backstory='You translate raw benchmark data into executive summaries.',
    verbose=True
)

# 2. Define Tasks
task1 = Task(description='Research the top 5 open source swarm UIs.', agent=researcher, expected_output='A bulleted list of 5 UIs.')
task2 = Task(description='Write a technical summary report.', agent=writer, expected_output='A 3-paragraph markdown report.')

# 3. Assemble Hierarchical Crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[task1, task2],
    process=Process.hierarchical,
    manager_llm="gpt-4o",
    verbose=True
)

result = crew.kickoff()
print(result)`,
    },
  },
  {
    id: "agentswarms",
    name: "AgentSwarms Canvas (AgentSwarms-fyi & Swarms)",
    repo: "AgentSwarms-fyi/agentswarms",
    tagline: "Visual canvas for designing, orchestrating, and observing parallel multi-agent swarms.",
    description: "AgentSwarms is a self-hosted platform providing a visual drag-and-drop canvas for designing multi-agent swarms. It allows visual configuration of swarm topology, worker pools, routing rules, and inspecting execution traces across distributed agents.",
    category: "Node Graph Canvas",
    stars: "1.2k+",
    license: "Source-Available / MIT",
    primaryLanguage: "TypeScript & Python",
    uiFramework: "React + Tailwind + ReactFlow",
    githubUrl: "https://github.com/AgentSwarms-fyi/agentswarms",
    docsUrl: "https://agentswarms.fyi",
    supportedArchitectures: ["Hierarchical Supervisor", "Peer-to-Peer Handoffs", "Sequential Pipeline", "Consensus & Debate"],
    features: {
      visualGraphBuilder: true,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: true,
    },
    scorecard: {
      easeOfSetup: 8,
      visualClarity: 9,
      swarmOrchestrationDepth: 9,
      observabilityAndTracing: 9,
      productionReadiness: 8,
    },
    quickstart: {
      installMethod: "docker",
      installCommand: "docker run -p 3000:3000 agentswarms/agentswarms:latest",
      launchCommand: "docker start agentswarms",
    },
    keyPros: [
      "Specifically built for swarm architectures (worker pools, router nodes, aggregator nodes).",
      "Live visual animation of message packet passing between swarm nodes.",
      "Native trace inspector tracking latency, token usage, and individual agent thought processes.",
    ],
    keyCons: [
      "Emerging platform with rapid ongoing release updates.",
      "Requires modern browser GPU acceleration for very large (50+ node) swarms.",
    ],
    bestFor: "Visualizing complex concurrent agent topologies and worker pools on a unified canvas.",
    architectureDetails: "Modular reactive event bus connecting node agents with a central scheduler. Supports concurrent async execution of agent pools with barrier synchronization.",
    codeSnippet: {
      language: "typescript",
      title: "swarm_node_config.json",
      code: `{
  "swarm_name": "Autonomous Research Swarm",
  "topology": "hierarchical_supervisor",
  "agents": [
    {
      "id": "coordinator",
      "type": "supervisor",
      "model": "gemini-2.0-flash",
      "max_delegations": 5
    },
    {
      "id": "worker_pool",
      "type": "parallel_workers",
      "pool_size": 3,
      "toolset": ["web_search", "document_scraper"]
    }
  ]
}`,
    },
  },
  {
    id: "chainlit",
    name: "Chainlit Multi-Agent Engine",
    repo: "Chainlit/chainlit",
    tagline: "Python framework to build production-grade conversational UIs with nested multi-agent step visualizers.",
    description: "Chainlit is a Python web framework designed to create ChatGPT-like UIs with native support for multi-agent systems, step visualization trees, avatar switching per agent, human-in-the-loop approval buttons, and streaming responses.",
    category: "Web Copilot & Chat",
    stars: "9.2k+",
    license: "Apache-2.0",
    primaryLanguage: "Python & React",
    uiFramework: "FastAPI + React / Tailwind CSS",
    githubUrl: "https://github.com/Chainlit/chainlit",
    docsUrl: "https://docs.chainlit.io/",
    supportedArchitectures: ["Peer-to-Peer Handoffs", "Hierarchical Supervisor", "Sequential Pipeline"],
    features: {
      visualGraphBuilder: false,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: true,
    },
    scorecard: {
      easeOfSetup: 10,
      visualClarity: 9,
      swarmOrchestrationDepth: 8,
      observabilityAndTracing: 10,
      productionReadiness: 9,
    },
    quickstart: {
      installMethod: "pip",
      installCommand: "pip install chainlit",
      launchCommand: "chainlit run app.py -w",
    },
    keyPros: [
      "Ultra-fast setup: turn any Python multi-agent script into a full web UI in minutes.",
      "First-class step nesting: visualize sub-agent calls, tool invocations, and thinking tokens.",
      "Native human feedback mechanisms (thumbs up/down, ask for user confirmation buttons).",
      "Seamless integrations with LangChain, AutoGen, CrewAI, and OpenAI Swarm.",
    ],
    keyCons: [
      "Chat-focused interface rather than a visual drag-and-drop workflow designer.",
      "Requires writing Python event decorators (`@cl.on_message`, `@cl.step`).",
    ],
    bestFor: "Python developers needing a polished, reactive multi-agent chat interface with deep step observability.",
    architectureDetails: "WebSocket-driven bidirectional protocol communicating step updates, token streams, and interactive widget actions directly to the React frontend.",
    codeSnippet: {
      language: "python",
      title: "chainlit_multiagent.py",
      code: `import chainlit as cl

@cl.step(name="Planner Agent", type="llm")
async def run_planner(user_query: str):
    return f"Plan: 1. Research '{user_query}', 2. Synthesize key takeaways."

@cl.step(name="Researcher Agent", type="tool")
async def run_research(plan: str):
    return "Discovered 4 open-source Swarm UIs with active GitHub repos."

@cl.on_message
async def main(message: cl.Message):
    # Visual step tree execution
    plan = await run_planner(message.content)
    findings = await run_research(plan)
    
    await cl.Message(content=f"### Summary Report\\n{findings}").send()`,
    },
  },
  {
    id: "picoagents",
    name: "PicoAgents Web UI (Victor Dibia)",
    repo: "victordibia/designing-multiagent-systems",
    tagline: "Lightweight multi-agent debugging rail, live streaming chat, and recorded execution inspector.",
    description: "Created as part of the Designing Multiagent Systems reference architecture, PicoAgents Web UI offers an exploratory UI to discover agents, orchestrators, streaming chat, a live debug rail, and recorded run histories.",
    category: "Control Plane & Dashboard",
    stars: "2.5k+",
    license: "MIT",
    primaryLanguage: "Python & TypeScript",
    uiFramework: "React / Vite + FastAPI",
    githubUrl: "https://github.com/victordibia/designing-multiagent-systems",
    supportedArchitectures: ["Peer-to-Peer Handoffs", "Hierarchical Supervisor"],
    features: {
      visualGraphBuilder: false,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: false,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: false,
    },
    scorecard: {
      easeOfSetup: 8,
      visualClarity: 8,
      swarmOrchestrationDepth: 8,
      observabilityAndTracing: 9,
      productionReadiness: 7,
    },
    quickstart: {
      installMethod: "git",
      installCommand: "git clone https://github.com/victordibia/designing-multiagent-systems && cd designing-multiagent-systems && pip install -r requirements.txt",
      launchCommand: "python app.py",
    },
    keyPros: [
      "Dedicated multi-agent debug rail that clearly highlights handoff transitions.",
      "Clear educational architecture separating orchestration logic from presentation.",
      "Supports inspecting agent internal prompt templates and tool schemas in real-time.",
    ],
    keyCons: [
      "Mainly maintained as an educational/reference repository rather than a full SaaS platform.",
    ],
    bestFor: "Studying clean multi-agent interaction design and debugging handoff transitions.",
    architectureDetails: "Lightweight message bus decoupling orchestrator state from UI event streams.",
    codeSnippet: {
      language: "python",
      title: "run_picoagents.py",
      code: `# Run PicoAgents Web UI demo
git clone https://github.com/victordibia/designing-multiagent-systems
cd designing-multiagent-systems
pip install -e .
python -m designing_multiagent_systems.ui`,
    },
  },
  {
    id: "voltagent",
    name: "VoltAgent Platform",
    repo: "VoltAgent/voltagent",
    tagline: "TypeScript-first AI Agent Engineering Platform with supervisor coordination and multi-step workflows.",
    description: "VoltAgent provides an open-source TypeScript framework and visual engineering interface for creating multi-agent swarms with supervisor coordination, persistent memory, tool calling, and event tracing in Node.js/Next.js environments.",
    category: "Visual Workflow Platform",
    stars: "1.1k+",
    license: "Apache-2.0",
    primaryLanguage: "TypeScript",
    uiFramework: "Next.js / React / Tailwind",
    githubUrl: "https://github.com/VoltAgent/voltagent",
    docsUrl: "https://voltagent.dev",
    supportedArchitectures: ["Hierarchical Supervisor", "Sequential Pipeline", "Graph DAG / Dynamic Routing"],
    features: {
      visualGraphBuilder: true,
      humanInTheLoop: true,
      localModelsSupport: true,
      dockerSandbox: false,
      liveTracesVisualizer: true,
      handoffSupport: true,
      persistentMemory: true,
      apiExport: true,
      customToolIntegration: true,
      multiUserTeamAuth: true,
    },
    scorecard: {
      easeOfSetup: 9,
      visualClarity: 9,
      swarmOrchestrationDepth: 8,
      observabilityAndTracing: 9,
      productionReadiness: 8,
    },
    quickstart: {
      installMethod: "npm",
      installCommand: "npx create-voltagent-app my-swarm",
      launchCommand: "npm run dev",
    },
    keyPros: [
      "100% TypeScript native — perfect for web developers and frontend teams.",
      "Clean supervisor orchestration pattern with typed tool parameters.",
      "Fast Vite/Next.js development cycle with full React component integration.",
    ],
    keyCons: [
      "Smaller ecosystem compared to mature Python frameworks like LangChain/AutoGen.",
    ],
    bestFor: "TypeScript/JavaScript developers wanting a full-stack multi-agent platform without Python dependencies.",
    architectureDetails: "Event-driven asynchronous Node.js engine with type-safe agent state machines and supervisor delegates.",
    codeSnippet: {
      language: "typescript",
      title: "voltagent_swarm.ts",
      code: `import { Agent, Supervisor, createWorkflow } from "@voltagent/core";

const researchAgent = new Agent({
  name: "WebResearcher",
  instructions: "Find verified data regarding AI agent swarms.",
  tools: [/* custom search tool */]
});

const synthesizerAgent = new Agent({
  name: "Synthesizer",
  instructions: "Assemble findings into actionable markdown tables."
});

export const swarmSupervisor = new Supervisor({
  name: "SwarmCoordinator",
  agents: [researchAgent, synthesizerAgent],
  strategy: "hierarchical"
});`,
    },
  },
];
