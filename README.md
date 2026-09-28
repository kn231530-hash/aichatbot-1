# AI Chatbot 1

A simple Next.js AI chatbot using Groq for responses and Supabase for message storage.

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`.
3. Add your Groq API key to `GROQ_API_KEY`.
4. Add the Supabase publishable key.
5. Run `npm run dev`.

Never commit `.env.local` or any Groq secret key.

## Deploy

Deploy the repository to Vercel and add the same environment variables in the Vercel project settings.

## Vercel build

The project uses direct relative imports for Supabase server/client files and does not require a webpack alias. Deploy the `main` branch and use a fresh deployment after pulling the latest commit.
