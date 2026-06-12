# DevAI Toolkit

A full-stack web application that helps developers get the most out of AI tools. Built with **React + Vite + TailwindCSS** (frontend) and **Python FastAPI** (backend).

## Features

| Tool | Description |
|------|-------------|
| **Doc → Markdown** | Convert DOCX, PDF, TXT files to clean Markdown |
| **Markdown → HTML** | Convert Markdown to styled HTML with syntax highlighting |
| **Token Counter & Cost Estimator** | Count tokens across GPT-4, Claude, Gemini and estimate costs |
| **Context Window Optimizer** | Compress/optimize text to fit within token limits |
| **Transcript Waste Detector** | Analyze AI conversation transcripts for wasted tokens |
| **Prompt Template Library** | Save, organize, and reuse prompt templates with variables |
| **File Tree Generator** | Generate project structure representations for AI context |
| **System Prompt Builder** | Build effective system prompts with a guided wizard |
| **JSON/YAML Formatter** | Format and convert between data formats |
| **Codebase Context Packer** | Pack code files into a single optimized prompt |

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router, Lucide Icons
- **Backend**: Python 3.11+, FastAPI, SQLite, SQLAlchemy
- **Tools**: tiktoken (token counting), python-docx, markdown, PyYAML

## Getting Started

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

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:8000`.

## Project Structure

```
PassionProject/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routers/
│   │   └── services/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## License

MIT
