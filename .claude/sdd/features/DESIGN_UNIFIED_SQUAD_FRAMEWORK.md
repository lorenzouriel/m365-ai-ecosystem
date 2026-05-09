# DESIGN: Unified Squad Framework

> Technical design for merging opensquad into master-claude as one coherent `.claude/` system.

## Metadata

| Attribute | Value |
|-----------|-------|
| **Feature** | UNIFIED_SQUAD_FRAMEWORK |
| **Date** | 2026-05-05 |
| **Author** | design-agent |
| **DEFINE** | [DEFINE_UNIFIED_SQUAD_FRAMEWORK.md](./DEFINE_UNIFIED_SQUAD_FRAMEWORK.md) |
| **Status** | Ready for Build |

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    UNIFIED MASTER-CLAUDE SYSTEM                      │
├──────────────────────────┬──────────────────────────────────────────┤
│   ENGINEERING LAYER      │   CONTENT SQUAD LAYER                    │
│   (.claude/commands/)    │   (.claude/commands/squad/)               │
│                          │                                           │
│  /workflow:brainstorm    │  /squad          → main menu             │
│  /workflow:define        │  /squad create   → conversational build   │
│  /workflow:design        │  /squad run      → pipeline runner        │
│  /workflow:build         │  /squad:dashboard-design                  │
│  /workflow:ship          │                                           │
│  /review, /visual-*      │                                           │
│  /data-engineering:*     │                                           │
│                          │                                           │
│  Agents: .claude/agents/ │  Runtime: _squad/core/                   │
│  (50+ Claude Code agents)│  (prompts, best-practices, runner)       │
└──────────────────────────┴──────────────────────────────────────────┘
           │                              │
           ▼                              ▼
    Software artifacts            Squad artifacts
    (.claude/sdd/)                (squads/{name}/)
                                         │
                                  ┌──────┴──────┐
                                  │  dashboard/ │  ← React visualization
                                  │  skills/    │  ← installable skills
                                  │  .mcp.json  │  ← Playwright MCP
                                  └─────────────┘
```

---

## Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `/squad` command | Main entry point: menu, create, run, edit, skills | `.claude/commands/squad/squad.md` |
| `/squad:dashboard-design` command | 2D office visual design workflow | `.claude/commands/squad/squad-dashboard-design.md` |
| Dashboard reference | Asset catalog + code patterns for dashboard design | `.claude/commands/squad/reference.md` |
| Squad runtime core | Prompts, best-practices, runner engine | `_squad/core/` |
| Squad memory | Company profile, preferences (gitignored) | `_squad/_memory/` |
| Playwright config | Browser profile config for Sherlock | `_squad/config/playwright.config.json` |
| Installable skills | Catalog of skills users can add to squads | `skills/` |
| Squad directories | User-created squad YAML + agents + pipeline | `squads/` |
| Dashboard app | React + Phaser live visualization | `dashboard/` |
| Playwright MCP | Browser automation for Sherlock + dashboard design | `.mcp.json` |
| Unified docs | Single CLAUDE.md explaining both systems | `CLAUDE.md` |

---

## Key Decisions

### Decision 1: Keep `skills/` name at root (no rename)

| Attribute | Value |
|-----------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-05 |

**Context:** DEFINE proposed renaming `opensquad/skills/` to `squad-skills/` to avoid naming ambiguity. In practice, master-claude's root has only one directory (`opensquad/`) — there is no collision.

**Choice:** Copy as `skills/` at master-claude root. No rename.

**Rationale:** `skills.engine.md` and `runner.pipeline.md` reference `skills/{name}/SKILL.md` — keeping the name eliminates all path updates in those two files, reducing the blast radius of the migration.

**Alternatives Rejected:**
1. `squad-skills/` — would require updating `skills.engine.md` and `runner.pipeline.md` path references in addition to all other replacements

**Consequences:**
- Any future master-claude feature that needs a root `skills/` directory will need coordination — acceptable since this is personal tooling

---

### Decision 2: No `agents/` directory to copy

| Attribute | Value |
|-----------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-05 |

**Context:** DEFINE assumed opensquad had a root-level `agents/` YAML catalog. Investigation shows it does not exist — squad agents are generated per-squad inside `squads/{name}/agents/`.

**Choice:** No `agents/` directory copied. Remove from manifest.

**Rationale:** Each squad creates its own agents during the build phase. There is no global catalog to migrate.

**Alternatives Rejected:**
1. Create a placeholder `agents/` — unnecessary, would confuse with `.claude/agents/`

**Consequences:**
- Simpler migration — one fewer directory to copy

---

### Decision 3: Conversational creation replaces phased subagent orchestration

| Attribute | Value |
|-----------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-05 |

**Context:** Original opensquad creates squads in 4 phases: Discovery subagent → writes `_build/discovery.yaml` → Design subagent reads it → writes `_build/design.yaml` → Build subagent reads it. The YAML files are inter-phase handoffs. For personal use, this is ceremony.

**Choice:** Rewrite `squad.md` orchestration to run Discovery and Design inline (same conversation context). Build still dispatches a subagent — it produces final files, which justifies isolation. `_build/` artifacts are written as snapshots for resume support but are NOT required inputs for phases to proceed.

**Rationale:** Claude holds context natively. The intermediate YAMLs exist to pass state between subagents — if Discovery and Design are inline, the state lives in the conversation and subagent dispatch gets the full context injected directly in the prompt. This cuts 3 file I/O operations from the happy path.

**Alternatives Rejected:**
1. Keep subagent orchestration as-is — YAML ceremony stays, no simplification
2. Fully inline (no subagents at all) — Build produces many files; subagent isolation prevents context bloat

**Consequences:**
- Resume support is slightly weaker (relies on `_build/` snapshots being written, not on them being required)
- Sherlock investigation still uses parallel subagents — this is intentional (network I/O, benefits from parallel execution)
- Core prompt files (`_squad/core/prompts/discovery.prompt.md`, `design.prompt.md`) are NOT modified — the change is in how `squad.md` orchestrates them

---

### Decision 4: Two string replacement passes, not a file rewrite

| Attribute | Value |
|-----------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-05 |

**Context:** 12+ files need `_opensquad/` → `_squad/` replacement. The command file (`squad.md`) also needs `/opensquad` → `/squad` command references replaced.

**Choice:** Two targeted replacements:
1. `_opensquad/` → `_squad/` (path references, all affected files)
2. `/opensquad` → `/squad` (command references, only in `squad.md`)

Brand name "Opensquad" (capitalized, without slash) is preserved — it's the tool name, not the command.

**Rationale:** Surgical replacements reduce risk versus rewriting files. Preserving the Opensquad brand keeps the help text and UI copy meaningful.

**Alternatives Rejected:**
1. Full rewrite of all skill files — introduces new bugs, loses tested behavior

**Consequences:**
- Build agent must apply replacements after copying files, before declaring done
- `opensquad-dev` SKILL.md is excluded entirely (17 occurrences of `_opensquad/` all irrelevant to personal use)

---

### Decision 5: `CLAUDE.md` is a new file (unified system docs)

| Attribute | Value |
|-----------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-05 |

**Context:** master-claude has no `CLAUDE.md` at root. opensquad's `CLAUDE.md` explains only the `/opensquad` command set.

**Choice:** Create a new `CLAUDE.md` from scratch. It documents the full unified system: both the engineering workflow and the squad system, quick-start for both, directory structure.

**Rationale:** Starting fresh avoids inheriting opensquad's `/opensquad` references in a file that new Claude sessions load on startup.

**Alternatives Rejected:**
1. Extend opensquad's CLAUDE.md — would require removing opensquad-specific framing while adding master-claude context; a rewrite in disguise

**Consequences:**
- Build agent must write a new CLAUDE.md, not copy/modify the opensquad one

---

### Decision 6: Settings.local.json is excluded

| Attribute | Value |
|-----------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-05 |

**Context:** opensquad's `.claude/settings.local.json` has permissions for another user's paths (`c/Users/renat/`) and read permissions scoped to the opensquad dev workflow.

**Choice:** Do not copy `settings.local.json`. master-claude will use its own permissions model.

**Rationale:** The `renat` user paths are irrelevant and would create noise. master-claude manages its own permissions via its existing `settings.json`.

**Alternatives Rejected:**
1. Copy and clean the file — unnecessary since master-claude already has a working permissions setup

---

## File Manifest

| # | File | Action | Purpose | Dependencies |
|---|------|--------|---------|--------------|
| 1 | `_squad/` | Copy + replace | Squad runtime core (from `opensquad/_opensquad/`) | None |
| 2 | `dashboard/` | Copy | React visualization app (from `opensquad/dashboard/`) | None |
| 3 | `skills/` | Copy | Installable skills catalog (from `opensquad/skills/`) | None |
| 4 | `squads/.gitkeep` | Create | Squad output directory placeholder | None |
| 5 | `.mcp.json` | Create | Playwright MCP config (adapted from `opensquad/.mcp.json`) | 1 |
| 6 | `.claude/commands/squad/squad.md` | Create | `/squad` main command (from SKILL.md + replacements) | 1 |
| 7 | `.claude/commands/squad/squad-dashboard-design.md` | Create | `/squad:dashboard-design` command (from SKILL.md) | 1 |
| 8 | `.claude/commands/squad/reference.md` | Create | Dashboard design asset catalog (from `opensquad-dashboard-design/reference.md`) | None |
| 9 | `CLAUDE.md` | Create | Unified system documentation (new, not copied) | 6, 7 |
| 10 | `.gitignore` | Modify | Add squad privacy entries | None |

**Total:** 7 creates + 2 copies + 1 modify = 10 operations

**Note on file #1 (`_squad/` copy):** After copying, apply these replacements to ALL text files within `_squad/`:
- `_opensquad/` → `_squad/`
- No other replacements in core files (brand name "Opensquad" preserved)

**Note on file #6 (`squad.md`):** After creating from SKILL.md, apply:
- `_opensquad/` → `_squad/`
- `/opensquad` → `/squad`
- `{project-root}/_opensquad/` → `{project-root}/_squad/`

---

## Code Patterns

### Pattern 1: `.mcp.json` — adapted from opensquad

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--config", "_squad/config/playwright.config.json"]
    }
  }
}
```

Only change from opensquad: `_opensquad/config/` → `_squad/config/`.

---

### Pattern 2: `.gitignore` entries to add

```gitignore
# Squad privacy — user-owned data, never committed
_squad/_memory/
_squad/_browser_profile/

# Squad output — generated content, not source
squads/*/output/
squads/*/_build/

# Dashboard build artifacts
dashboard/node_modules/
dashboard/dist/
```

---

### Pattern 3: `CLAUDE.md` structure

```markdown
# master-claude

A unified Claude Code workspace combining software engineering workflow
and content squad orchestration.

## Quick Start

### Software Engineering
- `/workflow:brainstorm` — explore ideas (Phase 0)
- `/workflow:define`    — capture requirements (Phase 1)
- `/workflow:design`    — create architecture (Phase 2)
- `/workflow:build`     — implement (Phase 3)
- `/workflow:ship`      — archive (Phase 4)

### Content Squads (powered by Opensquad)
- `/squad`              — open the squad menu
- `/squad create`       — create a new content squad
- `/squad run <name>`   — run a squad pipeline

## Directory Structure

- `.claude/`        — commands, agents, KB, SDD workflow
- `_squad/`         — squad runtime (prompts, memory, config)
- `squads/`         — your created squads
- `skills/`         — installable squad skills
- `dashboard/`      — live squad visualization (run: cd dashboard && npm run dev)

## Rules

- Use `/workflow:*` commands for software engineering work
- Use `/squad` commands for content creation and automation
- Company context lives in `_squad/_memory/company.md`
- Squad outputs live in `squads/{name}/output/`
- Never manually edit files in `_squad/core/`
```

---

### Pattern 4: `squad.md` — command header and routing section

The `/squad` command is created from `opensquad/.claude/skills/opensquad/SKILL.md` with two passes of string replacement. The structure after replacement:

```markdown
---
name: squad
description: "Squad — Multi-agent orchestration framework. Create and run AI squads."
---

# Squad — Multi-Agent Orchestration

[SKILL.md body with replacements applied:
  - _opensquad/ → _squad/
  - /opensquad  → /squad
  - {project-root}/_opensquad/ → {project-root}/_squad/
]
```

The Create Squad section is updated to reflect conversational orchestration:

```markdown
### Create Squad — Conversational Orchestration

When the user runs `/squad create`:

### Phase 1: Discovery (INLINE — no subagent)

Run the discovery wizard inline using the discovery prompt as a guide.
Ask one question at a time. When complete, write `_build/discovery.yaml`
as a snapshot (for resume support), then proceed directly to Phase 2.
Do NOT dispatch a subagent for discovery.

### Phase 2: Investigation (subagents — parallel, unchanged)
[Sherlock subagents as before]

### Phase 3: Design (INLINE — no subagent)

With discovery context held in conversation, run the design phase inline
using `_squad/core/prompts/design.prompt.md` as a guide. Write
`_build/design.yaml` as snapshot, then proceed to Phase 4.

### Phase 4: Build (subagent — context-injected)

Dispatch a Build subagent with:
- Full discovery context (from conversation OR from _build/discovery.yaml if resuming)
- Full design context (from conversation OR from _build/design.yaml if resuming)
- `_squad/core/prompts/build.prompt.md`
Output: squad.yaml + all agent and pipeline files
```

---

### Pattern 5: `squad.md` — error messages update

All error message references inside the command that mention `/opensquad edit` become `/squad edit`. Example from runner.pipeline.md (this file is in `_squad/core/` and gets the path replacement only — the command reference here is updated separately in `squad.md`):

In `_squad/core/runner.pipeline.md`, the line:
```
- If a step file is missing, inform the user and suggest running `/opensquad edit {squad}` to fix.
```
Becomes:
```
- If a step file is missing, inform the user and suggest running `/squad edit {squad}` to fix.
```

This replacement is part of the `_squad/` post-copy cleanup — add `/opensquad` → `/squad` to the replacement pass for `runner.pipeline.md` as well.

---

## Data Flow

```text
User invokes /squad
    │
    ▼
squad.md loads _squad/_memory/company.md + preferences.md
    │
    ├── MENU → /squad run {name}
    │              │
    │              ▼
    │          runner.pipeline.md executes steps
    │              │
    │              ├── inline steps → persona switch in conversation
    │              ├── subagent steps → Task tool dispatch
    │              └── checkpoint steps → AskUserQuestion
    │
    └── /squad create
           │
           ▼
       Discovery wizard (INLINE)
           │
           ▼
       Sherlock investigation (SUBAGENTS, parallel if multiple URLs)
           │
           ▼
       Design phase (INLINE, context from conversation)
           │
           ▼
       Build subagent (full context injected)
           │
           ▼
       squads/{name}/squad.yaml + agents/ + pipeline/
```

---

## Integration Points

| External System | Integration Type | Authentication |
|-----------------|-----------------|----------------|
| Playwright (browser) | MCP server via `.mcp.json` | None — local browser |
| Social platforms (Sherlock) | Playwright browser automation | Persistent session in `_squad/_browser_profile/` |
| Skill APIs (apify, blotato, etc.) | Per-skill MCP or script | Environment variables per skill |
| dashboard app | Local HTTP (localhost:5173) | None — local dev server |

---

## Testing Strategy

This is a `.claude/` configuration migration — there is no production code. Testing is verification-based:

| Test | Scope | Method | Pass Condition |
|------|-------|--------|----------------|
| Path integrity | No `_opensquad/` references remain | `grep -r "_opensquad/" .claude/ _squad/ .mcp.json` returns empty | Zero matches |
| Command resolution | `/squad` activates correctly | Run `/squad` in Claude Code | Menu displays, company context loaded |
| Squad creation | Conversational flow works | Run `/squad create "test squad"` | Squad files generated in `squads/` |
| Dashboard | App starts | `cd dashboard && npm run dev` | Vite server starts on configured port |
| Screenshot | Playwright MCP works | Run `/squad:dashboard-design` with dashboard running | Screenshot taken, diagnosis presented |
| Existing commands | master-claude commands unaffected | Run `/workflow:brainstorm`, `/review` | Work identically to pre-merge |
| Gitignore | Private dirs not tracked | `git status` after creating `_squad/_memory/company.md` | File not listed as tracked |

---

## Error Handling

| Error Type | Handling Strategy |
|------------|-------------------|
| `company.md` empty/missing | Trigger onboarding flow — ask name, language, company |
| `_squad/_memory/` missing | Create directory on first `/squad` run |
| Squad not found for `/squad run` | List available squads from `squads/` directory |
| Playwright MCP not configured | Surface setup error: "Ensure `.mcp.json` exists and npx @playwright/mcp is available" |
| Skill not installed | Ask user to install: "Skill '{name}' not found. Install via `/squad install {name}`?" |
| `_build/` artifacts from prior session | Show summary, offer continue vs. restart |
| `dashboard/` not running | Tell user: `cd dashboard && npm run dev` |

---

## Security Considerations

- `_squad/_memory/` contains company profile (potentially sensitive) — gitignored
- `_squad/_browser_profile/` contains browser sessions (login cookies) — gitignored
- Skill env variables (API keys) must be set per skill, never hardcoded
- `.mcp.json` is committed — it contains no secrets (only command structure)
- `squads/*/output/` gitignored — generated content may contain proprietary data

---

## Build Phase Execution Order

The build agent should execute tasks in this exact sequence to respect dependencies:

```text
Phase A — Copy independent directories (parallel):
  A1. Copy opensquad/_opensquad/ → _squad/
  A2. Copy opensquad/dashboard/ → dashboard/
  A3. Copy opensquad/skills/ → skills/

Phase B — Post-copy string replacements (sequential after A1):
  B1. Replace _opensquad/ → _squad/ in all _squad/ text files
  B2. Replace /opensquad → /squad in _squad/core/runner.pipeline.md

Phase C — Create command files (after B):
  C1. Create .claude/commands/squad/squad.md (SKILL.md + B1 + B2 replacements)
  C2. Create .claude/commands/squad/squad-dashboard-design.md (SKILL.md verbatim)
  C3. Create .claude/commands/squad/reference.md (copy from opensquad-dashboard-design/reference.md)

Phase D — Create config and scaffold files (parallel with C):
  D1. Create .mcp.json (adapted pattern above)
  D2. Create squads/.gitkeep
  D3. Modify .gitignore (add entries)

Phase E — Create documentation (after C):
  E1. Create CLAUDE.md (new unified doc)

Phase F — Verification:
  F1. grep -r "_opensquad" .claude/commands/squad/ _squad/ .mcp.json → must return 0 results
  F2. Confirm squads/, dashboard/, skills/ directories exist
  F3. Confirm .mcp.json references _squad/config/
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-05 | design-agent | Initial version — corrected DEFINE assumptions (no agents/ catalog, skills/ keeps name, CLAUDE.md is new file) |

---

## Next Step

**Ready for:** `/build .claude/sdd/features/DESIGN_UNIFIED_SQUAD_FRAMEWORK.md`
