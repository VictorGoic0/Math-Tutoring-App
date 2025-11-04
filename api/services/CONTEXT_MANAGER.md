# Context Manager Documentation

## Overview

The Context Manager enables **adaptive scaffolding** by analyzing conversation history to understand the student's learning state and adjust teaching approach accordingly.

## Architecture: Stateless Design

This is a **stateless implementation** that derives all context from the messages array passed to each API request. No database storage is required, making it compatible with the current system before Firestore integration (PR #5).

## Context Shape

```javascript
{
  problemText: string,           // Original math problem from first user message
  currentStep: number,            // Estimated step in solution (1-based)
  studentUnderstanding: 'struggling' | 'progressing' | 'excelling',
  stuckTurns: number,            // Consecutive turns where student is stuck (0-4)
  hintsGiven: number,             // Number of hints provided by tutor
  conversationHistory: Message[] // Full message array for reference
}
```

## How It Works

### 1. Context Analysis (`analyzeConversationContext`)

Called automatically by `buildMessagesWithSystemPrompt()` on every chat request:

```javascript
const context = analyzeConversationContext(messages);
// Returns context object with all metadata
```

### 2. Stuck Detection (`countStuckTurns`)

Analyzes the **last 4 user messages** (or fewer if conversation is shorter) for stuck indicators:

**Stuck Indicators:**
- "I don't know", "idk", "not sure", "confused"
- "help", "what do i do", "stuck"
- Very short responses (< 10 characters)
- "um", "uh", "???"

**Logic:**
- Counts **consecutive** stuck turns from most recent backwards
- Stops counting when a non-stuck response is found
- Returns 0-4 (capped at last 4 messages)

**Example:**
```
User: "Help me solve 2x + 5 = 13"        // Not stuck (problem statement)
AI: "What are we trying to find?"
User: "x"                                 // Not stuck (correct answer)
AI: "Great! What's the first step?"
User: "um..."                             // Stuck (vague response)
AI: "Think about what we need to isolate"
User: "idk"                               // Stuck (2 consecutive)
```
Result: `stuckTurns = 2` → Triggers hint

### 3. Understanding Assessment (`assessUnderstanding`)

**Struggling (3+ stuck turns):**
- Multiple consecutive confused responses
- System provides stronger hints, simpler language

**Progressing (1-2 stuck turns OR average responses):**
- Occasional confusion but making progress
- Normal Socratic guidance continues

**Excelling (0 stuck turns + substantive responses):**
- Longer responses (30+ chars)
- Asking clarifying questions
- Working with numbers/equations
- System asks deeper understanding questions

### 4. Hint Counting (`countHints`)

Scans assistant messages for hint language:
- "remember", "think about", "consider"
- "what if we", "try", "hint"
- "let me help you think"

Tracks total hints given to avoid over-scaffolding.

### 5. Adaptive Instructions (`buildContextInstructions`)

Generates dynamic instructions appended to the system prompt:

```
CURRENT STUDENT STATE:
- Understanding level: struggling
- Stuck turns: 3
- Hints given: 1
- Current step: 4

ADAPTIVE GUIDANCE:
⚠️ Student has been stuck for 2+ turns. It's time to provide a concrete HINT.
- Student is struggling. Use simpler language, break steps into tiny pieces.
```

## Integration Flow

```
1. Frontend sends messages array via useChat hook
   ↓
2. Backend /api/chat receives messages
   ↓
3. buildMessagesWithSystemPrompt(messages)
   ↓
4. analyzeConversationContext(messages) → context object
   ↓
5. buildContextInstructions(context) → dynamic instructions
   ↓
6. Combine base prompt + context instructions
   ↓
7. Send to OpenAI with enhanced system prompt
   ↓
8. AI responds with context-aware adaptive guidance
```

## Adaptive Scaffolding Rules

### If `stuckTurns >= 4`:
```
⚠️ STRONGER hint + extra encouragement
- Break current step into even smaller sub-steps
- Provide analogous simpler problem
- Validate any small progress
```

### If `stuckTurns >= 2`:
```
⚠️ Provide concrete HINT (but don't solve it)
- Point to relevant concept
- Suggest strategy
- Still require student to execute
```

### If `studentUnderstanding === 'struggling'`:
```
- Use simpler language
- Break into tiny steps
- Extra encouragement and validation
```

### If `studentUnderstanding === 'excelling'`:
```
- Ask deeper "why" questions
- Challenge to explain reasoning
- Connect to broader concepts
```

### If `hintsGiven > 3`:
```
- Focus on confidence building
- Validate any progress
- Consider if problem is too difficult
```

## Example Scenario

### Conversation:
```
User: "Solve 2x + 5 = 13"
AI: "What are we trying to find?"
User: "x"
AI: "Perfect! What's the first step to isolate x?"
User: "um... subtract?"
AI: "Good thinking! What specifically should we subtract?"
User: "idk"
AI: "I don't know"
```

### Context Analysis:
```javascript
{
  problemText: "Solve 2x + 5 = 13",
  currentStep: 3,
  studentUnderstanding: "struggling",
  stuckTurns: 2,              // Last 2 responses were stuck
  hintsGiven: 0,
  conversationHistory: [...]
}
```

### Generated Instructions:
```
CURRENT STUDENT STATE:
- Understanding level: struggling
- Stuck turns: 2
- Hints given: 0
- Current step: 3

ADAPTIVE GUIDANCE:
⚠️ Student has been stuck for 2+ turns. It's time to provide a concrete HINT.
- Student is struggling. Use simpler language, break steps into tiny pieces.
```

### AI Response (guided by context):
```
"Let's think about what we want to do with that +5 on the left side. 
Remember, we want x by itself. What's the opposite of adding 5?"
```
(Provides hint about inverse operations without solving it)

## Migration Path to Stateful (PR #5)

When Firestore is added:

1. **Store context in Firestore:**
```javascript
/conversations/{conversationId}/context
{
  stuckTurns: 2,
  hintsGiven: 1,
  studentUnderstanding: 'struggling',
  lastUpdated: timestamp
}
```

2. **Hybrid approach:**
- Fetch stored context from Firestore
- Analyze recent messages for real-time updates
- Combine for most accurate state
- Update Firestore after each turn

3. **Benefits of stateful:**
- Track progress across sessions
- Historical learning patterns
- More accurate long-term assessment
- Can reset stuckTurns when making progress

## Testing

To test context manager:

```javascript
const { analyzeConversationContext } = require('./contextManager');

const messages = [
  { role: 'user', content: 'Solve 2x + 5 = 13' },
  { role: 'assistant', content: 'What are we trying to find?' },
  { role: 'user', content: 'idk' },
  { role: 'assistant', content: 'Think about what the equation asks for' },
  { role: 'user', content: 'um...' }
];

const context = analyzeConversationContext(messages);
console.log(context);
// {
//   problemText: 'Solve 2x + 5 = 13',
//   stuckTurns: 2,
//   studentUnderstanding: 'struggling',
//   ...
// }
```

## Key Design Decisions

1. **Why stateless?**
   - Works immediately without database
   - No migration needed when adding Firestore
   - Frontend already sends full message history
   - Simple, testable, no state management complexity

2. **Why count backwards for stuck turns?**
   - Only consecutive recent confusion matters
   - Student might have been stuck earlier but recovered
   - Looking backwards from latest ensures we catch current state

3. **Why cap at 4 stuck turns?**
   - Beyond 4 turns, the problem is likely too difficult
   - Prevents context from being overly negative
   - Matches typical attention span for struggling students

4. **Why keyword-based detection?**
   - Simple and effective for MVP
   - No ML model needed
   - Easy to tune and extend
   - Works well with Socratic dialogue patterns

## Files

- **`contextManager.js`** - Core analysis logic, context shape, adaptive instructions
- **`promptService.js`** - Integrates context into system prompt
- **`/api/chat` route** - Consumes enhanced prompts (no changes needed)

## Future Enhancements (Post-MVP)

- ML-based sentiment analysis for more accurate understanding assessment
- Track concept mastery across multiple problems
- Personalized difficulty adjustment
- Learning velocity tracking
- Confidence scoring

