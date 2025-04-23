
# AI Notes

AI Notes is a modern, fullstack note-taking web application built with React, Vite, TypeScript, Shadcn UI, and Tailwind CSS. It enables users to quickly create, edit, tag, and organize notes, and features AI-powered summarization to make large notes or articles digestible in seconds.

## Features

- ✨ **AI Summarization:** Quickly summarize long notes using the built-in AI assistant (requires Supabase + API key configuration).
- 📝 **Rich Note Editing:** Create, update, and delete notes with title, tags, and markdown-style formatting.
- 🔖 **Tagging & Favorites:** Add tags, filter, and mark notes as favorites for quick access.
- 🔒 **Authentication:** Secure sign-up, login, and user session management (provided by Supabase).
- 🗄️ **Persistent Cloud Storage:** Notes and user data are stored securely via Supabase Postgres.
- 🚀 **Fully Responsive UI:** Mobile-first, fast, and accessible interface.

## Demo

You can quickly try the app by running it locally (see steps below), or deploy it to your favorite platform (Vercel, Netlify, etc.).

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-notes.git
cd ai-notes
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Set up Supabase

You’ll need a free [Supabase](https://supabase.com/) project.

- Create a project on Supabase.
- Get your Project URL (e.g., `https://your-project-id.supabase.co`).
- Create a table for storing notes and enable authentication (email setup recommended).
- Make sure your Edge Functions are deployed (see the `supabase/functions` directory).

#### Environment variables

On Vercel, go to your project's Settings > Environment Variables:

- `VITE_SUPABASE_URL` — Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon/public API key

**Local development:**  
Create a `.env` file at the project root (do **not** commit to git) with:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the app

```bash
npm run dev
```

### 5. Deploy to Vercel

- [Deploy on Vercel](https://vercel.com/new)
- Set your environment variables for Supabase as above.
- Build and deploy.

## AI Summarization

AI functions are powered by the `/supabase/functions/generate-summary` Edge Function, which safely proxies requests to your configured AI provider (e.g., Euron API key set as an Edge Function Secret).

### Setting up the AI summary Edge Function

1. Install the Supabase CLI if needed:  
   `npm install -g supabase`

2. Deploy the function:
   ```bash
   cd supabase/functions/generate-summary
   supabase functions deploy generate-summary
   ```

3. Set your AI provider API key secret:
   ```bash
   supabase secrets set EURON_API_KEY=your_api_key_here
   ```

4. Update rules and CORS as needed in the Supabase dashboard.

## Technologies Used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/) (icons)

## Folder Structure

- `src/` — Main application source code
- `src/components/` — React UI components
- `src/services/` — API and utility functions
- `src/pages/` — Page components for routing
- `supabase/` — Supabase Edge Functions and config

## Contributing

Feel free to open issues or PRs! All feedback and ideas are welcome.

## License

[MIT](LICENSE)

---

Made with ❤️ by Rajat Tyagi
