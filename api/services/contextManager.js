/**
 * Conversation Context Manager (Stateless)
 * 
 * Analyzes conversation history to track student progress and enable adaptive scaffolding.
 * This is a stateless implementation that derives context from the messages array.
 * When Firestore persistence is added (PR #5), this can be enhanced to use stored state.
 * 
 * @module contextManager
 */

/**
 * Context Shape:
 * {
 *   problemText: string,           // The original math problem being solved
 *   currentStep: number,            // Estimated step in the solution process (1-based)
 *   studentUnderstanding: 'struggling' | 'progressing' | 'excelling',
 *   stuckTurns: number,            // Consecutive turns where student appears stuck
 *   hintsGiven: number,             // Number of hints provided by tutor
 *   conversationHistory: Message[] // Full message array for reference
 * }
 */

/**
 * Helper function to extract text content from message
 * Handles both string content and multi-part content (with images)
 * 
 * @param {string|Array} content - Message content (string or array of parts)
 * @returns {string} Extracted text content
 */
function extractTextContent(content) {
  // If content is a string, return as-is
  if (typeof content === 'string') {
    return content;
  }
  
  // If content is an array (multi-part with images), extract text parts
  if (Array.isArray(content)) {
    return content
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(' ');
  }
  
  // Fallback for unexpected formats
  return '';
}

/**
 * Keywords that indicate a student is stuck or confused
 */
const STUCK_INDICATORS = [
  "i don't know",
  "idk",
  "not sure",
  "confused",
  "don't understand",
  "help",
  "what do i do",
  "stuck",
  "huh",
  "um",
  "uh",
  "???",
  "no idea"
];

/**
 * Keywords that indicate tutor is providing a hint
 */
const HINT_INDICATORS = [
  "remember",
  "think about",
  "consider",
  "hint",
  "try",
  "what if we",
  "let me help you think",
  "here's something to consider"
];

/**
 * Analyzes full conversation to build context for adaptive scaffolding
 * 
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Object} Context object with student progress metadata
 */
function analyzeConversationContext(messages) {
  if (!messages || messages.length === 0) {
    return {
      problemText: '',
      currentStep: 0,
      studentUnderstanding: 'progressing',
      stuckTurns: 0,
      hintsGiven: 0,
      conversationHistory: []
    };
  }

  const problemText = extractProblemText(messages);
  const stuckTurns = countStuckTurns(messages);
  const hintsGiven = countHints(messages);
  const currentStep = estimateCurrentStep(messages);
  const studentUnderstanding = assessUnderstanding(messages, stuckTurns);

  return {
    problemText,
    currentStep,
    studentUnderstanding,
    stuckTurns,
    hintsGiven,
    conversationHistory: messages
  };
}

/**
 * Extracts the original problem text from the first user message
 * 
 * @param {Array} messages - Message array
 * @returns {string} The problem text or empty string
 */
function extractProblemText(messages) {
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  return firstUserMessage ? firstUserMessage.content : '';
}

/**
 * Counts consecutive recent turns where student appears stuck
 * Looks at last 4 user messages to determine stuck state
 * 
 * IMPORTANT: This counts USER responses only. Giving a hint does NOT reset the count.
 * The count only resets when the student gives a non-stuck response, which indicates
 * they've moved past their confusion. This allows us to:
 * - Track if hints are effective (did student respond better after hint?)
 * - Escalate scaffolding if stuck continues (stuckTurns >= 4 → stronger hints)
 * - Only reset when student demonstrates understanding
 * 
 * @param {Array} messages - Message array
 * @returns {number} Number of consecutive stuck turns (0-4)
 */
function countStuckTurns(messages) {
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  // Look at the last 4 user messages (or fewer if conversation is shorter)
  const recentUserMessages = userMessages.slice(-4);
  
  let stuckCount = 0;
  
  // Count from most recent backwards until we find a non-stuck response
  for (let i = recentUserMessages.length - 1; i >= 0; i--) {
    const textContent = extractTextContent(recentUserMessages[i].content);
    const content = textContent.toLowerCase();
    
    // Check if this message indicates being stuck
    const isStuck = STUCK_INDICATORS.some(indicator => content.includes(indicator)) ||
                    content.trim().length < 10; // Very short responses often indicate confusion
    
    if (isStuck) {
      stuckCount++;
    } else {
      // Stop counting when we hit a non-stuck response
      // This means the student has moved past their confusion
      break;
    }
  }
  
  return stuckCount;
}

/**
 * Counts how many hints the tutor has provided
 * 
 * @param {Array} messages - Message array
 * @returns {number} Number of hints given
 */
function countHints(messages) {
  const assistantMessages = messages.filter(msg => msg.role === 'assistant');
  
  let hintCount = 0;
  
  assistantMessages.forEach(msg => {
    const textContent = extractTextContent(msg.content);
    const content = textContent.toLowerCase();
    const hasHintLanguage = HINT_INDICATORS.some(indicator => content.includes(indicator));
    
    if (hasHintLanguage) {
      hintCount++;
    }
  });
  
  return hintCount;
}

/**
 * Estimates which step of the problem-solving process we're on
 * Based on conversation length and tutor question patterns
 * 
 * @param {Array} messages - Message array
 * @returns {number} Estimated step number (1-based)
 */
function estimateCurrentStep(messages) {
  // Rough heuristic: each back-and-forth pair represents progress through a step
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  // First message is the problem, so steps start after that
  return Math.max(1, userMessages.length - 1);
}

/**
 * Assesses overall student understanding level
 * 
 * @param {Array} messages - Message array
 * @param {number} stuckTurns - Number of stuck turns
 * @returns {'struggling' | 'progressing' | 'excelling'} Understanding level
 */
function assessUnderstanding(messages, stuckTurns) {
  // If stuck for multiple turns, clearly struggling
  if (stuckTurns >= 3) {
    return 'struggling';
  }
  
  // If stuck for 1-2 turns, still progressing but needs help
  if (stuckTurns >= 1) {
    return 'progressing';
  }
  
  // Check if student is giving substantive responses
  const userMessages = messages.filter(msg => msg.role === 'user');
  const recentUserMessages = userMessages.slice(-3);
  
  // Excelling indicators: longer responses, asking clarifying questions, attempting steps
  const hasSubstantiveResponses = recentUserMessages.some(msg => {
    const content = extractTextContent(msg.content);
    return content.length > 30 && // Reasonably detailed
           (content.includes('?') || // Asking questions
            /\d/.test(content) ||    // Working with numbers
            content.split(' ').length > 5); // Multi-word explanation
  });
  
  return hasSubstantiveResponses ? 'excelling' : 'progressing';
}

/**
 * Builds an enriched system prompt that includes context awareness
 * Adds dynamic instructions based on student state
 * 
 * @param {Object} context - Context object from analyzeConversationContext
 * @returns {string} Additional context instructions for the system prompt
 */
function buildContextInstructions(context) {
  const { stuckTurns, studentUnderstanding, hintsGiven, currentStep } = context;
  
  let instructions = '\n\nCURRENT STUDENT STATE:\n';
  instructions += `- Understanding level: ${studentUnderstanding}\n`;
  instructions += `- Stuck turns: ${stuckTurns}\n`;
  instructions += `- Hints given: ${hintsGiven}\n`;
  instructions += `- Current step: ${currentStep}\n`;
  
  instructions += '\nADAPTIVE GUIDANCE:\n';
  
  // Provide specific guidance based on state
  if (stuckTurns >= 4) {
    instructions += '⚠️ Student has been stuck for 4+ turns. Provide a STRONGER hint with extra encouragement. Break the current step into even smaller sub-steps.\n';
  } else if (stuckTurns >= 2) {
    instructions += '⚠️ Student has been stuck for 2+ turns. It\'s time to provide a concrete HINT (but don\'t solve it for them).\n';
  }
  
  if (studentUnderstanding === 'struggling') {
    instructions += '- Student is struggling. Use simpler language, break steps into tiny pieces, provide more encouragement.\n';
  } else if (studentUnderstanding === 'excelling') {
    instructions += '- Student is excelling! Ask deeper understanding questions. Challenge them to explain their reasoning.\n';
  }
  
  if (hintsGiven > 3) {
    instructions += '- Multiple hints already given. Focus on building confidence. Validate any progress.\n';
  }
  
  return instructions;
}

module.exports = {
  analyzeConversationContext,
  buildContextInstructions,
  // Export for testing
  extractProblemText,
  countStuckTurns,
  countHints,
  estimateCurrentStep,
  assessUnderstanding
};

