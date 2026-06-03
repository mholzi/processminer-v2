# Processminer v3 — Web Application & AI Discovery Engine

Processminer v3 is a Next.js web application and AI-driven process discovery tool designed to help capture, document, and refine operational processes.

This repository supports dual-track AI execution:
1. **Gemini Integration (GenAI)**: Runs in-process via the Google GenAI SDK.
2. **Claude Integration**: Runs via the local Claude CLI, connecting to a custom schema-enforced Model Context Protocol (MCP) server.

---

## 1. Quick Start Local Setup

### Step 1: Install Dependencies
Run the following command to install the required Node modules:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

> [!IMPORTANT]
> `.env.local` is listed in `.gitignore` under the rule `.env.*` and will never be committed to git. This keeps your API keys and admin secrets safe on your local machine.

Open `.env.local` in your editor and configure the variables:

1. **Session Secret**: Generate a secure random signing secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Set it to `PM_SESSION_SECRET`.

2. **Bootstrap Admin**:
   Set `PM_BOOTSTRAP_ADMIN_PASS` to a secure initial password. On first launch, Processminer will bootstrap an admin account in `data/users.json` using these details.

---

## 2. Choosing and Configuring your AI Session Provider

You can configure the model settings in `.env.local` using `SESSION_PROVIDER` and `SESSION_MODEL`.

### Option A: Gemini / GenAI Setup (In-Process)
Use this option if you want to test or run the application using Google's Gemini models.
- Set `SESSION_PROVIDER=gemini`
- Set `SESSION_MODEL` to your chosen Gemini model, e.g., `gemini-2.5-flash` or `gemini-2.5-pro`.
- Set `GEMINI_API_KEY` to your Google AI Studio API key.

### Option B: Claude CLI Setup (via MCP Server)
Use this option if you are testing using Anthropic's Claude CLI.
- Set `SESSION_PROVIDER=claude`
- Set `SESSION_MODEL` to your chosen Claude model, e.g., `claude-sonnet-4-6`.
- **Install Claude CLI**: Ensure you have the `claude` command line utility installed and authenticated on your machine (`claude login`).
- **MCP Server Registration**: The local Claude CLI will automatically discover the custom MCP server via the `claude.json` configuration file in the project root. It executes `src/lib/claude-mcp-server.ts` to provide strict schema enforcement and tools.

---

## 3. Running the App Locally

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will prompt you to log in. Use the bootstrap credentials defined in your `.env.local`.

---

## 4. Verification & Testing

To run typescript check and verify types:
```bash
npm run typecheck
```
