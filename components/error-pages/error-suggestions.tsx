import type { ComponentProps } from "react";

interface ErrorSuggestionsProps extends ComponentProps<"ul"> {
  suggestions: string[];
}

export function ErrorSuggestions({ suggestions, className = "" }: ErrorSuggestionsProps) {
  return (
    <ul className={`space-y-2 text-left text-muted-foreground ${className}`}>
      {suggestions.map((suggestion, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="text-primary mt-1">›</span>
          <span>{suggestion}</span>
        </li>
      ))}
    </ul>
  );
}