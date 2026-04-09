# Format Tab Design

**Date:** 2026-04-09
**Status:** Approved
**Author:** Claude (Sonnet 4.6)

## Overview

Implement a real-time JSON formatter tab with a 2-column editor layout. Users paste unformatted JSON in the left editor and instantly see formatted JSON in the right editor.

## Architecture

### Component Structure

**Primary Component: FormatPane**

- Location: `/components/format-pane/format-pane.tsx`
- Manages two JsonEditor instances side-by-side
- Handles real-time formatting with debouncing
- Coordinates format options and error handling

**Supporting Components:**

- `FormatActions`: Copy and download buttons for output
- Reuse existing `JsonEditor` component
- Reuse existing `Toolbar` component
- Format options integrated into toolbar

### File Structure

```
/components/format-pane/
  ├── format-pane.tsx          # Main container component
  ├── format-actions.tsx       # Copy/download buttons for output
  └── types.ts                 # TypeScript interfaces
```

## Data Flow & State Management

### Formatting Flow

1. User types in left editor → `leftContent` state updates
2. `useEffect` detects change → debounced format function (300ms)
3. Format function processes JSON → `rightContent` state updates
4. Right editor re-renders with formatted output

### Custom Hook: useFormatJson

- Input: leftContent, format options
- Output: formattedContent, error, isFormatting
- Handles JSON parsing and formatting with options

### Persistence

- Save format preferences to localStorage (indent size, sort keys, etc.)
- Restore preferences on component mount
- Don't persist actual JSON content (transient tool)

## Component Features

### FormatPane Component

**Props:**

```typescript
interface FormatPaneProps {
    indentation?: number; // 2 or 4 spaces
    sortKeys?: boolean; // Sort object keys alphabetically
    removeTrailingCommas?: boolean; // Remove trailing commas
    escapeUnicode?: boolean; // Escape Unicode characters
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    className?: string;
}
```

**State:**

- `leftContent`: Unformatted JSON input
- `rightContent`: Formatted JSON output
- `leftValid`: Is left JSON valid?
- `formatError`: Formatting error (if any)
- `isFormatting`: Loading state for large JSON

**Features:**

- Real-time formatting with 300ms debounce
- Error handling with detailed syntax errors
- Copy formatted output to clipboard
- Download formatted JSON as file
- Clear all button
- Format options controls

### FormatActions Component

**Actions:**

- Copy to clipboard button
- Download as .json file button
- Both disabled when output has errors or is empty

## Error Handling & User Feedback

### Error Display

- **Syntax Error:** Invalid JSON → Show parser error with line/column
- **Format Error:** Valid JSON but formatting fails → Show generic error
- **Empty State:** Left editor empty → Right shows placeholder message

### User Feedback

- Loading indicator for large JSON (>100KB)
- Success toast for copy/download operations
- Error toast for failed operations
- Validation status indicator (green checkmark for valid JSON)
- Error state clearly indicated with visual styling

## UI/UX Design

### Layout

- Same 2-column responsive layout as diff tab
- Side-by-side on desktop, stacked on mobile
- Vertical separator between editors (md breakpoint)
- Toolbar above editors with format options

### Visual Hierarchy

- Left editor: "Unformatted JSON" label (editable)
- Right editor: "Formatted JSON" label (read-only)
- Clear visual distinction for output panel

### Toolbar Controls

- **Indentation:** Dropdown (2 spaces / 4 spaces)
- **Sort Keys:** Toggle switch
- **Remove Trailing Commas:** Toggle switch
- **Escape Unicode:** Toggle switch
- **Actions:** Clear All button

### Responsive Design

- Mobile: Editors stack vertically
- Desktop: Side-by-side with separator
- Toolbar adapts to screen width

### Accessibility

- Keyboard navigation for toolbar controls
- Proper ARIA labels for all controls
- Error messages screen reader friendly

## Format Options

### Available Options

1. **Indentation Size:** 2 or 4 spaces (default: 2)
2. **Sort Keys:** Alphabetically sort object keys (default: false)
3. **Remove Trailing Commas:** Clean up trailing commas (default: false)
4. **Escape Unicode:** Escape Unicode characters (default: false)

### Default Settings

```javascript
{
  indentation: 2,
  sortKeys: false,
  removeTrailingCommas: false,
  escapeUnicode: false
}
```

## Testing Strategy

### Unit Tests

- FormatPane component rendering and state management
- Format operations with various JSON structures
- Error handling for invalid JSON
- Format options application

### Integration Tests

- Real-time formatting flow (left → right)
- Toolbar controls update formatting correctly
- Copy and download functionality
- localStorage persistence

### Edge Cases

- Very large JSON files (>1MB)
- Deeply nested objects
- Arrays with mixed types
- Unicode and special characters
- Empty/minified/already-formatted JSON input
- Malformed JSON with various error types

### Performance

- Debouncing prevents excessive re-formatting
- Large JSON formatting shows loading indicator
- No UI blocking during format operations

## Implementation Notes

### Real-time Formatting Logic

```javascript
useEffect(() => {
    const timer = setTimeout(() => {
        const formatted = formatJson(leftContent, options);
        setRightContent(formatted);
    }, 300);
    return () => clearTimeout(timer);
}, [leftContent, options]);
```

### Key Dependencies

- Existing `JsonEditor` component
- Existing `Toolbar` component
- Format utilities from `./utils/json-operations`
- Validation utilities from `./utils/validation`

## Integration with Main App

### App Page Integration

Update `/app/page.tsx`:

- Replace format tab placeholder content with FormatPane component
- Add format-specific toolbar controls
- Handle format option state at page level
- Pass format options to FormatPane

### Toolbar Integration

```jsx
<Toolbar
    toggles={[
        { id: 'indentation', label: 'Indentation', options: [2, 4] },
        { id: 'sortKeys', label: 'Sort Keys', checked: sortKeys },
        {
            id: 'removeTrailingCommas',
            label: 'Remove Trailing Commas',
            checked: removeTrailingCommas,
        },
        { id: 'escapeUnicode', label: 'Escape Unicode', checked: escapeUnicode },
    ]}
    actions={[{ id: 'clear', label: 'Clear All', onClick: handleClear }]}
/>
```

## Success Criteria

- Users can paste unformatted JSON in left editor
- Right editor shows formatted version in real-time
- Invalid JSON shows clear error messages
- Format options work correctly
- Copy and download functionality works
- Responsive layout works on mobile and desktop
- No performance issues with large JSON files
- localStorage persists user preferences
