import React from 'react';

/**
 * Lightweight Markdown Parser
 * 
 * Parses common markdown syntax to HTML elements.
 * Handles: **bold**, *italic*, `code`
 * 
 * @param {string} text - Text content with markdown syntax
 * @returns {Array} - Array of React elements and strings
 */

/**
 * Parse markdown text into React elements
 * 
 * @param {string} text - Text with markdown syntax
 * @returns {Array} - Array of React elements and strings
 */
export function parseMarkdown(text) {
  if (!text) return [];
  
  // Split by code blocks first (preserve code formatting)
  const codeRegex = /`([^`]+)`/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before code
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      parts.push(...parseInlineMarkdown(textBefore));
    }
    
    // Add code element
    parts.push({
      type: 'code',
      content: match[1]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last code block
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    parts.push(...parseInlineMarkdown(textAfter));
  }
  
  // If no code blocks, parse entire text
  if (parts.length === 0) {
    return parseInlineMarkdown(text);
  }
  
  return parts;
}

/**
 * Parse inline markdown (bold, italic) - recursive to handle nesting
 * 
 * @param {string} text - Text with inline markdown
 * @returns {Array} - Array of elements and strings
 */
function parseInlineMarkdown(text) {
  if (!text) return [];
  
  // Process bold (**text**) first
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      parts.push(...parseItalic(textBefore));
    }
    
    // Add bold element (recursively parse italic inside)
    const boldContent = parseItalic(match[1]);
    parts.push({
      type: 'bold',
      content: boldContent
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last bold
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    parts.push(...parseItalic(textAfter));
  }
  
  // If no bold found, parse italic
  if (parts.length === 0) {
    return parseItalic(text);
  }
  
  return parts;
}

/**
 * Parse italic markdown (*text*)
 * 
 * @param {string} text - Text with italic markdown
 * @returns {Array} - Array of elements and strings
 */
function parseItalic(text) {
  if (!text) return [];
  
  const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = italicRegex.exec(text)) !== null) {
    // Add text before italic
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add italic element
    parts.push({
      type: 'italic',
      content: match[1]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last italic
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no italic found, return as plain text
  if (parts.length === 0) {
    return [text];
  }
  
  return parts;
}

/**
 * Render parsed markdown elements to React elements
 * 
 * @param {Array} parsed - Array from parseMarkdown
 * @param {string} keyPrefix - Prefix for React keys
 * @returns {Array} - Array of React elements and strings
 */
export function renderMarkdown(parsed, keyPrefix = '0') {
  return parsed.map((item, index) => {
    const key = `${keyPrefix}-${index}`;
    
    if (typeof item === 'string') {
      return <span key={key}>{item}</span>
    }
    
    if (item.type === 'bold') {
      return (
        <strong key={key}>
          {renderMarkdown(item.content, key)}
        </strong>
      );
    }
    
    if (item.type === 'italic') {
      return (
        <em key={key}>
          {item.content}
        </em>
      );
    }
    
    if (item.type === 'code') {
      return (
        <code key={key} style={{
          backgroundColor: '#f4f4f4',
          padding: '0.2em 0.4em',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }}>
          {item.content}
        </code>
      );
    }
    
    return <span key={key}>{String(item)}</span>;
  });
}

