# Product Context

## Why This Project Exists

Traditional math tutoring often provides direct answers, which doesn't teach problem-solving skills. This project creates a pedagogically sound AI tutor that teaches mathematical reasoning through guided discovery rather than direct instruction. Students develop problem-solving skills by working through problems with intelligent scaffolding.

## Problems It Solves

1. **Passive Learning:** Students often get answers without understanding the process
2. **Lack of Engagement:** Static tutorials don't adapt to student responses
3. **No Visual Context:** Pure text conversations miss the visual/spatial aspect of math
4. **Accessibility:** 24/7 availability of a patient tutor using proven teaching methods

## How It Should Work

### Core User Experience

1. **Problem Entry:** Student types or uploads image of math problem
2. **Problem Parsing:** System extracts problem text (if image) and displays for confirmation
3. **Socratic Dialogue Begins:** Tutor asks guiding questions, never gives direct answers
4. **Visual Guidance:** System renders step visualizations on whiteboard as problem progresses
5. **Collaborative Drawing:** After each step visualization, drawing unlocks for student/tutor to annotate
6. **Step Progression:** Drawing locks when moving to next step, keeping focus
7. **Solution Discovery:** Student works through problem with guidance, discovers solution themselves

### Pedagogical Flow

1. **Problem Understanding:** "What information does the problem give us?"
2. **Goal Identification:** "What are we trying to find?"
3. **Method Selection:** "What mathematical approach might help here?"
4. **Step Execution:** Guide through each step with questions
5. **Validation:** "How can we check if this answer makes sense?"

### Key Interaction Patterns

- **Drawing Lock/Unlock:**
  - Locked by default at conversation start
  - Unlocks after system renders step visualization
  - Locks when progressing to next step
  - Prevents premature work and keeps focus on current step

- **Hint System:**
  - After 2+ stuck turns, provide concrete hint (but not answer)
  - Hints point to relevant concepts or suggest strategies
  - Never solve the step directly

- **Encouragement:**
  - Validate correct reasoning enthusiastically: "Exactly!", "Great thinking!", "Perfect!"
  - When student makes errors, ask questions that lead them to discover the mistake
  - Use positive, motivating language

## User Experience Goals

1. **Intuitive:** Clear visual hierarchy, easy to understand what to do next
2. **Engaging:** Interactive whiteboard makes learning visual and collaborative
3. **Patient:** AI never gets frustrated, always encouraging
4. **Adaptive:** Questions adjust based on student understanding level
5. **Responsive:** Fast load times, smooth interactions, real-time updates

## Target Users

- **Primary:** Students learning math (elementary through high school)
- **Use Cases:** Homework help, concept practice, problem-solving skill development
- **Access:** Web-based, desktop-first, mobile-friendly

