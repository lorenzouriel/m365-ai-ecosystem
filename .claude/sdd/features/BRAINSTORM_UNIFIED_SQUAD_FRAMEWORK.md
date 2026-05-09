# BRAINSTORM: Unified Squad Framework

> Exploratory session to clarify intent and approach before requirements capture

## Metadata

| Attribute | Value |
|-----------|-------|
| **Feature** | UNIFIED_SQUAD_FRAMEWORK |
| **Date** | 2026-05-05 |
| **Author** | brainstorm-agent |
| **Status** | Ready for Define |

---

## Initial Idea

**Raw Input:** Merge the opensquad workflow (`opensquad/`) into master-claude's `.claude/` directory — creating a single, unified `.claude/` that joins both systems into something authoral.

**Context Gathered:**
- `master-claude/.claude/` contains a full AgentSpec framework: 50+ specialized sub-agents (`agents/`), SDD workflow commands (`commands/workflow/`), data engineering commands, visual explainer commands, and a knowledge base (`kb/`)
- `opensquad/.claude/skills/` contains 3 skill files: `opensquad` (main orchestration), `opensquad-dev` (distribution checklist), `opensquad-dashboard-design` (visual office designer)
- Both systems use identical SKILL.md / command frontmatter (`name` + `description`) — conversion is a rename, not a rewrite
- opensquad's core files live in `_opensquad/` at the project root, referenced by path from skills
- opensquad is a full npm package with: CLI (`bin/` + `src/`), agent catalog (`agents/`), skills catalog (`skills/`), React dashboard (`dashboard/`), distribution templates (`templates/`)
- Both systems implement the same underlying loop: discover → design → build → run, just for different domains (software vs. content/marketing)

**Technical Context Observed (for Define):**

| Aspect | Observation | Implication |
|--------|-------------|-------------|
| Command format | Both systems use identical YAML frontmatter | Zero-friction conversion from `SKILL.md` to `commands/*.md` |
| Path references | opensquad skills reference `_opensquad/` at project root | Core files must stay at root (or all paths update) |
| Memory systems | opensquad: `_opensquad/_memory/company.md`; master-claude: Claude's auto-memory | Different concerns — both should coexist under one structure |
| Agent paradigm | master-claude: Claude Code sub-agents; opensquad: YAML squad agents | Different systems — can coexist and cross-reference |
| IDE support | opensquad supports 4 IDEs (Claude Code, Antigravity, OpenCode, Codex) | Only Claude Code needed here |

---

## Discovery Questions & Answers

| # | Question | Answer | Impact |
|---|----------|--------|--------|
| 1 | Which `.claude/` is the target — master-claude repo, global `~/.claude/`, or a new standalone? | master-claude repo `.claude/` | All changes scoped to this workspace |
| 2 | How to handle the `skills/` vs `commands/` structural difference? | Convert to `commands/` for consistency | No `skills/` directory needed; SKILL.md → `.md` rename |
| 3 | Should opensquad's runtime dependencies (`_opensquad/`, agents, skills catalog) also be brought in? | Yes — full experience | Full opensquad capability, not just commands |
| 4 | Should the Playwright MCP (`.mcp.json`) be merged? | Yes | `opensquad-dashboard-design` works fully |
| 5 | Can Approach A (full copy) deliver everything in opensquad? | No — dashboard, agents catalog, skills catalog, CLI excluded | Scope must include `dashboard/`, `agents/`, `skills/` directories |
| 6 | What does "authoral" mean — unified identity, simplified opensquad, or elevated master-claude? | Unified identity + simplified opensquad | One mental model, one tool, less ceremony |

---

## Sample Data Inventory

| Type | Location | Count | Notes |
|------|----------|-------|-------|
| Existing skills | `opensquad/.claude/skills/` | 3 | `opensquad`, `opensquad-dev`, `opensquad-dashboard-design` |
| Existing commands | `master-claude/.claude/commands/` | 20+ | workflow, core, data-engineering, review, visual-explainer |
| Existing agents | `master-claude/.claude/agents/` | 50+ | Organized by domain: architect, cloud, data-engineering, platform, python, test, workflow |
| opensquad core | `opensquad/_opensquad/core/` | 10+ files | Prompts (discovery, design, build, sherlock), best-practices, runner, skills engine |
| opensquad agents | `opensquad/agents/` | N | YAML squad agent definitions (content creators, researchers, etc.) |
| Dashboard app | `opensquad/dashboard/` | Full app | React + Phaser 2D virtual office |

**How samples will be used:**
- Existing command files as format reference when writing new unified commands
- opensquad core prompts as-is (no rewrite needed for runtime behavior)
- Agent catalog as reference for available squad member types

---

## Approaches Explored

### Approach A: "Two Worlds, One Home"

**Description:** Keep opensquad and master-claude as distinct namespaces but under one `.claude/`. One CLAUDE.md, shared memory, cleaned structure. `/opensquad` commands for content, `/workflow` commands for software.

**Pros:**
- Lower risk — both systems stay intact
- Faster to implement
- No rewriting of command logic

**Cons:**
- Still feels like two tools bolted together
- User must mentally switch between `/opensquad` and `/workflow` paradigms
- No shared identity or unified mental model

---

### Approach B: "One Framework" ⭐ Selected

**Description:** Merge the workflows conceptually. Both SDD phases and opensquad squad phases are the same loop. Unify into one command namespace, simplify opensquad's ceremony, and let master-claude's engineering agents become first-class squad members alongside opensquad's content agents.

**Key design decisions:**
- `/squad` namespace replaces `/opensquad` — feels like a native part of master-claude
- `_squad/` replaces `_opensquad/` at root — integrated naming
- Squad creation is conversational — no `discovery.yaml`/`design.yaml` intermediate files (they are outputs of the final build, not ceremony)
- master-claude's `.claude/agents/` are selectable as squad members
- Company memory at `_squad/_memory/company.md`, Claude's auto-memory stays separate
- Dashboard stays as-is (`dashboard/`)
- One CLAUDE.md that explains the full unified system

**Pros:**
- Truly authoral — one mental model for software engineering AND content automation
- Less overhead — cut the YAML file ceremony during creation flow
- master-claude's specialized agents (data engineering, cloud, etc.) can be used in content squads
- Single coherent identity

**Cons:**
- More design work upfront
- Requires rewriting the main opensquad entry-point command as `/squad`
- Needs a new CLAUDE.md that explains both systems as one

**Why Selected:** Both systems are already doing the same thing — orchestrating specialized agents through a phased workflow. The only difference is domain (software vs. content). One framework serves both without duplication.

---

## Selected Approach

| Attribute | Value |
|-----------|-------|
| **Chosen** | Approach B — "One Framework" |
| **User Confirmation** | 2026-05-05 |
| **Reasoning** | User wants unified identity + simplified opensquad. Not two tools. One authoral system. |

---

## Key Decisions Made

| # | Decision | Rationale | Alternative Rejected |
|---|----------|-----------|----------------------|
| 1 | Rename `_opensquad/` → `_squad/` at root | Feels integrated, not like a dependency | Keep as `_opensquad/` (foreign naming) |
| 2 | Replace `/opensquad` with `/squad` namespace | Native to master-claude, not a plugin feel | Keep `/opensquad` (feels bolted on) |
| 3 | Convert SKILL.md → `commands/squad/` | Consistent with existing master-claude structure | Add separate `skills/` directory |
| 4 | Remove intermediate YAML files from creation flow | Ceremony without value; Claude holds context natively | Keep discovery.yaml + design.yaml |
| 5 | Merge `.mcp.json` (Playwright) | Dashboard design skill needs it | Skip (breaks dashboard feature) |
| 6 | Keep `dashboard/` as-is | It's a standalone app — no integration needed | Absorb into master-claude structure |

---

## Features Removed (YAGNI)

| Feature | Reason Removed | Can Add Later? |
|---------|----------------|----------------|
| `opensquad-dev` skill | It's a distribution checklist for npm package maintainers, not a user-facing feature | Yes |
| `bin/` + `src/` (CLI) | Not needed — files are already in place, `npx opensquad` is irrelevant | Yes |
| Multi-IDE templates (`antigravity/`, `opencode/`, `codex/`) | Only Claude Code is used here | Yes |
| `templates/` directory | Used by CLI for `npx opensquad init` — not relevant to personal use | Yes |
| `discovery.yaml` / `design.yaml` as creation inputs | Claude holds context natively; these become outputs of Build phase only | Yes |
| `.github/workflows/ci.yml` | Package CI — not relevant to personal `.claude/` | No |

---

## Incremental Validations

| Section | Presented | User Feedback | Adjusted? |
|---------|-----------|---------------|-----------|
| Target scope (which `.claude/`) | ✅ | Option (a) — master-claude repo | No adjustment needed |
| Structure approach (skills vs commands) | ✅ | Option (b) — convert to `commands/` | No adjustment needed |
| Full vs partial scope | ✅ | Option (a) — full experience, find improvements | Added simplification angle |
| Approach selection | ✅ | Option (b) + simplification — "One Framework" | Merged A+B into unified approach |

---

## Suggested Requirements for /define

### Problem Statement (Draft)
Create a single unified `.claude/` framework that combines master-claude's software engineering workflow with opensquad's content squad orchestration — one tool, one mental model, authoral identity.

### Target Users (Draft)
| User | Pain Point |
|------|------------|
| Lorenzo (solo) | Two separate `.claude/` systems with different conventions, no shared identity |
| Future collaborators | Complex onboarding — need to understand two distinct frameworks |

### Success Criteria (Draft)
- [ ] `/squad` commands replace `/opensquad` with zero loss of functionality
- [ ] `_squad/` contains all opensquad core files (prompts, best-practices, memory, config)
- [ ] master-claude's Claude Code agents are usable as squad members
- [ ] Dashboard app works from master-claude workspace
- [ ] Playwright MCP is configured and functional
- [ ] Single CLAUDE.md explains the full unified system
- [ ] Squad creation works conversationally without intermediate YAML ceremony
- [ ] All existing master-claude commands (`/workflow:*`, `/review`, `/visual-explainer:*`, etc.) continue working

### Constraints Identified
- `_squad/` must live at the project root (opensquad skill paths are relative to root)
- `_squad/_memory/` and `_squad/_browser_profile/` must be gitignored (user data)
- Playwright MCP must not conflict with any existing MCP configuration
- All existing master-claude agents and commands must remain untouched

### Out of Scope (Confirmed)
- Global `~/.claude/` changes — this is repo-scoped only
- Rewriting opensquad's core runtime prompts (`_squad/core/`)
- Rebuilding the dashboard application
- Supporting multiple IDEs (Claude Code only)
- `npx opensquad` CLI tooling

---

## Session Summary

| Metric | Value |
|--------|-------|
| Questions Asked | 6 |
| Approaches Explored | 2 |
| Features Removed (YAGNI) | 6 |
| Validations Completed | 4 |
| Duration | ~1 session |

---

## Next Step

**Ready for:** `/define .claude/sdd/features/BRAINSTORM_UNIFIED_SQUAD_FRAMEWORK.md`
