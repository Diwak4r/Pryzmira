<div align="center">

# Pryzmira

**Syntactic Voice Cloning & Personal Writing AI Engine**

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-AI_Inference-F04E23?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Author](https://img.shields.io/badge/Author-Diwakar_Yadav-000000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Diwak4r)

</div>

---

### Overview

**Pryzmira** is a specialized voice synthesis platform designed to eliminate robotic AI writing signatures. By analyzing a single writing sample provided by the user, Pryzmira extracts unique syntactic patterns, cadence, and vocabulary choices to generate text that authentically sounds like the author—not an LLM template.

### Voice Synthesis Pipeline

```mermaid
graph TD
    UserSample[User Writing Sample] --> Encoder[Groq Voice Analysis Engine]
    PromptReq[Target Topic / Prompt] --> Encoder
    
    Encoder --> SyntacticProfile[Extracted Cadence & Pattern Profile]
    SyntacticProfile --> Generator[LLM Generation Engine - Groq / OpenRouter]
    
    Generator --> OutputText[Human-Authentic Output]
```

### Stack Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend & Routing** | Next.js 16 (App Router), React 19, Tailwind CSS |
| **Primary AI Engine** | Groq Llama 3 / Mixtral Inference API |
| **Fallback AI Engine** | OpenRouter Gateway |
| **Database & Auth** | Supabase (User Sessions & Storage) |

### Development Setup

```bash
# Clone & install dependencies
cd next-web
npm install

# Run local development server
npm run dev
```

#### Required Environment Variables (`.env.local`)

```env
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

<div align="center">
  <sub>Developed by <a href="https://github.com/Diwak4r">Diwakar Yadav</a></sub>
</div>
