# AlgoForge — Competitive Prep Platform

AlgoForge is an elite, full-stack competitive programming preparation application designed locally to help college students dominate DSA competitions. It features a curated list of 100 high-difficulty, array-heavy LeetCode problems, a dark "brutalist terminal" aesthetic, and a real-time Socratic AI Coach powered by OpenAI.

---

## 🚀 Features

- **The Forge Archive:** 100 hand-curated competitive programming problems categorized into 14 topics (Arrays, Trees, Flow Network, etc.).
- **Live AI Coach (OpenAI):** Not just answers! Real-time streaming AI coach (using Server-Sent Events) that guides you through time complexity, space complexity, and provides both Python AND C++ snippets.
- **Persistent Notes & Progress:** Save your personal engineering notes per problem securely using Supabase.
- **Advanced Dashboard:** Profile stat calculations, 180-day pure CSS contribution heatmaps, algorithmic pattern mastery tagging, and export to JSON!
- **Terminal Aesthetics:** Custom global fonts, CRT scanline overlays, neon green alerts, and glowing elements simulating an immersive engineering environment.
- **PWA Ready:** Install AlgoForge natively to your Desktop/Mobile device for focused coding. Local caching included.

---

## 🛠 Tech Stack

**Frontend:** Vite, React (Suspense Lazy Loading), TypeScript, TailwindCSS  
**State Management:** Zustand, React Context (Auth, Toasts)  
**Database/Auth:** Supabase, PostgreSQL, Row Level Security (RLS) policies  
**AI Services:** Supabase Edge Functions + OpenAI GPT-4o API  

---

## 🏗 Setup & Installation

### 1. Clone & Install Dependencies
\`\`\`bash
npm install
# Also install PWA types
npm install -D vite-plugin-pwa
\`\`\`

### 2. Connect Your Database (Supabase)
Rename `.env.example` to `.env` and provide your Live Supabase tokens:
\`\`\`env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
\`\`\`

You also need local env variables for backend scripts. Create `.env.local`:
\`\`\`env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
\`\`\`

### 3. Run the Initial Schema
Head over to your Supabase Project dashboard, open the **SQL Editor**, and paste the contents of `supabase/schema.sql` to setup your tables and Auth policies securely. Or run:
\`\`\`bash
supabase db push
\`\`\`

### 4. Seed the 100 Problems
Run the database seeder to bypass RLS and populate all curated content:
\`\`\`bash
npx tsx src/scripts/seedProblems.ts
\`\`\`

---

## 🤖 Deploying the AI Tutor (Edge Function)

The AI tutor connects securely to OpenAI using Supabase Edge Functions.

1. Add your OpenAI API key to your Supabase Secrets vault:
\`\`\`bash
npx supabase secrets set OPENAI_API_KEY=sk-your-key-here
\`\`\`

2. Deploy the Streaming Edge Function:
\`\`\`bash
npx supabase functions deploy ai-tutor --no-verify-jwt
\`\`\`
*(Note: JWT validation is handled manually inside the Deno script).*

---

## ☁️ Deploying to Render (Frontend)

AlgoForge comes pre-configured with a `render.yaml` Blueprint for 1-click infrastructure-as-code deployment to Render as a Static Site.

1. Create a new account on [Render.com](https://render.com) and link your GitHub repository.
2. In the Render dashboard, click **New +** > **Blueprint**.
3. Connect your AlgoForge repository. Render will automatically detect the `render.yaml` file.
4. It will prompt you to enter the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Click **Apply**. Render will automatically:
   - Run `npm install && npm run build`
   - Publish the `./dist` directory
   - Configure the `/*` to `/index.html` rewrite rule required for React Router SPAs.

---

## 💻 Running the App

Start your application locally. Page routes are dynamically lazy-loaded using React Suspense!
\`\`\`bash
npm run dev
\`\`\`

### Global Keyboard Shortcuts Reference
- `?` - Show global command palette over any page
- `G then D` - Go to Dashboard
- `G then P` - Go to Problems List
- `G then R` - Go to Profile Heatmap
- `/` - Trigger problem search 

---

*“Code as if the machine is breathing down your neck.”* — AlgoForge
