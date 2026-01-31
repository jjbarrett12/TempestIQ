# Let the agent run without approval

To let the AI work for hours without you accepting each command:

1. **Cursor Settings** → **Features** → **Chat** (or **Agent**):
   - Enable **"Enable auto-run mode"** (or similar) if available.
   - If there is a **Command allowlist**, add: `npm`, `npx`, `node`, and any other commands you want to run without a prompt (e.g. `git` for read-only, or leave empty to allow all when auto-run is on).

2. **Permission prompts**: Commands that need network, git, or full access may still show a one-time approval. Approve once per session or add the command to the allowlist if Cursor offers it.

3. **This project** has a rule (`.cursor/rules/autonomous.mdc`) that tells the agent to work autonomously and run what’s needed without asking. With auto-run enabled in Cursor, the agent will proceed without waiting for you to accept each step.

Settings names may vary by Cursor version; look for "auto-run", "allowlist", or "approval" under Features/Chat/Agent.
