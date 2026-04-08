# ToolBar Component Design Specification

**Date:** 2026-04-08
**Status:** Approved
**Author:** Claude Sonnet 4.6
**Component:** ToolBar

## Overview

A flexible, two-column toolbar component for displaying toggle switches and action buttons. Designed for JSON diff/comparison tools but reusable across the application.

## Requirements

### Functional Requirements
- Display toggle switches on the left side for configuration options
- Display action buttons on the right side for primary actions
- Support horizontal scrolling on smaller screens
- Provide controlled component API for parent state management
- Support loading states on action buttons
- Fully accessible with keyboard navigation

### Non-Functional Requirements
- TypeScript with full type safety
- Responsive design (desktop, tablet, mobile)
- WCAG 2.1 AA accessibility compliance
- Consistent with existing shadcn/ui design system
- Performance: Minimal re-renders, efficient state management

## Architecture

### Component Structure

```
components/
  toolbar/
    toolbar.tsx          # Main ToolBar component (export default)
    index.tsx            # Public API exports
```

### Component Hierarchy

```
ToolBar (container)
├── Left Section (flex container)
│   └── ToggleSwitch (mapped from leftButtons)
└── Right Section (flex container)
    └── Button (mapped from rightButtons)
```

**Note:** Toggle grouping logic is implemented directly in `toolbar.tsx` for simplicity. A separate `toggle-group.tsx` file is not needed.

## API Design

### Props Interface

```typescript
interface ToolBarProps {
  // Left side toggle switches
  leftButtons: ToggleButtonConfig[]

  // Right side action buttons
  rightButtons: ActionButtonConfig[]

  // Layout options
  fullWidth?: boolean        // Default: true
  className?: string         // Additional CSS classes
}

interface ToggleButtonConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  checked: boolean            // Current state (controlled by parent)
  onChange: (checked: boolean) => void
}

interface ActionButtonConfig {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant: 'primary' | 'outline'
  onClick: () => void
  disabled?: boolean          // Default: false
  isLoading?: boolean         // Default: false
}
```

### Usage Example

```typescript
import { ToolBar } from '@/components/toolbar'
import { IconKey, IconCode, IconTrash, IconArrowsDiff } from '@tabler/icons-react'

function JsonDiffPage() {
  const [toggles, setToggles] = useState({
    ignoreKeyOrder: true,
    prettyPrint: false,
    ignoreWhitespace: true,
    semanticDiff: false
  })

  const [isComparing, setIsComparing] = useState(false)

  const handleToggleChange = (id: string) => (checked: boolean) => {
    setToggles(prev => ({ ...prev, [id]: checked }))
  }

  return (
    <ToolBar
      fullWidth
      leftButtons={[
        {
          id: 'ignoreKeyOrder',
          label: 'Ignore Key Order',
          icon: IconKey,
          checked: toggles.ignoreKeyOrder,
          onChange: handleToggleChange('ignoreKeyOrder')
        },
        {
          id: 'prettyPrint',
          label: 'Pretty Print',
          icon: IconCode,
          checked: toggles.prettyPrint,
          onChange: handleToggleChange('prettyPrint')
        }
      ]}
      rightButtons={[
        {
          id: 'compare',
          label: 'Compare',
          icon: IconArrowsDiff,
          variant: 'primary',
          isLoading: isComparing,
          onClick: () => { /* handle compare */ }
        },
        {
          id: 'clearAll',
          label: 'Clear All',
          icon: IconTrash,
          variant: 'outline',
          onClick: () => { /* handle clear */ }
        }
      ]}
    />
  )
}
```

## Visual Design

### Layout Specifications

**Container:**
- Height: `h-14` (56px)
- Padding: `px-4 py-2`
- Background: `bg-background`
- Border: `border-b`
- Flex: `flex items-center justify-between gap-4`

**Left Side - Toggle Switches:**
- Container: `flex items-center gap-3 overflow-x-auto`
- Toggle height: `h-8`
- Icon size: 16px
- Scroll: Hidden scrollbar with `scrollbar-hide` utility
- Flex behavior: `flex-1 min-w-0` to allow shrinking

**Right Side - Action Buttons:**
- Container: `flex items-center gap-2 flex-shrink-0`
- Button size: `h-8` (small variant)
- Spacing: `gap-2` between buttons
- Flex behavior: No shrinking to maintain visibility

### Spacing Guidelines

- Toggle to toggle: 12px (`gap-3`)
- Button to button: 8px (`gap-2`)
- Left to right sections: 16px minimum (`gap-4`)
- Internal padding: 8px vertical, 16px horizontal

### Color Scheme

Uses existing shadcn/ui theme tokens:
- Toggles: Primary color when checked, neutral when unchecked
- Primary buttons: `bg-primary text-primary-foreground`
- Outline buttons: `border-border bg-background`
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: Spinner with current color

## Responsive Behavior

### Breakpoints

**Desktop (≥ 768px):**
- Full two-column layout
- All content visible
- Natural spacing maintained

**Tablet (640px - 767px):**
- Two-column layout maintained
- Left side scrollable when needed
- Right side maintains visibility

**Mobile (< 640px):**
- Primary: Horizontal scroll on left side
- Left side: `flex-1 min-w-0`
- Right side: `flex-shrink-0` (priority visibility)
- Scroll hint: Shadow indicator when scrolled

### Scroll Behavior

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

## State Management

### Philosophy

The ToolBar is a **controlled component** - all state is managed by the parent.

### Toggle State

- Parent component owns all toggle states
- `onChange` callbacks notify parent of changes
- Parent implements business logic and validation
- Enables easy persistence (localStorage, URL params, etc.)
- **Important:** The `checked` prop is the current state from parent, not an initial value. This follows React's controlled component pattern (similar to how `<input checked={value} />` works).

### Button State

- `disabled` and `isLoading` props controlled by parent
- Parent manages async operations and loading states
- Component simply reflects received props

### Internal State

Minimal internal state (UI only):
- No toggle/button state stored internally
- Scroll position handled by CSS
- No derived state or calculations

## Accessibility

### Keyboard Navigation

- `Tab`: Navigate between toggles and buttons
- `Enter`/`Space`: Activate toggle or button
- Visible focus indicators on all elements
- Logical tab order (left to right, top to bottom)

### ARIA Attributes

- Container: `role="toolbar"` with `aria-label="Diff options"`
- Toggles: `role="switch"` + `aria-checked`
- Buttons: `role="button"` + `aria-label` (especially icon-only)
- Loading state: `aria-busy="true"`
- Disabled: `aria-disabled="true"`

### Screen Reader Support

- Toggle state changes announced automatically
- Button states communicated via ARIA
- Clear labels for all actions
- Icons marked `aria-hidden="true"` with text labels

### Visual Accessibility

- Contrast ratio: 4.5:1 minimum (WCAG AA)
- Focus indicators: 3px ring offset
- Touch targets: 44×44px minimum
- Not color-dependent (icons + labels)

## Dependencies

### Required Components

1. **Button** - `@/components/ui/button` (existing)
2. **Switch** - `@/components/ui/switch` (add via shadcn CLI)
3. **Icons** - Tabler Icons (already configured)

### Installation

```bash
# Add Switch component
npx shadcn@latest add switch
```

### Utility Functions

- `cn()` from `@/lib/utils` - className merging

## Implementation Notes

### Performance Considerations

- Use `React.memo()` for ToggleSwitch if performance issues arise
- Avoid anonymous functions in props (use useCallback in parent)
- Minimize re-renders through proper key usage
- CSS-only scrolling (no JavaScript scroll handlers)

### Testing Strategy

- Unit tests for toggle state changes
- Integration tests with parent state management
- Accessibility tests with axe-core or jest-axe
- Visual regression tests for responsive behavior
- Keyboard navigation tests

### Future Enhancements

- Support for button groups on right side
- Custom toggle component variants
- Vertical layout option
- Collapsible sections
- Tooltip integration for crowded toolbars

## Migration Path

No migration needed - this is a new component.

## Success Criteria

- [ ] Component renders without errors
- [ ] All props are properly typed
- [ ] Toggles reflect parent state correctly
- [ ] Buttons show loading states properly
- [ ] Keyboard navigation works end-to-end
- [ ] Responsive behavior matches specification
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] TypeScript compilation succeeds
- [ ] Production build succeeds

## References

- shadcn/ui documentation: https://ui.shadcn.com
- Radix UI Primitives: https://www.radix-ui.com/primitives
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- Tabler Icons: https://tabler-icons.io
