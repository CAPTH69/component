# Shyc — Text to Component

Type a description, get a live, rendered React component — instantly.

**Live demo:** https://component-nine-psi.vercel.app/

## What it does
Describe a UI component in plain English (e.g. "a pricing card with three tiers"),
and Shyc generates the React + Tailwind code and renders it live in the browser.

## Stack
- Next.js + TypeScript
- LLM-based code generation (via Replicate)
- Sandpack for live in-browser preview
- Tailwind CSS

## How it works
1. You enter a description.
2. The prompt is sent to an LLM that returns a self-contained React component.
3. The code is cleaned and rendered live using Sandpack, with Tailwind loaded into the preview.

## Running locally
\`\`\`
npm install
npm run dev
\`\`\`
Add your Replicate API token to \`.env.local\`:
\`\`\`
REPLICATE_API_TOKEN=your_token_here
\`\`\`

## Roadmap
- [ ] Self-improving generation: the AI judges its own output and iterates until the design holds up
- [ ] Copy-to-clipboard for generated code
- [ ] More component examples

Built in public — feedback welcome.
