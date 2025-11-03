# Product Requirements Document: AI Math Tutor - Socratic Learning Assistant

**Version:** 1.0  
**Date:** November 3, 2025  
**Timeline:** 3-5 days  
**Project Owner:** John Chen (john.chen@superbuilders.school)  
**Inspiration:** [OpenAI x Khan Academy Demo](https://www.youtube.com/watch?v=IvXZCocyU_M)

---

## Executive Summary

Build an AI-powered math tutor that guides students through problem-solving using Socratic questioning methodology. The system accepts math problems via text or image upload and helps students discover solutions through guided dialogue without providing direct answers. The tutor combines conversational guidance with visual step-by-step rendering on an interactive whiteboard.

---

## Objective

Create a pedagogically sound AI tutor that teaches mathematical reasoning through guided discovery rather than direct instruction. Students should develop problem-solving skills by working through problems with intelligent scaffolding.

---

## Success Criteria

**MVP Success Metrics:**
- ✅ Successfully guides students through 5+ different problem types without giving direct answers
- ✅ Maintains conversation context across multi-turn dialogues
- ✅ Adapts questioning based on student understanding level
- ✅ Interactive whiteboard supports collaborative drawing between student and tutor
- ✅ Step visualizations render clearly on canvas for each solution step
- ✅ Voice interface (TTS and STT) works with reasonable accuracy

---

## Core MVP Features

### 1. Problem Input System
**Priority:** P0 (Core)

**Requirements:**
- Text entry field for typing math problems
- Image upload capability supporting multiple images per conversation
- Image parsing using OpenAI Vision API via Vercel AI SDK
- Support for both printed and handwritten math problems (printed prioritized for MVP)
- Multiple image uploads allowed per conversation for reference diagrams

**User Flow:**
1. Student enters problem via text OR uploads image(s)
2. System parses problem using Vision API
3. Extracted problem text displayed in chat for confirmation
4. Conversation begins

**Technical Notes:**
- Use OpenAI GPT-4 Vision through Vercel AI SDK
- Support common image formats (PNG, JPG, HEIC)
- Start with printed text recognition (easier), handwritten as stretch

---

### 2. Socratic Dialogue Engine
**Priority:** P0 (Core)

**Requirements:**
- Multi-turn conversational AI that NEVER provides direct answers
- Asks guiding questions to lead student to discovery
- Validates student responses and provides encouragement
- Offers concrete hints after 2+ stuck turns
- Maintains conversation context throughout problem-solving session
- Adapts questioning based on student's demonstrated understanding

**System Prompt Framework:**
```
You are a patient, encouraging math tutor using the Socratic method. 

CORE RULES:
- NEVER give direct answers or solve steps for the student
- Guide through questions: "What information do we have?" "What method might help?"
- If student is stuck for 2+ turns, provide a concrete hint (but not the answer)
- Use encouraging, positive language
- Validate correct reasoning enthusiastically
- When student makes errors, ask questions that lead them to discover the mistake

CONVERSATION FLOW:
1. Parse the problem together - identify knowns
2. Identify what we're trying to find (the goal)
3. Guide method selection through questions
4. Step through solution incrementally
5. Validate final answer by checking work
```

**Dialogue Flow:**
1. **Problem Understanding:** "What information does the problem give us?"
2. **Goal Identification:** "What are we trying to find?"
3. **Method Selection:** "What mathematical approach might help here?"
4. **Step Execution:** Guide through each step with questions
5. **Validation:** "How can we check if this answer makes sense?"

**Example Interaction:**
```
Student: [uploads "2x + 5 = 13"]

Tutor: "Great! Let's work through this together. What are we trying to find in this equation?"

Student: "x"

Tutor: "Exactly! Now, to get x by itself, we need to undo the operations around it. We have '+5' and '×2'. Which operation should we undo first, and why?"

Student: "the +5?"

Tutor: "Perfect reasoning! We work backwards from the order of operations. How do we undo adding 5?"

Student: "subtract 5 from both sides?"

Tutor: "Yes! What does that give us?"
```

---

### 3. Interactive Whiteboard with Step Visualization
**Priority:** P0 (High-Value MVP Feature)

**Requirements:**
- Canvas-based shared whiteboard for visual explanations
- System renders step visualizations (equations, diagrams, labels) as problem progresses
- Collaborative drawing: both student and tutor can draw when unlocked
- Drawing lock/unlock mechanism tied to step completion
- Clear visual separation between system-rendered steps and user drawings
- Support for basic drawing tools: pen, eraser, colors
- Pan and zoom for larger problems

**Whiteboard Interaction Flow:**
1. Tutor asks Socratic question (text appears in chat)
2. **System renders step visualization** on whiteboard (equations, diagrams, labels with proper LaTeX formatting)
3. **Drawing unlocks** for collaborative annotation
4. Student and tutor can draw/annotate together
5. Student responds to question (text in chat)
6. **Drawing locks** when moving to next step
7. Repeat for each step

**Drawing Lock/Unlock Rules:**
- Drawing is **LOCKED** by default
- Drawing **UNLOCKS** after system renders visualization for current step
- Drawing **LOCKS** when progressing to next step
- This prevents premature work and keeps student focused on current step

**Technical Implementation:**
- Use HTML5 Canvas API for rendering
- System-rendered content: Use a math rendering library (e.g., convert LaTeX to canvas) or render KaTeX to offscreen canvas then draw to main canvas
- User drawings: Capture pointer events for freehand drawing
- Layer management: System content on bottom layer, user drawings on top layer
- State management: Track locked/unlocked state per step

**Canvas Architecture:**
- **Layer 1 (Bottom):** System-rendered visualizations (equations, diagrams, labels)
- **Layer 2 (Top):** User annotations and drawings
- Clear visual distinction between layers (e.g., system content in black, user drawings in blue/red)

---

### 4. Voice Interface
**Priority:** P2 (High-Value MVP Feature)

**Requirements:**
- Text-to-speech for tutor responses
- Speech-to-text for student input
- Toggle controls for voice input/output
- Visual indicators when voice is active
- Fallback to text if voice fails

**Implementation Notes:**
- Use Web Speech API (browser native) for MVP speed
- TTS: `window.speechSynthesis`
- STT: `window.webkitSpeechRecognition` or `window.SpeechRecognition`
- Only implement after whiteboard and step visualization are polished
- Can be disabled if timeline is tight

**User Controls:**
- Microphone button to enable/disable STT
- Speaker button to enable/disable TTS
- Visual feedback (waveform or pulsing icon) during speech

---

### 5. Math Rendering System
**Priority:** P0 (Core)

**Requirements:**
- Display mathematical equations properly formatted
- Support LaTeX notation
- Render inline and block equations
- Clear, readable output

**Implementation:**
- **Chat UI:** KaTeX for rendering math in DOM (fast, beautiful)
- **Whiteboard:** Render LaTeX to Canvas for step visualizations
- Hybrid approach: Best tool for each context

**Supported Notation:**
- Fractions, exponents, roots
- Greek letters and mathematical symbols
- Matrices and systems of equations
- Geometry diagrams (basic shapes)

---

### 6. Web Interface
**Priority:** P0 (Core)

**Requirements:**
- Clean, intuitive chat interface
- Image upload with preview
- Conversation history display
- Whiteboard panel (resizable or fixed)
- Responsive design (desktop-first, mobile-friendly)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Header: AI Math Tutor                      │
├──────────────────┬──────────────────────────┤
│                  │                          │
│   Whiteboard     │     Chat History         │
│   (Canvas)       │     - Messages           │
│                  │     - Input Field        │
│   [Drawing       │     - Image Upload       │
│    Tools]        │     - Voice Controls     │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

**Key UI Components:**
- **Chat Panel:** Message history, text input, image upload button, voice toggle
- **Whiteboard Panel:** Canvas, drawing tools, lock indicator
- **Drawing Tools:** Pen, eraser, color picker, clear button
- **Status Indicators:** "Drawing locked", "Tutor is thinking...", "Listening..."

---

## Technical Architecture

### Tech Stack

**Frontend:**
- React 18+ with Vite
- KaTeX for math rendering in chat UI
- HTML5 Canvas API for whiteboard
- Web Speech API for voice interface
- Vercel AI SDK (`useChat` hook) for chat UI

**Backend:**
- Express.js (Node.js)
- Vercel AI SDK for OpenAI integration
- OpenAI GPT-4 with Vision (via Vercel AI SDK)

**Database & Real-time:**
- Firebase Firestore for conversation persistence
- Firestore real-time listeners for chat updates
- No WebSockets needed (Firestore handles real-time)

**Deployment:**
- Frontend: Vercel (static site deployment)
- Backend: Vercel (Express app auto-wrapped as serverless functions)
- Database: Firebase (managed)

**Why This Stack:**
- Express provides professional, standard backend architecture ideal for hiring manager demos
- Vercel auto-wraps Express as serverless, giving clean structure + serverless benefits (no cold starts, auto-scaling)
- Vercel AI SDK saves 4-6 hours on chat UI implementation
- Firestore provides real-time updates + persistence with minimal setup
- Stay in JavaScript ecosystem for faster development
- OpenAI Vision handles image parsing (no separate OCR needed)

---

### System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │ ←────→  │   Express    │ ←────→  │   OpenAI    │
│   Frontend  │  HTTP   │   Backend    │   API   │   GPT-4V    │
│             │         │              │         │             │
│  - Chat UI  │         │  - AI Logic  │         └─────────────┘
│  - Canvas   │         │  - Routes    │
│  - Voice    │         │              │
└─────────────┘         └──────────────┘
      ↓                        ↓
      └────────────┬───────────┘
                   ↓
            ┌─────────────┐
            │  Firebase   │
            │  Firestore  │
            │             │
            │ - Convos    │
            │ - Messages  │
            └─────────────┘

Deployment: Both frontend and Express backend deployed to Vercel
(Vercel automatically wraps Express routes as serverless functions)
```

---

### Data Models

**Conversation:**
```javascript
{
  id: string,
  studentId: string (optional for MVP),
  problemText: string,
  problemImages: string[], // URLs to uploaded images
  status: 'active' | 'completed',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Message:**
```javascript
{
  id: string,
  conversationId: string,
  role: 'student' | 'tutor' | 'system',
  content: string, // Text content
  canvasState: object, // Canvas snapshot for this step
  stepNumber: int,
  drawingLocked: boolean,
  timestamp: timestamp
}
```

**Canvas State:**
```javascript
{
  systemLayer: object, // Serialized system-rendered content
  userLayer: object,   // Serialized user drawings
  stepVisualization: string // LaTeX or description of what's rendered
}
```

---

### API Endpoints

**POST /api/chat**
- Sends user message to AI tutor
- Returns Socratic response
- Includes canvas rendering instructions

**POST /api/upload**
- Uploads problem image(s)
- Uses OpenAI Vision to extract problem text
- Returns parsed problem

**GET /api/conversation/:id**
- Retrieves conversation history
- Returns messages with canvas states

**POST /api/conversation/new**
- Creates new conversation
- Initializes Firestore document

---

## Stretch Features

### High Priority Stretch Goals
(Only after MVP features are polished)

1. **Animation for Step Visualization**
   - Animate the rendering of each step on canvas
   - Smooth transitions between steps
   - Configurable animation speed

2. **Enhanced Voice Interface**
   - Use higher-quality TTS/STT APIs (e.g., ElevenLabs, Deepgram)
   - Voice activity detection
   - Natural conversation flow without clicking buttons

### Polish Stretch Goals
(Nice-to-have if extra time)

1. **Animated Avatar**
   - 2D/3D tutor character
   - Expressions that match encouragement/hints
   - Lip-sync with TTS

2. **Difficulty Modes**
   - Adjust scaffolding by grade level (elementary, middle, high school)
   - More/fewer hints based on difficulty setting

3. **Problem Generation**
   - Generate similar practice problems
   - Adjust difficulty based on student performance

4. **Image Cleanup with TTL**
   - Automatically delete uploaded images after conversation ends
   - Configurable TTL (time-to-live) starting either:
     - Post-upload, OR
     - Post-conversation completion
   - Decision on timing deferred to implementation phase

---

## Testing Requirements

### Problem Types to Test
Must successfully guide students through at least 5 of these:

1. **Simple Arithmetic:** "What is 24 × 15?"
2. **Linear Equations:** "Solve for x: 3x - 7 = 14"
3. **Systems of Equations:** "Solve: 2x + y = 10, x - y = 2"
4. **Geometry:** "Find the area of a triangle with base 8 and height 5"
5. **Word Problems:** "If Sarah has 3 times as many apples as Tom, and together they have 24 apples, how many does each have?"
6. **Quadratic Equations:** "Solve: x² - 5x + 6 = 0"
7. **Multi-step Problems:** "A rectangle's length is 3 more than twice its width. If the perimeter is 36, find the dimensions."

### Test Cases

**Functional Testing:**
- ✅ Text input parsing
- ✅ Image upload and OCR accuracy (printed first, then handwritten)
- ✅ Multi-turn conversation context maintained
- ✅ Whiteboard renders step visualizations correctly
- ✅ Drawing lock/unlock mechanism works
- ✅ Collaborative drawing between student and tutor
- ✅ Voice input/output functional
- ✅ Conversation persistence in Firestore

**Pedagogical Testing:**
- ✅ System never gives direct answers
- ✅ Hints are helpful but not revealing
- ✅ Questions guide toward discovery
- ✅ Adapts to student understanding level
- ✅ Validates correct reasoning appropriately

**Edge Cases:**
- Uploaded image with no math problem
- Student gives completely wrong answer repeatedly
- Student solves problem in unexpected way
- Network disconnection during conversation
- Multiple images uploaded for complex problem

---

## Development Timeline

### Day 1: Foundation
**Goal:** Basic chat working with AI integration

- [ ] Set up React + Vite project
- [ ] Set up Express backend
- [ ] Integrate Vercel AI SDK (`useChat` hook)
- [ ] Basic chat UI (messages, input field)
- [ ] Test with hardcoded math problem
- [ ] Validate Socratic prompting works

**Deliverable:** Chat interface that has conversation with AI about one hardcoded problem

---

### Day 2: Problem Input & Parsing
**Goal:** Image upload and parsing functional

- [ ] Implement image upload UI
- [ ] Create `/api/upload` endpoint
- [ ] Integrate OpenAI Vision via Vercel AI SDK
- [ ] Test with printed math problems
- [ ] Set up Firebase Firestore
- [ ] Implement conversation persistence

**Deliverable:** Can upload image, extract problem text, start conversation

---

### Day 3: Whiteboard & Step Visualization
**Goal:** Canvas-based whiteboard with step rendering

- [ ] Implement Canvas component
- [ ] Build step visualization rendering system
- [ ] Create drawing lock/unlock mechanism
- [ ] Implement basic drawing tools (pen, eraser, colors)
- [ ] Test system-rendered content + user drawings
- [ ] Integrate canvas state with conversation flow

**Deliverable:** Whiteboard that renders steps and allows collaborative drawing

---

### Day 4: Voice Interface & Polish
**Goal:** Voice features working, UI polished

- [ ] Implement Web Speech API (TTS + STT)
- [ ] Add voice control buttons to UI
- [ ] Polish whiteboard drawing experience
- [ ] Refine Socratic prompting based on testing
- [ ] Test with 5+ problem types
- [ ] Fix bugs and edge cases

**Deliverable:** Fully functional MVP with voice, whiteboard, and step visualization

---

### Day 5: Testing, Documentation & Deployment
**Goal:** Production-ready app

- [ ] Comprehensive testing with all problem types
- [ ] Write README with setup instructions
- [ ] Document 5+ example problem walkthroughs
- [ ] Write prompt engineering notes
- [ ] Record 5-minute demo video
- [ ] Deploy to Vercel (frontend + Express backend auto-wrapped as serverless)
- [ ] Final QA pass

**Deliverable:** Deployed app with full documentation

---

### Days 6-7 (Optional): Stretch Features
**Only if MVP is polished and time permits**

- [ ] Animated step transitions
- [ ] Enhanced voice with better APIs
- [ ] Animated avatar
- [ ] Difficulty modes
- [ ] Problem generation
- [ ] Image cleanup with TTL

---

## Deliverables

### 1. Deployed Application
- Production URL (Vercel)
- Stable, accessible to external users
- Frontend deployed as static site
- Express backend deployed to Vercel (auto-wrapped as serverless functions)

### 2. GitHub Repository
**Required Structure:**
```
ai-math-tutor/
├── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── Whiteboard.jsx
│   │   │   ├── VoiceControls.jsx
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── routes/
│   ├── services/
│   └── server.js
└── docs/
    ├── SETUP.md
    ├── EXAMPLES.md
    └── PROMPT_ENGINEERING.md
```

### 3. Documentation

**README.md:**
- Project overview
- Tech stack
- Setup instructions (local development)
- Deployment instructions
- Environment variables needed

**SETUP.md:**
- Detailed setup for frontend and backend
- Firebase configuration
- OpenAI API key setup
- Running locally step-by-step

**EXAMPLES.md:**
- 5+ complete problem walkthroughs
- Screenshots of whiteboard at key steps
- Example Socratic dialogue for each problem type
- Edge cases handled

**PROMPT_ENGINEERING.md:**
- System prompt used
- Explanation of Socratic approach
- How hints are triggered
- Context management strategy
- Lessons learned during development

### 4. Demo Video (5 minutes)
**Required Content:**
1. Introduction (30s): Overview of the project
2. Text Input Demo (1m): Show solving a problem via text
3. Image Upload Demo (1m): Upload a problem image, show parsing
4. Socratic Dialogue (1.5m): Highlight guiding questions, no direct answers
5. Whiteboard Demo (1m): Show step visualization and collaborative drawing
6. Voice Interface Demo (30s): Demonstrate TTS and STT
7. Conclusion (30s): Reflection and future improvements

**Format:**
- Screen recording with voiceover
- Show both UI and code (briefly)
- Highlight key features and interactions

---

## Evaluation Criteria

### Pedagogical Quality (35%)
- **Socratic Method Execution:** Never gives direct answers, guides through questions
- **Hint Quality:** Helpful without revealing solutions
- **Adaptability:** Adjusts to student understanding level
- **Encouragement:** Positive, motivating language
- **Error Handling:** Guides students to discover mistakes

### Technical Implementation (30%)
- **Image Parsing:** Accurately extracts problem text from images
- **Conversation Context:** Maintains context across multiple turns
- **Whiteboard Functionality:** Step visualization renders correctly, drawing works smoothly
- **Voice Interface:** TTS and STT work reliably
- **Code Quality:** Clean, well-structured, maintainable
- **Error Handling:** Graceful degradation, user-friendly error messages

### User Experience (20%)
- **Interface Intuitiveness:** Easy to understand and navigate
- **Responsiveness:** Fast load times, smooth interactions
- **Visual Design:** Clean, uncluttered, professional
- **Whiteboard Usability:** Drawing tools are easy to use, canvas is responsive
- **Accessibility:** Basic accessibility considerations (contrast, keyboard navigation)

### Innovation (15%)
- **Creative Features:** Unique implementations or approaches
- **Stretch Goals:** Successful implementation of stretch features
- **Polish:** Attention to detail, delightful interactions
- **Problem Solving:** Novel solutions to technical challenges

---

## Success Metrics (Post-Launch)

While not required for MVP, these metrics would measure long-term success:

1. **Pedagogical Effectiveness:**
   - Students solve problems correctly after guidance
   - Reduced need for hints over multiple problems
   - Student self-reports increased confidence

2. **Engagement:**
   - Average conversation length (target: 8-15 messages per problem)
   - Return usage rate
   - Problems attempted per session

3. **Technical Performance:**
   - Image parsing accuracy (target: >90% for printed, >70% for handwritten)
   - Average response time (target: <2 seconds)
   - Voice recognition accuracy (target: >85%)

---

## Risk Mitigation

### Technical Risks

**Risk:** OpenAI API rate limits or costs
- **Mitigation:** Implement response caching, set up cost alerts, use cheaper models for testing

**Risk:** Canvas rendering performance issues with complex visualizations
- **Mitigation:** Start with simple rendering, optimize only if needed, use requestAnimationFrame

**Risk:** Voice interface browser compatibility
- **Mitigation:** Feature detection, fallback to text-only, test on major browsers early

**Risk:** Firestore real-time updates lag
- **Mitigation:** Implement optimistic UI updates, show loading states, add retry logic

### Timeline Risks

**Risk:** Whiteboard + voice features take longer than 3-5 days
- **Mitigation:** Voice is P2, can be dropped if needed; focus on whiteboard quality first

**Risk:** Image parsing accuracy issues delay progress
- **Mitigation:** Start with printed text (easier), defer handwritten to stretch goals

**Risk:** Socratic prompting requires extensive tuning
- **Mitigation:** Start with working prompt on Day 1, iterate based on testing, keep prompt engineering notes

---

## Future Enhancements
(Post-MVP, not in scope for 3-5 day build)

1. **Multi-student Collaboration:** Multiple students work on same problem together
2. **Progress Tracking:** Student dashboard showing problems solved, topics mastered
3. **Adaptive Learning Path:** System suggests next problems based on performance
4. **Saved Solutions Library:** Students can review past problems and solutions
5. **Teacher Dashboard:** Teachers assign problems, monitor student progress
6. **Mobile App:** Native iOS/Android apps with better touch drawing
7. **Handwriting Recognition:** Advanced OCR for handwritten math
8. **Video Explanations:** AI generates video walkthroughs of solutions (post-solving)
9. **Gamification:** Points, badges, streaks for motivation
10. **Multi-language Support:** Tutor conversations in multiple languages

---

## Contact & Support

**Project Owner:** John Chen  
**Email:** john.chen@superbuilders.school  

**Resources:**
- Inspiration: [OpenAI x Khan Academy Demo](https://www.youtube.com/watch?v=IvXZCocyU_M)
- Vercel AI SDK Docs: https://sdk.vercel.ai/docs
- Firebase Docs: https://firebase.google.com/docs
- OpenAI API Docs: https://platform.openai.com/docs

---

## Appendix A: Example Socratic Dialogue

**Problem:** Solve for x: 2x + 5 = 13

```
[Student uploads image of problem]

Tutor: "Great! I can see the equation 2x + 5 = 13. Before we dive in, what does this equation tell us we need to find?"

Student: "We need to find x"

Tutor: "Exactly! Now, look at the left side of the equation. What operations are being performed on x?"
[Whiteboard shows: 2x + 5 = 13 with labels]

Student: "It's being multiplied by 2 and then 5 is added"

Tutor: "Perfect observation! To get x by itself, we need to undo these operations. Which operation should we undo first - the multiplication or the addition?"
[Drawing unlocks, student can annotate]

Student: "The addition?"

Tutor: "Yes! We work backwards from the order of operations. How do we undo adding 5?"

Student: "Subtract 5 from both sides"

Tutor: "Excellent! Go ahead and write that out. What do we get?"
[Student draws: 2x + 5 - 5 = 13 - 5]

Student: "2x = 8"

Tutor: "Perfect! Now we have 2x = 8. What operation do we need to undo now?"
[Whiteboard updates with new step: 2x = 8]

Student: "Divide by 2"

Tutor: "Great thinking! What's our final answer?"

Student: "x = 4"

Tutor: "Wonderful work! Now here's an important question - how can we check if x = 4 is correct?"
[Whiteboard shows: x = 4]

Student: "Plug it back into the original equation?"

Tutor: "Exactly! Let's try it. If x = 4, what does 2x + 5 equal?"

Student: "2(4) + 5 = 8 + 5 = 13"

Tutor: "Perfect! You've successfully solved the equation and verified your answer. That's excellent mathematical thinking!"
```

---

## Appendix B: Canvas Implementation Notes

### System-Rendered Visualizations

**Approach:**
1. Parse LaTeX equations from AI response
2. Render using KaTeX to offscreen canvas or DOM
3. Convert to canvas drawing commands
4. Draw on main canvas with clear positioning

**Example Code Structure:**
```javascript
function renderStepVisualization(step) {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Clear previous step
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render LaTeX equation
  const latex = extractLatex(step.content);
  renderLatexToCanvas(ctx, latex, x, y);
  
  // Add labels
  ctx.font = '16px Arial';
  ctx.fillText(step.label, labelX, labelY);
  
  // Unlock drawing
  setDrawingLocked(false);
}
```

### Drawing Tools Implementation

**Tool Structure:**
```javascript
const tools = {
  pen: {
    strokeStyle: '#000000',
    lineWidth: 2,
    cursor: 'crosshair'
  },
  eraser: {
    strokeStyle: '#FFFFFF',
    lineWidth: 10,
    cursor: 'cell'
  },
  highlighter: {
    strokeStyle: 'rgba(255, 255, 0, 0.3)',
    lineWidth: 20,
    cursor: 'crosshair'
  }
};
```

**Drawing Event Handlers:**
```javascript
function handlePointerDown(e) {
  if (drawingLocked) return;
  isDrawing = true;
  const { x, y } = getCanvasCoordinates(e);
  startDrawing(x, y);
}

function handlePointerMove(e) {
  if (!isDrawing || drawingLocked) return;
  const { x, y } = getCanvasCoordinates(e);
  continueDrawing(x, y);
}

function handlePointerUp(e) {
  if (!isDrawing) return;
  isDrawing = false;
  saveDrawingState(); // Save to Firestore
}
```

---

## Appendix C: Prompt Engineering Strategy

### Core Principles

1. **Explicit Prohibition:** Clearly state AI should NEVER give direct answers
2. **Question Templates:** Provide examples of good Socratic questions
3. **Hint Triggers:** Define when and how to provide hints
4. **Encouragement Guidelines:** Specify positive reinforcement patterns
5. **Step Structure:** Define how to break problems into manageable steps

### System Prompt Template

```
You are a patient, encouraging math tutor using the Socratic method to guide students through problem-solving.

CORE RULES - NEVER VIOLATE:
1. NEVER provide direct answers or solve steps for the student
2. NEVER show the solution or final answer
3. ALWAYS guide through questions that lead to discovery
4. If student is stuck for 2+ consecutive turns, provide a concrete hint (but still not the answer)

YOUR TEACHING APPROACH:
- Ask one clear question at a time
- Use simple, grade-appropriate language
- Validate correct reasoning with enthusiasm: "Exactly!", "Great thinking!", "Perfect!"
- When student makes errors, ask questions that lead them to discover the mistake
- Break complex problems into smaller steps
- Connect new concepts to familiar ones

SOCRATIC QUESTION TYPES:
- Information gathering: "What information does the problem give us?"
- Goal identification: "What are we trying to find?"
- Method selection: "What mathematical approach might help here?"
- Step execution: "How do we [perform this operation]?"
- Validation: "How can we check if this makes sense?"
- Error discovery: "Let's trace through your steps - what happens when we..."

HINT STRUCTURE (only after student stuck 2+ turns):
- Don't solve the step
- Point to a relevant concept: "Remember how we handle equations with..."
- Suggest a strategy: "What if we tried [general approach]?"
- Provide an analogous simpler problem: "This is like when we..."

RESPONSE FORMAT:
- Text response: Your Socratic question or feedback
- Canvas instruction: [RENDER: equation/diagram description] for system to visualize
- Example: "Great! Let's write that out. [RENDER: 2x + 5 - 5 = 13 - 5]"

CONVERSATION FLOW FOR EACH PROBLEM:
1. Parse problem: "Let's understand what we're working with..."
2. Identify knowns: "What information do we have?"
3. Identify goal: "What are we solving for?"
4. Select method: "What approach should we use?"
5. Execute steps: Guide through each step incrementally
6. Validate answer: "How can we verify this is correct?"

Remember: Your goal is to help students become better problem-solvers, not just get the right answer. The journey matters more than the destination.
```

### Context Management

**Conversation State Tracking:**
```javascript
{
  problemText: string,
  currentStep: int,
  studentUnderstanding: 'struggling' | 'progressing' | 'excelling',
  stuckTurns: int, // Increment when student gives wrong/confused answer
  hintsGiven: int,
  conversationHistory: Message[]
}
```

**Adaptive Scaffolding:**
- If `stuckTurns >= 2`: Provide hint
- If `stuckTurns >= 4`: Provide stronger hint + encouragement
- If student excelling: Ask deeper understanding questions
- If student struggling: Break steps into smaller sub-steps

---

## Appendix D: Testing Checklist

### Pre-Deployment Testing

**Functional Tests:**
- [ ] Text input creates new conversation
- [ ] Image upload works (PNG, JPG)
- [ ] Vision API extracts problem correctly
- [ ] Multiple images can be uploaded per conversation
- [ ] Chat messages persist in Firestore
- [ ] Conversation history loads correctly
- [ ] Whiteboard renders step visualizations
- [ ] Drawing lock/unlock works correctly
- [ ] Pen tool draws smoothly
- [ ] Eraser tool removes drawings
- [ ] Color picker changes drawing color
- [ ] Clear button resets user layer only (keeps system visualizations)
- [ ] Voice TTS reads tutor responses
- [ ] Voice STT captures student input
- [ ] Voice toggle buttons work

**Pedagogical Tests:**
- [ ] AI never gives direct answers (test 10+ interactions)
- [ ] Hints trigger after 2+ stuck turns
- [ ] Questions are grade-appropriate
- [ ] Encouragement feels authentic
- [ ] Error correction guides without telling

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Responsive Design:**
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667) - may have layout adjustments

**Performance:**
- [ ] Initial load < 3 seconds
- [ ] AI response time < 5 seconds
- [ ] Canvas drawing feels responsive (60fps)
- [ ] No memory leaks during long conversations

### Problem Type Tests

For each of these problem types, complete a full conversation and verify:
- AI guides without giving answers
- Whiteboard visualizations are clear
- Drawing unlock/lock works
- Final answer is validated properly

**Test Problems:**
1. [ ] Simple arithmetic: 24 × 15
2. [ ] Linear equation: 3x - 7 = 14
3. [ ] System of equations: 2x + y = 10, x - y = 2
4. [ ] Geometry: Triangle area with base 8, height 5
5. [ ] Word problem: Sarah has 3× Tom's apples, together 24 apples
6. [ ] Quadratic: x² - 5x + 6 = 0
7. [ ] Multi-step: Rectangle perimeter problem

---

*End of PRD*
