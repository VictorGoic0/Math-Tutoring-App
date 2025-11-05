# AI Math Tutor - Project & Task Summary

## Project Overview
- The Math Tutor project is a multi-phase build, starting with a core MVP and layering in collaborative canvas/whiteboard and enhancements.
- The work is organized by PRs, tracked by type: core app, canvas, and post-MVP enhancements.

## Task File Organization
- `tasks-core.md`: Core (foundation, auth, chat, deployment, doc PRs)
- `tasks-canvas.md`: Canvas/whiteboard development tasks
- `tasks-post-mvp.md`: Post-MVP enhancements (undo/redo, notations, shape/line/highlighter tools, voice interface, etc.)

## MVP PR Sequence (Original)
- Foundation: Setup → Auth → Chat
- Core Flows: Firestore integration, Image upload, Vision integration, Math rendering
- Canvas/Whiteboard to follow as parallel-track PRs
- Final polish (UI, deployment, docs) closes out the MVP round

## Whiteboard/Canvas Project Sequencing
- Canvas/whiteboard implementation tasks are tracked in `tasks-canvas.md`, starting after the last main core PR in `tasks-core.md`.
- Post-MVP canvas enhancements are tracked in `tasks-post-mvp.md`.

## Renumbering/Task Tracking Policy
- PR numbers are strictly sequential in all three files (per file, starting at PR #1 with no gaps).
- All per-PR local summaries/rationales remain in their file.
- All project-wide/global context, delivery logic, acceptance gate rationale, and critical path documentation is collected here.

## Delivery Gates
- Each PR should be:
  - Single-focus
  - Thoroughly tested before marking as complete
  - Documented (code and user)
  - Merged only after review

## Timeline Reminder
- Original projected MVP timeline: 3-5 days for all core PRs
- Whiteboard and post-MVP enhancements are ongoing and more flexible
- Deployment (Vercel) and documentation (README, setup, arch) are required gates before marking the project as "feature-complete"

## Current File Assignment
- See this file for summary/project-wide context; all PR-specific detail is in:
  - `tasks-core.md` - Core application features (PRs #1-11)
  - `tasks-canvas.md` - Canvas/whiteboard features (PRs #1-7)
  - `tasks-post-mvp.md` - Post-MVP enhancements (PRs #1-8)

## MVP PR Sequence

### Week 1 (Days 1-5)

**Day 1: Foundation**
- PR #1: Project setup
- PR #2: Firebase Authentication
- PR #3: Basic Chat UI
- PR #4: Socratic Prompting

**Day 2: Input & Persistence**
- PR #5: Firestore integration
- PR #6: Image upload UI
- PR #7: Vision integration
- PR #8: Math rendering

**Day 4: Polish**
- PR #9: UI Polish & Design System

**Day 5: Deployment & Documentation**
- PR #10: Documentation
- PR #11: Vercel deployment

**Canvas/Whiteboard (separate track):**
- See `tasks-canvas.md` for whiteboard PRs

## Critical Path

**Must Complete for MVP:**
- PR #1 → #2 → #3 → #4 (Day 1: Chat foundation)
- PR #5 → #6 → #7 → #8 (Day 2: Input system & rendering)
- PR #9 (Day 4: UI polish)
- PR #10 → #11 (Day 5: Documentation & deployment)

**Canvas/Whiteboard (Parallel Track):**
- See `tasks-canvas.md` for canvas development sequence

## Notes on Prioritization

**Why This Order:**

1. **P0 First:** All core features must work before adding enhancements
2. **Chat Before Canvas:** Need working AI conversation before visual features
3. **Canvas Foundation Before Drawing:** Rendering must work before interaction
4. **Drawing Before Voice:** Visual learning is more critical than audio
5. **Testing Before Deployment:** Can't ship untested code
6. **Voice Last:** Nice-to-have that can be dropped if timeline is tight

**Decision Points:**

- **End of Day 2:** Assess if core features are complete
- **End of Day 4:** Assess if ready to deploy
- **Day 5 Morning:** Make final call on any stretch features

**Quality Gates:**

- Don't move to next priority tier until current tier is polished
- If running behind, cut lower priority features rather than ship buggy code
- Post-MVP features are explicitly optional

## PR Best Practices

**Each PR Should:**
- Have a clear, single focus
- Include tests (manual testing checklist minimum)
- Update relevant documentation
- Have descriptive commit messages
- Be small enough to review in 15-30 minutes
- Pass all acceptance criteria before merging

**Branch Naming Convention:**
```
feature/pr-01-project-setup
feature/pr-02-chat-ui
feature/pr-03-socratic-prompting
...
```

**Commit Message Format:**
```
[PR-01] Initialize React + Vite project

- Set up project structure
- Configure environment variables
- Add Firebase connection
```
