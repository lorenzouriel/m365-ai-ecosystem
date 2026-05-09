# DEFINE: Unified Squad Framework

> One `.claude/` that combines master-claude's engineering workflow with opensquad's content squad orchestration — one tool, one mental model.

## Metadata

| Attribute | Value |
|-----------|-------|
| **Feature** | UNIFIED_SQUAD_FRAMEWORK |
| **Date** | 2026-05-05 |
| **Author** | define-agent |
| **Status** | Ready for Design |
| **Clarity Score** | 15/15 |
| **Source** | BRAINSTORM_UNIFIED_SQUAD_FRAMEWORK.md |

---

## Problem Statement

master-claude's `.claude/` and opensquad's `.claude/` are two separate systems with different conventions — users must mentally switch between `/workflow:*` for software engineering and `/opensquad` for content orchestration. There is no shared identity, shared memory, or unified mental model. The result is cognitive overhead and a "two tools bolted together" feel.

---

## Target Users

| User | Role | Pain Point |
|------|------|------------|
| Lorenzo (primary) | Data engineer + content creator | Maintains two separate `.claude/` setups; no shared identity; opensquad ceremony (intermediate YAML files) is overhead for personal use |
| Future collaborators | Any engineer onboarding to this repo | Must understand two distinct frameworks before being productive |

---

## Goals

| Priority | Goal |
|----------|------|
| **MUST** | `/squad` namespace replaces `/opensquad` with zero loss of functionality |
| **MUST** | `_squad/` at repo root replaces `_opensquad/` — all internal path references updated |
| **MUST** | Squad creation is conversational — no intermediate `discovery.yaml`/`design.yaml` required as inputs |
| **MUST** | All existing master-claude commands (`/workflow:*`, `/review`, `/visual-explainer:*`, etc.) continue working unchanged |
| **MUST** | Single CLAUDE.md explains the unified system |
| **MUST** | Playwright `.mcp.json` merged — dashboard design and Sherlock work from master-claude root |
| **SHOULD** | `dashboard/` React app runs from master-claude root (`cd dashboard && npm run dev`) |
| **SHOULD** | master-claude's `.claude/agents/` sub-agents are referenced as available squad members in company context |
| **COULD** | opensquad `skills/` catalog and `agents/` YAML catalog preserved as-is for future squad building |

---

## Success Criteria

- [ ] `/squad` command opens main menu, loads company context from `_squad/_memory/company.md`
- [ ] `/squad create` creates a squad through conversational flow — no `_build/discovery.yaml` or `_build/design.yaml` required as inputs to proceed
- [ ] `/squad run {name}` executes a squad pipeline using `_squad/core/runner.pipeline.md`
- [ ] `/squad:dashboard-design` command triggers the dashboard design workflow and can take screenshots via Playwright
- [ ] Zero references to `_opensquad/` remain in any file under `.claude/commands/squad/` or `_squad/`
- [ ] All existing master-claude commands work unchanged after the merge
- [ ] `_squad/_memory/` and `_squad/_browser_profile/` are listed in `.gitignore`
- [ ] `.mcp.json` at repo root configures Playwright MCP pointing to `_squad/config/playwright.config.json`
- [ ] `squads/` directory exists at repo root with a `.gitkeep` (user-created squads live here)
- [ ] `dashboard/` app successfully starts with `cd dashboard && npm run dev`

---

## Acceptance Tests

| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| AT-001 | Main menu loads | `_squad/_memory/company.md` exists with profile | User runs `/squad` | Menu displays; company context is loaded from `_squad/_memory/` |
| AT-002 | First-run onboarding | `company.md` is empty or has `<!-- NOT CONFIGURED -->` | User runs `/squad` | Onboarding flow triggers; asks name, language, company |
| AT-003 | Conversational squad creation | No `_build/` artifacts exist | User runs `/squad create "Instagram content squad"` | Squad is created through dialogue; final `squad.yaml` + agent files saved; no mid-flow YAML ceremony |
| AT-004 | Squad pipeline execution | Valid squad exists in `squads/` | User runs `/squad run {name}` | Runner reads `_squad/core/runner.pipeline.md`; executes steps; writes `state.json` |
| AT-005 | Dashboard design | `dashboard/` is running at `localhost:5173` | User runs `/squad:dashboard-design` | Skill takes screenshot via Playwright; presents diagnosis |
| AT-006 | Existing commands unaffected | master-claude `.claude/` is unchanged except new `commands/squad/` | User runs `/workflow:brainstorm` | Command works identically to pre-merge behavior |
| AT-007 | Path reference integrity | `_squad/` exists at root | Runner loads `_opensquad/` path | FAIL — no `_opensquad/` references remain anywhere |
| AT-008 | Gitignore protection | User creates company profile | Git status check | `_squad/_memory/` and `_squad/_browser_profile/` do not appear as tracked files |
| AT-009 | Sherlock investigation | Valid social URL provided | Squad creation with Sherlock mode | Playwright MCP connects; investigation runs; saves to `squads/{name}/_investigations/` |

---

## Out of Scope

- Global `~/.claude/` changes — repo-scoped only
- Rewriting opensquad's core runtime prompts (`_squad/core/` content stays as-is, only path references update)
- Rebuilding or modifying the `dashboard/` React application
- Supporting multiple IDEs (Claude Code only — no Antigravity, OpenCode, Codex templates)
- `npx opensquad` CLI tooling (`bin/`, `src/`, `templates/` directories excluded)
- `opensquad-dev` skill — distribution checklist for npm package maintainers, not a user feature
- Rewriting opensquad's agent YAML catalog (`agents/` at root) or skills catalog (`skills/` at root) — both stay as-is

---

## Constraints

| Type | Constraint | Impact |
|------|------------|--------|
| Technical | `_squad/` must live at repo root | opensquad runtime reads paths relative to project root; moving inside `.claude/` requires updating every path reference in every prompt and skill file |
| Technical | `squads/` directory must live at repo root | All pipeline runner output paths reference `squads/{name}/` from root |
| Technical | `.mcp.json` must not conflict with any existing MCP in master-claude | master-claude has no existing `.mcp.json` — clean addition |
| Technical | All `_opensquad/` string occurrences must be replaced with `_squad/` | Affects: `commands/squad/squad.md`, `commands/squad/squad-dashboard-design.md`, all files in `_squad/core/`, and any `settings.local.json` permissions |
| Behavioral | Conversational squad creation must still produce the same output artifacts | `squad.yaml`, `squad-party.csv`, `agents/`, `pipeline/` — output structure unchanged; only the creation INPUT flow changes |
| Gitignore | `_squad/_memory/` and `_squad/_browser_profile/` must be gitignored | These contain user-private data (company profile, browser sessions) |

---

## Technical Context

| Aspect | Value | Notes |
|--------|-------|-------|
| **Primary Location** | repo root + `.claude/commands/squad/` | `_squad/` at root; new commands under `.claude/commands/` |
| **Files Modified** | `.gitignore`, `CLAUDE.md` | Add squad gitignore rules; replace opensquad section |
| **Files Created** | `.mcp.json`, `.claude/commands/squad/squad.md`, `.claude/commands/squad/squad-dashboard-design.md`, `squads/.gitkeep` | New additions to master-claude |
| **Files Copied** | `opensquad/_opensquad/` → `_squad/`, `opensquad/dashboard/` → `dashboard/`, `opensquad/agents/` → `squad-agents/`, `opensquad/skills/` → `squad-skills/` | Brings opensquad runtime into repo root |
| **String Replacements** | `_opensquad/` → `_squad/` in all squad command files and core prompts | Applies to: `squad.md`, `squad-dashboard-design.md`, `_squad/core/runner.pipeline.md`, `_squad/core/skills.engine.md`, `_squad/core/prompts/*.md`, `_squad/core/architect.agent.yaml` |
| **KB Domains** | None — this is a `.claude/` config feature, not a data pipeline | N/A |
| **IaC Impact** | None | Local file changes only |

### File Structure After Merge

```
master-claude/
├── .claude/
│   ├── agents/          (unchanged — master-claude's Claude Code sub-agents)
│   ├── commands/
│   │   ├── workflow/    (unchanged — SDD phases)
│   │   ├── core/        (unchanged)
│   │   ├── squad/       (NEW — replaces opensquad .claude/skills/)
│   │   │   ├── squad.md              (/squad command)
│   │   │   └── squad-dashboard-design.md  (/squad:dashboard-design)
│   │   └── ...          (all other command dirs unchanged)
│   ├── kb/              (unchanged)
│   └── sdd/             (unchanged)
├── _squad/              (NEW — renamed from opensquad/_opensquad/)
│   ├── core/            (prompts, best-practices, runner, skills engine)
│   ├── _memory/         (company.md, preferences.md — gitignored)
│   ├── _browser_profile/ (gitignored)
│   └── config/          (playwright.config.json)
├── dashboard/           (NEW — opensquad React app, runs independently)
├── squad-agents/        (NEW — opensquad YAML agent catalog, renamed from agents/)
├── squad-skills/        (NEW — opensquad bundled skills catalog, renamed from skills/)
├── squads/              (NEW — user-created squads, gitkeep only initially)
│   └── .gitkeep
├── .mcp.json            (NEW — Playwright MCP)
├── .gitignore           (MODIFIED — add _squad/_memory/, _squad/_browser_profile/)
├── CLAUDE.md            (MODIFIED — unified system docs)
└── opensquad/           (REMOVED from active use or kept as archive)
```

**Note on `squad-agents/` and `squad-skills/` naming:** opensquad's `agents/` and `skills/` directories at root are renamed to `squad-agents/` and `squad-skills/` to avoid ambiguity with master-claude's `.claude/agents/` and future `.claude/skills/` directories. All internal path references in `_squad/core/` that reference `agents/` or `skills/` must be updated to `squad-agents/` and `squad-skills/` respectively.

---

## Assumptions

| ID | Assumption | If Wrong, Impact | Validated? |
|----|------------|------------------|------------|
| A-001 | master-claude has no existing `.mcp.json` | Would need to merge Playwright into existing MCP config | [ ] |
| A-002 | All `_opensquad/` path references are string-replaceable (no dynamic construction) | Would need code-level changes inside prompt files | [ ] |
| A-003 | `dashboard/` has no hard-coded `_opensquad/` paths in its React source | Would need dashboard code changes | [ ] |
| A-004 | opensquad `agents/` and `skills/` directories can be renamed without breaking cross-references between them | Would need internal path updates | [ ] |
| A-005 | The conversational squad creation can produce the same `squad.yaml` output as the current phased approach | If not, the Build phase prompt needs significant rewriting | [ ] |

---

## Open Questions

1. **`opensquad/` directory fate:** Should the `opensquad/` subdirectory be deleted after migration, archived as a git submodule reference, or kept as-is? Recommend: keep it temporarily, delete after validation.

2. **`squad-agents/` internal references:** opensquad's skills catalog (`squad-skills/`) references agent files via relative paths (e.g., `./agents/researcher.agent.md`). These paths need auditing before rename.

3. **CLAUDE.md replacement strategy:** Should the existing CLAUDE.md be extended with a Squad section, or fully rewritten to reflect the unified system? Recommend: full rewrite that integrates both systems under one narrative.

4. **Conversational creation scope:** The simplification of squad creation (cut intermediate YAML files) is a behavioral change to the `/squad` command. The design phase must define: what does "conversational-first" creation look like in practice? What does Claude hold in context vs. write to disk?

---

## Clarity Score Breakdown

| Element | Score (0-3) | Notes |
|---------|-------------|-------|
| Problem | 3 | Clear pain: two tools, no shared identity, YAML ceremony overhead |
| Users | 3 | Lorenzo identified as primary; collaborators as secondary |
| Goals | 3 | MUST/SHOULD/COULD prioritized; all actionable |
| Success | 3 | All 10 criteria are testable with observable outcomes |
| Scope | 3 | Explicit in/out-of-scope; 7 excluded items named |
| **Total** | **15/15** | |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-05 | define-agent | Initial version from BRAINSTORM_UNIFIED_SQUAD_FRAMEWORK.md |

---

## Next Step

**Ready for:** `/design .claude/sdd/features/DEFINE_UNIFIED_SQUAD_FRAMEWORK.md`
