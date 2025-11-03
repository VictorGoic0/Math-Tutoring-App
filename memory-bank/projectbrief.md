# Project Brief: AI Math Tutor - Socratic Learning Assistant

**Version:** 1.0  
**Timeline:** 3-5 days  
**Project Owner:** John Chen (john.chen@superbuilders.school)  
**Inspiration:** [OpenAI x Khan Academy Demo](https://www.youtube.com/watch?v=IvXZCocyU_M)

## Core Mission

Build an AI-powered math tutor that guides students through problem-solving using Socratic questioning methodology. The system accepts math problems via text or image upload and helps students discover solutions through guided dialogue **without providing direct answers**. The tutor combines conversational guidance with visual step-by-step rendering on an interactive whiteboard.

## Primary Objectives

1. **Pedagogical Excellence:** Never give direct answers - guide through questions that lead to discovery
2. **Visual Learning:** Interactive whiteboard with system-rendered step visualizations and collaborative drawing
3. **Flexible Input:** Support both text entry and image upload (with OCR via OpenAI Vision)
4. **Real-time Collaboration:** Canvas-based whiteboard where both student and tutor can draw when unlocked
5. **Context Awareness:** Maintain conversation context across multi-turn dialogues

## Success Criteria (MVP)

- ✅ Successfully guides students through 5+ different problem types without giving direct answers
- ✅ Maintains conversation context across multi-turn dialogues
- ✅ Adapts questioning based on student understanding level
- ✅ Interactive whiteboard supports collaborative drawing between student and tutor
- ✅ Step visualizations render clearly on canvas for each solution step
- ✅ Voice interface (TTS and STT) works with reasonable accuracy (P2 priority)

## Core Features (MVP)

### P0 (Must Have)
1. **Problem Input System** - Text entry and image upload with OCR
2. **Socratic Dialogue Engine** - AI that guides through questions, never gives answers
3. **Interactive Whiteboard** - Canvas with step visualization and collaborative drawing
4. **Math Rendering** - LaTeX equations in chat and on canvas
5. **Conversation Persistence** - Firestore for real-time updates and history

### P1 (High Value)
- Whiteboard enhancements (pan/zoom, undo/redo, touch support)
- Handwritten math recognition

### P2 (Nice to Have)
- Voice interface (TTS/STT) using Web Speech API

## Project Scope

**In Scope:**
- Single-student tutoring sessions
- 5+ problem types (arithmetic, linear equations, systems, geometry, word problems, quadratics)
- Printed math problem recognition (handwritten as stretch)
- Real-time conversation persistence
- Step-by-step visual guidance on canvas

**Out of Scope (Post-MVP):**
- Multi-student collaboration
- Progress tracking dashboards
- Problem generation
- Teacher assignments
- Mobile apps
- Animated avatar
- Difficulty modes

## Key Constraints

- **Timeline:** 3-5 days for MVP
- **Budget:** OpenAI API costs (monitor usage)
- **Browser Support:** Desktop-first, mobile-friendly
- **Voice:** Optional (P2) - can be dropped if timeline is tight

## Deliverables

1. Deployed application (Vercel)
2. GitHub repository with documentation
3. Demo video (5 minutes)
4. Setup documentation
5. Example problem walkthroughs (5+)

