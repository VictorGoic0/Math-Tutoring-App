# Product Context

## Why This Project Exists

The AI Math Tutor addresses a critical gap in educational technology: most AI tutors provide direct answers, which doesn't help students develop problem-solving skills. This application uses the Socratic method to guide students through discovery-based learning, helping them build mathematical reasoning rather than just getting correct answers.

## Problems It Solves

1. **Passive Learning:** Students often copy solutions without understanding the reasoning
2. **Lack of Guidance:** Students get stuck without knowing how to proceed
3. **No Visual Learning:** Many students learn better with visual step-by-step demonstrations
4. **Limited Accessibility:** Voice interface makes learning accessible to students with different learning styles

## How It Should Work

### Core User Flow

1. **Student Input:**
   - Types math problem OR uploads image of problem
   - System automatically parses problem text (if image)

2. **Socratic Dialogue:**
   - AI asks guiding questions (never gives direct answers)
   - Student responds with reasoning
   - AI validates correct thinking or guides to discover errors
   - Adaptive scaffolding provides hints after 2+ stuck turns

3. **Visual Learning (Planned):**
   - Whiteboard renders step visualizations automatically
   - Drawing unlocks for collaborative annotation
   - Student and tutor can draw together on canvas

4. **Persistence:**
   - Conversation history saved automatically
   - Loads previous conversations on page refresh
   - Single conversation per user (simplified MVP)

### Key User Experience Goals

1. **Instant Feedback:** Messages appear immediately (optimistic UI)
2. **Natural Conversation:** Feels like talking to a patient tutor
3. **Visual Clarity:** Math equations render beautifully with KaTeX
4. **Encouraging Tone:** Positive reinforcement throughout learning process
5. **Error Recovery:** Helpful guidance when students make mistakes

## User Personas

**Primary:** Middle/high school students struggling with math concepts
- Need: Patient guidance, visual learning, encouragement
- Goals: Understand problem-solving process, build confidence

**Secondary:** Parents/teachers monitoring student progress
- Need: See conversation history, verify learning approach
- Goals: Ensure students are learning, not just copying answers

## Success Indicators

**Pedagogical:**
- Students solve problems correctly after guidance
- Reduced need for hints over multiple problems
- Students demonstrate understanding in their responses

**Technical:**
- Image parsing accuracy >90% for printed problems
- AI response time <5 seconds
- Conversation context maintained across 10+ turns

**Engagement:**
- Average conversation length: 8-15 messages per problem
- Students return to solve additional problems
- Positive feedback on learning experience

## Design Principles

1. **Never Give Direct Answers:** Core pedagogical principle - guide to discovery
2. **Encouragement First:** Positive reinforcement builds confidence
3. **Visual Learning:** Whiteboard makes abstract concepts concrete
4. **Accessibility:** Voice interface supports different learning styles
5. **Simplicity:** Clean UI that doesn't distract from learning

## Competitive Advantage

**vs. Khan Academy AI:**
- Focus on Socratic method (not just answer generation)
- Interactive whiteboard with collaborative drawing
- Voice interface for accessibility

**vs. ChatGPT:**
- Purpose-built for math education
- Never gives direct answers (enforced by system prompt)
- Visual step-by-step guidance

## Future Vision

**Post-MVP Enhancements:**
- Multi-student collaboration
- Progress tracking and adaptive learning paths
- Teacher dashboard for monitoring
- Mobile app with better touch drawing
- Advanced handwriting recognition

