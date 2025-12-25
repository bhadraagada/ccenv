# Claude Env (ccx or ccenv-cli)

**Environment Orchestrator and Context Switcher for Claude Code CLI**

Switch AI backends with a single command. Like `nvm` for Node.js, but for your Claude Code AI provider.

## Why?

Every time you want to switch Claude Code from the official Anthropic API to OpenRouter, DeepSeek, or a local Ollama instance, you have to manually set environment variables. This tool eliminates that friction by letting you:

- Save provider configurations as **profiles**
- Switch between them with a single command
- Keep your API keys encrypted and secure
- Support multiple shells (bash, zsh, fish, PowerShell, cmd)

**Zero server required** - Unlike proxy-based solutions, ccx just manages environment variables.

## Installation

```bash
npm install -g ccenv-cli
```

## Quick Start

### 1. Create a profile

```bash
# Using a template
ccx create work --template openrouter --api-key sk-or-xxxxx

# Or use the interactive wizard
ccx setup
```

### 2. Run Claude with your profile

**Easiest way (recommended):**
```bash
ccx run work
```

This launches Claude Code directly with the profile's environment - no shell tricks needed!

**Alternative: Activate in current shell**
```bash
# Bash/Zsh
eval "$(ccx use work)"

# PowerShell
iex (ccx use work --shell powershell)

# Fish
ccx use work --shell fish | source

# Then run claude normally
claude
```

### 3. Switch back to official Anthropic

```bash
# Run with default settings
ccx run

# Or reset your shell environment
eval "$(ccx reset)"  # bash/zsh
iex (ccx reset --shell powershell)  # PowerShell
```

## Web UI

Prefer a graphical interface? ccenv now includes a web-based UI for easy profile management!

### Start the Web UI

```bash
# Build first (one-time setup)
npm run build

# Start web server
npm run web

# For development mode (auto-reload)
npm run web:dev
```

The web UI will be available at `http://localhost:3000`

### Web UI Features

Prefer a graphical interface? ccenv now includes a web-based UI for easy profile management!

### Start the Web UI

```bash
# Run the web server (development mode)
npm run web

# Or build and run
npm run build-web
```

The web UI will be available at `http://localhost:3000`

### Web UI Features

- **Dashboard**: View all profiles and current active profile at a glance
- **Create/Edit Profiles**: Full form interface with template support
- **One-Click Activation**: Generate shell commands for any profile
- **Export/Import**: Share profiles with team members
- **Multiple Shell Support**: Generate commands for Bash, Zsh, Fish, PowerShell, and CMD

The web UI uses the same secure, encrypted storage as the CLI, so your API keys remain safe.

## Commands

| Command | Description |
|---------|-------------|
| `ccx run [profile]` | **Launch Claude with a profile directly** |
| `ccx setup` | Interactive profile setup wizard |
| `ccx create <name>` | Create a new profile |
| `ccx list` | List all profiles |
| `ccx show <name>` | Show profile details |
| `ccx edit <name>` | Edit an existing profile |
| `ccx delete <name>` | Delete a profile |
| `ccx use <name>` | Activate a profile (outputs shell script) |
| `ccx reset` | Reset environment to default |
| `ccx current` | Show current profile status |
| `ccx templates` | List available provider templates |
| `ccx export <name>` | Export profile as JSON |
| `ccx import <json>` | Import profile from JSON |

## Available Templates

| Template | Description | Default Model |
|----------|-------------|---------------|
| `official` | Anthropic Official API | claude-sonnet-4-20250514 |
| `openrouter` | OpenRouter multi-model | anthropic/claude-sonnet-4 |
| `openrouter-minimax` | MiniMax via OpenRouter | minimax/minimax-m1-80k |
| `openrouter-deepseek` | DeepSeek via OpenRouter | deepseek/deepseek-chat-v3-0324 |
| `deepseek` | DeepSeek Direct API | deepseek-chat |
| `gemini` | Google Gemini | gemini-2.5-flash |
| `ollama` | Local Ollama | qwen2.5-coder:latest |
| `lmstudio` | Local LM Studio | local-model |
| `groq` | Groq fast inference | llama-3.3-70b-versatile |
| `together` | Together AI | Meta-Llama-3.1-70B |
| `custom` | Custom endpoint | (your choice) |

## Examples

### Create profiles for different use cases

```bash
# High-stakes work with official Claude
ccx create pro --template official

# Budget-friendly coding with DeepSeek
ccx create budget --template openrouter-deepseek --api-key sk-or-xxxxx

# Local offline mode
ccx create local --template ollama

# Custom provider
ccx create myproxy --base-url http://localhost:8080/v1 --api-key my-key --model gpt-4
```

### Shell integration (add to .bashrc/.zshrc)

```bash
# Function to switch profiles easily
ccx-switch() {
  eval "$(ccx use $1)"
  echo "Switched to profile: $1"
}

# Aliases
alias cc-pro='ccx-switch pro'
alias cc-budget='ccx-switch budget'
alias cc-local='ccx-switch local'
alias cc-reset='eval "$(ccx reset)"'
```

### PowerShell integration (add to $PROFILE)

```powershell
function Switch-Claude {
  param([string]$Profile)
  Invoke-Expression (ccx use $Profile --shell powershell)
  Write-Host "Switched to profile: $Profile"
}

Set-Alias cc-switch Switch-Claude
```

## How It Works

1. **Profiles are stored** in `~/.config/claude-env/config.json` (cross-platform via `conf`)
2. **API keys are encrypted** using AES-256 with a machine-specific key
3. **`ccx use`** outputs shell-specific export commands for `eval`
4. **Environment variables set:**
   - `ANTHROPIC_BASE_URL` - The API endpoint
   - `ANTHROPIC_AUTH_TOKEN` - Your API key
   - `ANTHROPIC_MODEL` - The model to use
   - `ANTHROPIC_API_KEY` - Unset when using proxies (important!)
   - `CCX_ACTIVE_PROFILE` - Tracks the active profile

## Security

- API keys are encrypted at rest using AES-256-CBC
- Encryption key is derived from machine-specific info (hostname + username)
- Keys are never logged or exposed in plain text
- Export command excludes API keys by default

## Comparison with claude-code-router

| Feature | ccx | claude-code-router |
|---------|-----|-------------------|
| Architecture | Env vars only | Local proxy server |
| Background process | No | Yes |
| Profile switching | Instant | Requires restart |
| Request routing | N/A | Yes (background/think/etc) |
| Custom transformers | N/A | Yes |
| Complexity | Low | High |

**Use ccx if:** You want simple, fast profile switching without running a server.

**Use claude-code-router if:** You need advanced request routing or custom transformers.

## Troubleshooting

### "Profile not taking effect" (when using `ccx use`)

Make sure you're using `eval` or `iex`:
```bash
# Wrong
ccx use work

# Right
eval "$(ccx use work)"
```

**Or just use `ccx run` instead** - it handles everything for you:
```bash
ccx run work
```

### "Shell not detected correctly"

Specify the shell explicitly:
```bash
ccx use work --shell zsh
```

### "Config file location"

```bash
ccx config-path
```

## License

MIT
