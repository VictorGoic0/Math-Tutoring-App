import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Efficiently determines if math should render as block or inline
 * 
 * @param {string} mathContent - The LaTeX content (without delimiters)
 * @param {boolean} isExplicitBlock - Whether it was marked with $$ or \[
 * @returns {boolean} - true for block, false for inline
 */
function shouldRenderAsBlock(mathContent, isExplicitBlock) {
  // Explicit block markers always render as block
  if (isExplicitBlock) return true;
  
  // Complexity indicators that suggest block rendering:
  // - Contains equation operators (=, <, >, ≤, ≥)
  // - Contains fractions (\frac)
  // - Contains roots (\sqrt)
  // - Contains complex operators (+, -, *, /, ^) with multiple terms
  // - Long expressions (> 15 chars suggests complexity)
  
  const complexityPattern = /[=<>≤≥]|\\frac|\\sqrt|\\sum|\\int|\\prod|\\lim|\\log|\\sin|\\cos|\\tan/;
  const hasComplexity = complexityPattern.test(mathContent);
  const isLong = mathContent.length > 15;
  
  // Simple patterns that are fine inline: single variable, simple reference
  const isSimple = /^[a-zA-Zα-ωΑ-Ω]+(\^[0-9]+)?(\_[a-zA-Z0-9]+)?$/.test(mathContent.trim());
  
  // Render as block if complex or long, unless it's explicitly simple
  return (hasComplexity || isLong) && !isSimple;
}

/**
 * MathDisplay Component
 * 
 * Renders text content with LaTeX math equations.
 * Intelligently chooses inline vs block rendering based on complexity.
 * Supports $...$, $$...$$, \(...\), and \[...\] notation.
 * 
 * @param {string} content - Text content that may contain LaTeX
 * @param {Object} style - Optional inline styles
 */
function MathDisplay({ content, style = {} }) {
  if (!content) return null;

  // Match all math formats: $$...$$, $...$, \[...\], \(...\)
  // Process in two passes: explicit blocks first, then single markers
  const parts = [];
  let lastIndex = 0;
  
  // First pass: Match explicit block markers ($$...$$ and \[...\])
  const blockRegex = /\$\$([^$]+)\$\$|\\\[([^\]]+)\\]/g;
  let match;
  const blockMatches = [];
  
  while ((match = blockRegex.exec(content)) !== null) {
    blockMatches.push({
      index: match.index,
      length: match[0].length,
      content: match[1] || match[2],
      isBlock: true
    });
  }
  
  // Second pass: Match single markers ($...$ and \(...\))
  const singleRegex = /\$([^$]+)\$|\\\(([^)]+)\\\)/g;
  const singleMatches = [];
  
  while ((match = singleRegex.exec(content)) !== null) {
    // Skip if this overlaps with a block match
    const overlapsBlock = blockMatches.some(bm => 
      match.index >= bm.index && match.index < bm.index + bm.length
    );
    if (!overlapsBlock) {
      const mathContent = match[1] || match[2];
      singleMatches.push({
        index: match.index,
        length: match[0].length,
        content: mathContent,
        isBlock: shouldRenderAsBlock(mathContent, false)
      });
    }
  }
  
  // Combine and sort all matches by index
  const allMatches = [...blockMatches, ...singleMatches].sort((a, b) => a.index - b.index);
  
  // Process matches in order
  for (const mathMatch of allMatches) {
    // Add text before the math
    if (mathMatch.index > lastIndex) {
      const textBefore = content.substring(lastIndex, mathMatch.index);
      if (textBefore.trim()) {
        parts.push({ type: 'text', content: textBefore });
      }
    }
    
    parts.push({
      type: 'math',
      content: mathMatch.content,
      isBlock: mathMatch.isBlock
    });
    
    lastIndex = mathMatch.index + mathMatch.length;
  }

  // Add remaining text after last math
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    if (textAfter.trim()) {
      parts.push({ type: 'text', content: textAfter });
    }
  }

  // If no math found, just return the text
  if (parts.length === 0) {
    return <div style={style}>{content}</div>;
  }

  return (
    <div style={style}>
      {parts.map((part, index) => {
        if (part.type === 'math') {
          if (part.isBlock) {
            return (
              <div key={index} style={{ margin: '0.5rem 0', textAlign: 'center' }}>
                <BlockMath math={part.content} />
              </div>
            );
          } else {
            return <InlineMath key={index} math={part.content} />;
          }
        } else {
          return (
            <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
              {part.content}
            </span>
          );
        }
      })}
    </div>
  );
}

export default MathDisplay;

