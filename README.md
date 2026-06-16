# Apex AI Agent Console

Apex is a high-altitude, precision local AI developer console and coding agent. Featuring a modern, high-fidelity midnight-navy glassmorphic UI, Apex is equipped with local filesystem workspace exploration, long-term vector memory integration (Hindsight + pgvector), Tavily web search, and sandboxed Docker code execution.

It integrates directly with **NVIDIA NIM** models—such as **DeepSeek-R1** and **Llama 4**—routing complex tasks to the most suitable inference pipeline automatically.

---

## Key Features

### 💻 Local Workspace File Explorer
*   **Tree Navigation**: Browse directories on the host filesystem directly within a VS Code-style workspace tree.
*   **Active Context Injection**: Click files in the explorer to load their contents as system-prompt context.
*   **Adaptive Extension Icons**: Automatically maps icons for `.py`, `.js`, `.ts`, `.json`, `.md`, and plain-text files.

### 🧠 Long-Term Hindsight Vector Memory
*   **Stateful Memory**: Automatically retains and recalls conversational memory based on semantic similarity.
*   **Backend Orchestration**: Backed by Hindsight and a PostgreSQL database running `pgvector` for semantic queries.

### ⚡ Smart NVIDIA NIM Routing
*   **General Tasks & Vision**: Routes standard chat prompts and base64 image uploads to `meta/llama-4-maverick-17b-128e-instruct`.
*   **Logic & Computation**: Automatically triggers `deepseek-ai/deepseek-r1` when math, logic, calculation, or reasoning keywords are detected.

### 🛠️ Developer Tools & Sandboxed Execution
*   **Tavily Web Search**: Seamlessly queries the internet to answer real-time questions and fetch technical documentation.
*   **Sandboxed Code Execution**: Run python, node, and other shell code safely inside an isolated Docker sandbox.

### 🎨 Premium Glassmorphic Theme
*   **Midnight Navy UI**: Tailored color scheme matched to the agent's logo brand details.
*   **Unified Card Bubbles**: Minimalist speech bubbles without distracting headers.
*   **Dynamic Sidebar**: Responsive workspace toggle utilizing Lucide-react panel controllers.

---

## Repository Architecture

```
.
├── frontend/                # Next.js 15 React Web UI Console
│   ├── src/
│   │   ├── app/             # Favicon, layout, and global CSS theme variables
│   │   └── components/      # ChatInterface, Sidebar, FileTree, ChatInput
│   └── package.json
│
├── main.py                  # FastAPI Backend Server & NIM Router
├── config.py                # Pydantic Settings & Environment Verification
├── tools.py                 # Tavily search & Docker executor scripts
├── memory_client.py         # Vector Memory API integration layer
├── requirements.txt         # Backend Python dependencies
├── docker-compose.yml       # Hindsight memory & pgvector database configuration
└── sandbox.Dockerfile       # Docker image definition for safe code execution
```

---

## Setup & Installation

### Prerequisites
*   [Docker & Docker Compose](https://docs.docker.com/get-docker/) (for memory database & sandboxed execution)
*   [Python 3.10+](https://www.python.org/downloads/) (for FastAPI backend)
*   [Node.js 18+](https://nodejs.org/) (for Next.js frontend console)

---

### Step 1: Environment Configuration
1.  Copy the example env file in the root directory:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and fill in your keys:
    *   `NVIDIA_API_KEY`: Obtain your NVIDIA NIM key from [build.nvidia.com](https://build.nvidia.com).
    *   `TAVILY_API_KEY`: Grab a free web-search API key from [tavily.com](https://tavily.com).

---

### Step 2: Spin Up Vector Memory Database
Start PostgreSQL (`pgvector`) and the Hindsight vector memory services:
```bash
docker compose up -d
```
Verify they are running correctly:
```bash
docker compose ps
```

---

### Step 3: Run the FastAPI Backend
1.  Create and activate a Python virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Launch the FastAPI server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The backend documentation is available at `http://127.0.0.1:8000/docs`.

---

### Step 4: Run the Next.js Frontend
1.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` (or `http://localhost:3002`) in your browser to view the console.

---

## Usage

1.  **Initialize Project Folder**: Open the sidebar explorer using the dynamic panel button, select **New Project**, and paste the absolute path to your project.
2.  **Attach Context**: Click any file in the workspace tree to load its contents as system prompt guidelines.
3.  **Ask & Run**: Interact with the chat interface. Upload files or screenshots using the paperclip tool. Code blocks generated in chat can be executed dynamically or searched.
4.  **Close Session**: Click **New Session** to flush the temporary chat context while preserving long-term hindsight recollections.

---

## License

Refer to local licensing or project owner guidelines.
