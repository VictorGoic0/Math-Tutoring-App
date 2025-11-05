# AI Math Tutor - Project & Task Summary

## Project Overview
- The Math Tutor project is a multi-phase build, starting with a core MVP and layering in collaborative canvas/whiteboard and enhancements.
- The work is organized by PRs, tracked by type: core app, canvas, and post-MVP enhancements.

## Task File Organization
- `tasks.md`: Core (foundation, auth, chat, deployment, doc PRs)
- `tasks-1.md`: Canvas/whiteboard development tasks
- `tasks-2.md`: Post-MVP enhancements (undo/redo, notations, shape/line/highlighter tools)

## MVP PR Sequence (Original)
- Foundation: Setup → Auth → Chat
- Core Flows: Firestore integration, Image upload, Vision integration, Math rendering
- Canvas/Whiteboard to follow as parallel-track PRs
- Final polish (UI, deployment, docs) closes out the MVP round

## Whiteboard/Canvas Project Sequencing
- Canvas/whiteboard implementation tasks are now tracked in tasks-1.md, starting after the last main core PR in tasks.md.
- Post-MVP canvas enhancements are tracked in tasks-2.md.

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
- See this file for summary/project-wide context; all PR-specific detail is in tasks.md, tasks-1.md, or tasks-2.md.
