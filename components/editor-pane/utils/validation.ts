import { ParseError } from '../types';

/**
 * Validates JSON string and returns detailed error if invalid
 */
export function validateJson(content: string): ParseError | null {
  if (!content || content.trim().length === 0) {
    return null; // Empty is valid (will show placeholder)
  }

  try {
    JSON.parse(content);
    return null;
  } catch (error) {
    const err = error as Error;
    const parseError = parseJsonError(err.message);
    return {
      message: parseError.message || 'Invalid JSON',
      line: parseError.line || 1,
      column: parseError.column || 1,
    };
  }
}

/**
 * Extract line and column from JSON parse error message
 * Format: "Unexpected token } in JSON at position 42"
 * or "Expected property name or '}' in JSON at line 2 column 3"
 */
function parseJsonError(message: string): { message?: string; line?: number; column?: number } {
  // Try to extract line/column from error message
  const lineMatch = message.match(/line (\d+)/i);
  const columnMatch = message.match(/column (\d+)/i);
  const positionMatch = message.match(/position (\d+)/i);

  const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  const column = columnMatch ? parseInt(columnMatch[1], 10) : undefined;

  if (line && column) {
    return { message, line, column };
  }

  if (positionMatch) {
    // Calculate line/column from position
    const position = parseInt(positionMatch[1], 10);
    return { message, line: 1, column: position + 1 };
  }

  // Default to line 1, column 1
  return { message, line: 1, column: 1 };
}

/**
 * Debounce utility function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}