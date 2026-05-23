# Lead Management App

A lead management web app built with React + Express + SQLite. You can track leads, add notes, and get Gemini to summarize all notes for a lead.

---

## Tech Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6
* **Backend**: Node.js, Express, TypeScript, Zod for request validation
* **Database**: SQLite via Prisma ORM
* **AI**: Google Gemini 2.5 Flash (`@google/generative-ai`)

---

## How to Run

### Locally

```bash
npm install
cp backend/.env.example backend/.env
#add gemini_api_key
npm run dev
```
Currently starts both backend and frontend. 

### Docker

```bash
docker-compose up --build
```

Frontend at `http://localhost:8080`
Backend at `http://localhost:3000`.

---

## Structure

* Gemini call is isolated in `backend/src/services/ai.service.ts`
* Zod validates request bodies before anything touches the database
* Frontend API calls are wrapped in custom hooks (`useLeads`, `useNotes`, `useAI`) to keep components clean
* AI summary returns as a draft the user can edit before saving as a note, since LLM output needs review anyway

---

## Trade-offs

* SQLite for zero setup locally. I think postgresql would be better for production 
* No auth, as it wasn't mentioned in the scope of assessment

---

## AI Usage

**Tools used for development**: GitHub Copilot 

**Model used in the app**:`gemini-2.5-flash`

**Where it helped:**
* Express and TypeScript boilerplate setup
* Initial structure for the `@google/generative-ai` SDK calls

**Where it got things wrong:**

* Used `mode: "insensitive"` in Prisma search filters, which is Postgres only and crashes on SQLite. Fixed by doing case insensitive filtering in JS instead
* Generated `import` instead of `import type` for React types, which breaks Vite's isolated modules build
* Suggested putting `@apply` directives in Tailwind layers before the classes existed, causing build errors. Ended up writing styles directly

**What I fixed manually:**
* Rewrote SQLite queries to handle case insensitive search in application memory
* Replaced broken Tailwind layer directives with direct utility classes
* Tuned the summarization prompt in `ai.service.ts` to keep outputs between 50 and 100 words
* Fixed React imports to use `import type` where Vite required it

**Prompt used for the AI service:**

> "How to write a typescript service in nodejs to query gemini-2.5-flash to get a text summary from an array collection of strings"