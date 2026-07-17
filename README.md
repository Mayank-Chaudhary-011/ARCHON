# ARCHON — Multi-Agent Coding Orchestrator

> *A self-healing multi-agent AI system that plans, writes, reviews, and executes code autonomously.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-FF6B35?style=flat)](https://langchain-ai.github.io/langgraph/)
[![Supabase](https://img.shields.io/badge/Supabase-Vector_Memory-3ECF8E?style=flat&logo=supabase)](https://supabase.com)

## 🎥 Demo Video
[![Watch the Demo](https://img.shields.io/badge/Watch-Walkthrough_Video-red?style=for-the-badge&logo=youtube&logoColor=white)](YOUR_VIDEO_URL_HERE)

---

## What Is ARCHON?

ARCHON is **not an LLM wrapper**. It is a multi-agent orchestration system where specialized AI agents coordinate to autonomously build software:

- **Planner** (GPT-4o) — Architect the project, decide file structure, call out shared constants
- **Coder** (GPT-4o-mini) — Write each file with full context of already-generated files
- **Critic** (GPT-4o) — Review code with language-aware rules, reject only real bugs
- **Executor** — Run code in a Docker sandbox, capture real output
- **Debugger** (GPT-4o) — Read errors, fix broken code autonomously
- **Human Gate** — Escalate to user when AI cannot solve after 3 attempts

### The Data Flywheel
Every successful build is stored as an embedding in Supabase. Future similar tasks retrieve these as context — making ARCHON smarter with every run without retraining.

---

## Architecture

```
User Input
    |
    v
+-------------------------------------------------------------+
|                   ARCHON ORCHESTRATOR                       |
|                                                             |
|  +---------+    +----------+    +--------------------+     |
|  | Planner |---->|  Coder   |---->|     Critic         |    |
|  | GPT-4o  |    |GPT-4o-mini|   |    GPT-4o          |    |
|  +---------+    +----------+    +----------+---------+     |
|       ^              ^                     |                |
|       |              |  retry (max 3)      | FAIL           |
|       |              +---------------------+                |
|       |                                   | PASS            |
|       |                                   v                 |
|  +----+------+    +----------+    +------------------+     |
|  |  Memory   |    | Executor |<---|   Human Gate      |    |
|  | Supabase  |    |  Docker  |    |  (if 3x FAIL)    |    |
|  | pgvector  |    +----------+    +------------------+     |
|  +-----------+         |                                    |
+-------------------------+------------------------------------+
                          v
                    Output + Logs
```

### LangGraph State Flow
```
START -> planner -> implementation_planner -> coder -> critic
                                               ^          |
                                               | retry    | FAIL (< 5 attempts)
                                               +----------+
                                                          |
                                                          | PASS
                                                          v
                                                      executor -> debugger -> END
                                                                      |
                                                              5x FAIL |
                                                                      v
                                                                  human -> END
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Orchestration** | LangGraph (StateGraph) | Agent routing + conditional edges |
| **LLM Planning/Review** | GPT-4o | Deep reasoning, architecture, critic |
| **LLM Code Generation** | GPT-4o-mini | Fast, cheap code writing |
| **Backend** | FastAPI + Python | REST API, session management |
| **Frontend** | React 19 + Vite | Editor UI, real-time agent log |
| **Sandbox** | Docker | Safe isolated code execution |
| **Vector Memory** | Supabase + pgvector | Past run retrieval via embeddings |
| **Embeddings** | OpenAI text-embedding-3-small | Semantic similarity search |
| **Animations** | Framer Motion | Micro-interactions |
| **Code Display** | react-syntax-highlighter | VSCode Dark+ theme |
| **ZIP Download** | JSZip + file-saver | Export generated project |

---

## Project Structure

```
archon/
+-- backend/
|   +-- main.py                     # FastAPI app entry point
|   +-- api/
|   |   +-- routes.py               # All REST endpoints + session management
|   +-- graph/
|   |   +-- state.py                # AgentState TypedDict
|   |   +-- nodes.py                # All agent nodes (planner, coder, critic...)
|   |   +-- edges.py                # Conditional routing logic
|   |   +-- graph.py                # LangGraph StateGraph assembly
|   +-- tools/
|       +-- executor.py             # Docker sandbox execution
|       +-- supabase_memory.py      # Vector memory save/retrieve
+-- frontend/
|   +-- src/
|   |   +-- App.jsx                 # Main state manager + history
|   +-- components/
|       +-- Sidebar.jsx             # Task progress, files, history panel
|       +-- Editor.jsx              # Tabbed code editor with syntax highlight
|       +-- ActionBar.jsx           # Build controls, human review gate
|       +-- InputPanel.jsx          # Task input
+-- sandbox/                        # Docker sandbox for code execution
+-- requirements.txt
+-- README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop (for sandbox execution)
- OpenAI API key
- Supabase project with pgvector enabled

### 1. Clone & Install Backend
```bash
git clone https://github.com/Mayank-Chaudhary-011/ARCHON.git
cd ARCHON
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the root:
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

### 3. Supabase Schema
Run this SQL in your Supabase SQL Editor:
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Memory table for past runs
CREATE TABLE code_memory (
    id                BIGSERIAL PRIMARY KEY,
    task              TEXT,
    plan              TEXT,
    code              TEXT,
    feedback          TEXT,
    final_output      TEXT,
    attempts          INT DEFAULT 1,
    tokens_used       INT DEFAULT 0,
    prompt_tokens     INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    efficiency_score  FLOAT DEFAULT 0,
    embedding         VECTOR(1536),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_code_memory(
    query_embedding  VECTOR(1536),
    match_threshold  FLOAT DEFAULT 0.7,
    match_count      INT DEFAULT 3
)
RETURNS TABLE (
    id BIGINT, task TEXT, code TEXT, feedback TEXT,
    final_output TEXT, attempts INT, tokens_used INT,
    efficiency_score FLOAT, similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
    SELECT id, task, code, feedback, final_output, attempts,
           tokens_used, efficiency_score,
           1 - (embedding <=> query_embedding) AS similarity
    FROM   code_memory
    WHERE  1 - (embedding <=> query_embedding) > match_threshold
    ORDER  BY embedding <=> query_embedding
    LIMIT  match_count;
$$;
```

### 4. Install Frontend
```bash
cd frontend
npm install
```

### 5. Run
```bash
# Terminal 1 — Backend
uvicorn backend.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/plan` | Create implementation plan for a task |
| `POST` | `/api/build/next` | Generate next file in the plan |
| `POST` | `/api/build/approve` | Human approves a file that failed critic |
| `POST` | `/api/debug` | Debug broken code with error message |
| `GET` | `/api/history` | Retrieve past runs from Supabase memory |
| `GET` | `/api/status/{session_id}` | Check session build status |

---

## Key Features

### Inter-File Context
When generating `app.js`, ARCHON passes the first 60 lines of every already-generated file as context. IDs, class names, and function references stay consistent across files.

### Self-Healing Critic Loop
Language-aware checklist: won't fail HTML for missing return statements, won't fail on style issues. Only real bugs trigger a retry.

### Human Review Gate
After 3 failed critic attempts, ARCHON shows the critic feedback and asks: Approve (accept as-is) or Reject (cancel)?

### Vector Memory
Every successful build is embedded and stored. Future similar tasks retrieve past runs to inform the planner.

### Build History
Last 15 builds saved to localStorage. One click restores any past project instantly — zero tokens spent.

### Download ZIP
Generates a `.zip` of all project files on build complete.

---

## Cost Per Run

| Project Size | Files | Est. Cost |
|---|---|---|
| Simple (portfolio, game) | 3 files | ~$0.016 |
| Medium (API + frontend) | 5 files | ~$0.028 |
| Complex (full-stack) | 8 files | ~$0.045 |

With $4.00 API credit you can run approximately 90-250 builds.

---

## Deployment

### Backend -> Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
Add environment variables in Railway dashboard.

### Frontend -> Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
```
Update `API` constant in `frontend/src/App.jsx` to your Railway backend URL.

---

## Roadmap

### Near-term
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Real SSE streaming (live token-by-token output)
- [ ] User API key input (multi-user support)
- [ ] Supabase Auth (Google + GitHub login)

### Medium-term
- [ ] Full execution feedback loop per file
- [ ] Auto requirements.txt generation
- [ ] GitHub repository export
- [ ] Larger file context window (summarise instead of truncate at 60 lines)

### Long-term
- [ ] Fine-tune Qwen2.5-Coder-7B on collected data (see guide below)
- [ ] Replace GPT-4o-mini coder with fine-tuned local model (10x cost reduction)

---

## Fine-Tuning Guide (Read This in Jan-Feb 2027)

> Written for Future Mayank who now has enough Supabase build data and wants to replace
> the GPT-4o-mini coder with a fine-tuned open-source model.
> Budget needed: ~$9. Time needed: ~3 hours.

### Step 1 — Check How Much Data You Have

```python
from backend.tools.supabase_memory import supabase

result = supabase.table("code_memory") \
    .select("id, task, attempts, efficiency_score, feedback") \
    .execute()
data = result.data

total         = len(data)
single_shot   = sum(1 for r in data if r["attempts"] == 1)
passed        = sum(1 for r in data if "PASS" in (r.get("feedback") or ""))
high_quality  = sum(1 for r in data if (r.get("efficiency_score") or 0) > 0.7)

print(f"Total runs:         {total}")
print(f"1-attempt (best):   {single_shot}")
print(f"Critic PASS:        {passed}")
print(f"High efficiency:    {high_quality}")
print(f"Ready to fine-tune: {'YES' if passed >= 500 else f'NO — need {500 - passed} more'}")
```

You need at least 500 PASS examples. With $4 of API credit you get ~250 runs.
Collect another 250 runs after you top up.

### Step 2 — Export Training Data as JSONL

```python
# scripts/export_training_data.py
import json
from backend.tools.supabase_memory import supabase

result = supabase.table("code_memory") \
    .select("task, code, feedback, attempts, efficiency_score") \
    .order("efficiency_score", desc=True) \
    .execute()

examples = []
for row in result.data:
    if not row["code"] or not row["task"]:
        continue
    if "PASS" not in (row.get("feedback") or ""):
        continue

    examples.append({
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert software engineer. "
                    "Write complete, production-quality code files. "
                    "No placeholders, no TODO comments, no truncation. "
                    "Return ONLY the file code."
                )
            },
            {
                "role": "user",
                "content": f"Task: {row['task']}\n\nGenerate the complete file:"
            },
            {
                "role": "assistant",
                "content": row["code"]
            }
        ]
    })

with open("archon_training.jsonl", "w") as f:
    for ex in examples:
        f.write(json.dumps(ex) + "\n")

print(f"Exported {len(examples)} training examples -> archon_training.jsonl")
```

### Step 3 — Choose Your Model

| Model | VRAM | Fine-tune Cost | Recommendation |
|---|---|---|---|
| Qwen2.5-Coder-7B | 16GB | ~$1.12 | Best open-source code model |
| DeepSeek-Coder-6.7B | 16GB | ~$1.12 | Strong reasoning |
| GPT-4o-mini (OpenAI) | None | ~$10-15 | Easiest if you want no GPU setup |

**Recommended: Qwen2.5-Coder-7B** on RunPod.

### Step 4 — Fine-Tune on RunPod (A100 GPU)

Spin up a RunPod A100 40GB pod ($1.49/hr). Upload `archon_training.jsonl` and run:

```bash
pip install transformers datasets peft trl bitsandbytes
```

```python
# fine_tune.py
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset
import torch

MODEL_NAME = "Qwen/Qwen2.5-Coder-7B-Instruct"
DATA_FILE  = "archon_training.jsonl"
OUTPUT_DIR = "./archon-coder-7b"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto"
)

lora_config = LoraConfig(
    r=16, lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05, bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

dataset = load_dataset("json", data_files=DATA_FILE, split="train")

trainer = SFTTrainer(
    model=model, tokenizer=tokenizer, train_dataset=dataset,
    args=SFTConfig(
        output_dir=OUTPUT_DIR, num_train_epochs=3,
        per_device_train_batch_size=2, gradient_accumulation_steps=4,
        learning_rate=2e-4, fp16=True, logging_steps=10, save_strategy="epoch"
    )
)
trainer.train()
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("Done! Model saved to:", OUTPUT_DIR)
```

Training 500 examples x 3 epochs on A100 takes ~45 minutes = ~$1.12 total.

### Step 5 — Upload to Hugging Face

```bash
pip install huggingface_hub
huggingface-cli login

python -c "
from huggingface_hub import HfApi
api = HfApi()
api.create_repo('your-username/archon-coder-7b', private=True)
api.upload_folder(
    folder_path='./archon-coder-7b',
    repo_id='your-username/archon-coder-7b'
)
print('Done!')
"
```

### Step 6 — Swap the Model in ARCHON

In `backend/graph/nodes.py`, find the coder LLM definition and change it:

```python
# REMOVE this line:
coder_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, max_tokens=4000)

# ADD this instead:
from langchain_huggingface import HuggingFaceEndpoint
coder_llm = HuggingFaceEndpoint(
    repo_id="your-username/archon-coder-7b",
    task="text-generation",
    max_new_tokens=4000,
    temperature=0.2,
    huggingfacehub_api_token="hf_your_token_here"
)
```

The planner and critic still use GPT-4o. Only the coder (the most frequent call) switches to your model.

### Cost Summary

| Item | Cost |
|---|---|
| Data collection (500 runs x $0.016 avg) | ~$8.00 |
| RunPod A100 for fine-tuning (~1 hr) | ~$1.49 |
| Hugging Face Serverless Inference | ~$0 (pay per token, very cheap) |
| **Total investment** | **~$9.50** |
| **Savings per 1000 builds** | ~$1.80 saved vs GPT-4o-mini |

This is your moat. A coder model trained on YOUR patterns, running at 10x lower cost.

---

## Author

**Mayank Chaudhary**
- Email: chaudharymayank996@gmail.com

---



> **Fine-Tuning Process:**
> Once your Supabase `code_memory` table has 500+ successful PASS runs, you can run 
> `python scripts/export_training_data.py` to export your training data, run `fine_tune.py` 
> on a GPU, and upload the weights to Hugging Face to swap the LLM identifiers in `nodes.py`.
