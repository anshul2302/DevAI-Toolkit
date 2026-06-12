# DevAI Toolkit

> **The developer's toolkit for working smarter with AI assistants.**

A privacy-first web application that eliminates the everyday friction developers face when working with ChatGPT, Claude, Gemini, and other AI tools. Format conversion, token management, prompt engineering — all in one place, running entirely in your browser.

🔗 **Live:** [devai-toolkit.vercel.app](https://devai-toolkit.vercel.app)  
📄 **PRD:** [docs/PRD.md](docs/PRD.md)

---

## Why This Exists

Developers spend **30-40% of their AI interaction time** on overhead — converting formats, estimating tokens, crafting prompts, and preparing context. These are mechanical, repetitive tasks that shouldn't require mental energy.

DevAI Toolkit solves this with 8 focused tools that run **client-side in the browser**. No accounts. No API keys. No data leaving your machine.

## Features

| Tool | What It Solves | Runs |
|------|---------------|------|
| **Doc → Markdown** | Convert DOCX/TXT files to clean Markdown for AI input | Client + Server |
| **Markdown → HTML** | Convert AI-generated Markdown to styled, downloadable HTML | Client |
| **Token Counter & Cost** | Know your token count and API cost *before* sending | Client |
| **Waste Detector** | Find filler, repetition, and wasted tokens in AI transcripts | Client |
| **Prompt Templates** | Save, organize, and reuse your best prompts | Client (localStorage) |
| **File Tree Generator** | Generate ASCII project trees for AI context | Client |
| **System Prompt Builder** | Generate 3 production-grade system prompts from minimal input | Client |
| **JSON / YAML Formatter** | Format, validate, and convert between JSON and YAML | Client |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router, Axios, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, SQLite |
| **Security** | HTML sanitization, sandboxed iframes, CORS, security headers |
| **Deployment** | Vercel (frontend) + Render (backend) |

## Architecture

```
┌────────────────────────────┐
│     User's Browser         │
│                            │
│  React Frontend (Vercel)   │
│  7 tools run client-side   │
│  No data leaves browser    │
└────────────┬───────────────┘
             │ .docx only
             ▼
┌────────────────────────────┐
│  FastAPI Backend (Render)  │
│  /api/convert/doc-to-md    │
└────────────────────────────┘
```

## Getting Started (Local Development)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to the backend.

## Project Structure

```
DevAI-Toolkit/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, middleware, security
│   │   ├── database.py        # SQLite setup
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── routers/           # API route handlers
│   │   └── services/          # Business logic
│   ├── requirements.txt
│   └── render.yaml            # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, Sidebar
│   │   ├── pages/             # One page per tool
│   │   ├── utils/clientTools.js  # Client-side tool implementations
│   │   ├── api.js             # Axios HTTP client
│   │   └── App.jsx            # Router setup
│   ├── vercel.json            # Vercel deployment config
│   └── package.json
├── docs/
│   └── PRD.md                 # Product Requirements Document
└── README.md
```

## Key Design Decisions

- **Client-side first** — 7 of 8 tools need zero backend. Privacy by architecture.
- **No authentication** — utility tools shouldn't require signup. Zero friction.
- **3-variant prompt generation** — System Prompt Builder produces Comprehensive, Focused, and Minimal prompts from the same input.
- **HTML sanitization** — all generated HTML is stripped of XSS vectors before rendering.

## License

MIT

---

*Built by [Anshul Nema](https://github.com/anshul2302) — because the best tools get out of your way.*
