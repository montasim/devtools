# Navbar Modular Refactor Design

**Date:** 2026-04-08
**Status:** Draft
**Author:** Claude (with user approval)

## Context

The current `navbar.tsx` component (296 lines) contains multiple responsibilities:

- Desktop and mobile navigation rendering
- Menu item rendering logic
- Authentication button rendering
- Mixed concerns within a single file

This refactor aims to create a modular, industry-standard architecture that improves maintainability, reusability, and testability.

## Goals

1. **Maintainability** - Break into smaller, focused pieces that are easy to understand and modify
2. **Reusability** - Extract components that can be used independently in other parts of the application
3. **Testability** - Structure components for easy unit and visual regression testing
4. **Zero Breaking Changes** - Maintain backward compatibility with existing implementations

## Architecture

### File Structure

```
components/navbar/
├── index.ts                    # Public API exports (barrel export)
├── navbar.tsx                  # Main container component
├── desktop-nav.tsx             # Desktop navigation wrapper
├── mobile-nav.tsx              # Mobile navigation wrapper
├── nav-menu.tsx                # Menu container (handles both desktop/mobile)
├── nav-menu-item.tsx           # Individual menu item (with/without dropdown)
├── sub-menu-item.tsx           # Sub-menu link item with icon + description
├── auth-buttons.tsx            # Authentication button group
├── nav-context.tsx             # Context for theme, behavior, config
├── types.ts                    # Shared TypeScript interfaces
└── constants.ts                # Default configurations
```

### Component Hierarchy

```
Navbar (container)
├── NavContext.Provider
├── DesktopNav
│   ├── Logo
│   ├── NavMenu (desktop variant)
│   │   └── NavMenuItem (multiple)
│   │       └── SubMenuItem (for dropdowns)
│   └── AuthButtons
└── MobileNav
    ├── MenuTrigger
    ├── Sheet/Drawer
    ├── NavMenu (mobile variant)
    │   └── NavMenuItem (accordion-style)
    │       └── SubMenuItem
    └── AuthButtons
```

## Design Decisions

### Logo Component Strategy

**Current Behavior:** Desktop uses `<Logo />` component, mobile uses custom `<img>` tag
**Refactor Decision:** Maintain current behavior during refactor
**Rationale:** The current implementation works correctly. Standardizing the logo approach is a separate concern and can be addressed in a future refactor if needed.

### Radix UI Dependencies

This refactor maintains existing Radix UI primitives:

- `NavigationMenu` (desktop dropdowns)
- `Accordion` (mobile accordion menus)
- `Sheet` (mobile drawer)

These dependencies are preserved to maintain functionality while improving code organization.

## Component Responsibilities

### Navbar (navbar.tsx)

**Purpose:** Main container component
**Responsibilities:**

- Wraps everything in NavContext.Provider
- Handles responsive switching between desktop/mobile
- Composes DesktopNav and MobileNav components
- Zero business logic, just composition

**Props:**

```typescript
interface NavbarProps {
    menuItems?: MenuItem[];
    authConfig?: AuthConfig;
    logoConfig?: LogoConfig;
    className?: string;
}
```

### DesktopNav (desktop-nav.tsx)

**Purpose:** Desktop-specific navigation layout
**Responsibilities:**

- Renders full-width desktop navigation
- Horizontal layout with logo, menu, auth buttons
- Uses `lg:flex` and `hidden` for responsive behavior
- No state management, pure presentation

### MobileNav (mobile-nav.tsx)

**Purpose:** Mobile-specific navigation layout
**Responsibilities:**

- Renders mobile sheet/drawer navigation
- Vertical layout with accordion menus
- Uses `block lg:hidden` for responsive behavior
- Manages Sheet open/close state (local UI state only)

### NavMenu (nav-menu.tsx)

**Purpose:** Universal menu component
**Responsibilities:**

- Works for both desktop and mobile variants
- Accepts `variant` prop: `'desktop' | 'mobile'`
- Maps menu items to NavMenuItem components
- Delegates styling to variant-specific CSS

### NavMenuItem (nav-menu-item.tsx)

**Purpose:** Individual menu item renderer
**Responsibilities:**

- Handles both simple links and dropdown items
- Desktop: Uses NavigationMenu trigger/content
- Mobile: Uses Accordion trigger/content
- Recursively renders nested items if needed

### SubMenuItem (sub-menu-item.tsx)

**Purpose:** Atomic component for menu items with icons
**Responsibilities:**

- Displays icon, title, description
- Pure presentational component
- Perfect for visual regression tests

### AuthButtons (auth-buttons.tsx)

**Purpose:** Authentication button group
**Responsibilities:**

- Renders login/signup button group
- Accepts auth config object
- Separate layouts for desktop (horizontal) vs mobile (vertical)

### NavContext (nav-context.tsx)

**Purpose:** Shared navigation context
**Responsibilities:**

- Provides theme-related values
- Shared behavior configurations (animation timing, etc.)
- Avoids prop drilling for deep components

**Context Interface:**

```typescript
interface NavContextValue {
    animationDuration?: number; // Menu animation timing in ms
    theme?: 'light' | 'dark' | 'system'; // Theme preference
}
```

### types.ts

**Purpose:** Centralized type definitions
**Exports:**

- `MenuItem`, `AuthConfig`, `LogoConfig`, `NavbarProps`
- `NavContextValue`
- Single source of truth for interfaces

**Note:** Current interface is `Navbar1Props` (likely a typo). This refactor will rename it to `NavbarProps` for consistency with the component name.

### constants.ts

**Purpose:** Default configurations
**Exports:**

- Default menu items (current hardcoded values)
- Default auth config
- Can be overridden by props

## Data Flow

### Prop Flow (Top-Down)

```
App/Page
  ↓ props (menuItems, authConfig, logoConfig)
Navbar
  ↓ NavContext.Provider + direct props
DesktopNav / MobileNav
  ↓ direct props
NavMenu → NavMenuItem → SubMenuItem
```

### State Management

1. **Configuration State** (Immutable)
    - Passed via props to `Navbar`
    - Flows down through component tree
    - Never mutated, only read

2. **UI State** (Local Component State)
    - Mobile sheet open/close: Managed by `MobileNav`
    - Desktop menu hover: Managed by Radix `NavigationMenu`
    - Mobile accordion open/close: Managed by Radix `Accordion`
    - Each component owns its UI state

3. **Context State** (Shared Values)
    - Theme-related values
    - Animation preferences
    - Configuration overrides
    - Provided by `NavContext` at `Navbar` level

### Key Principles

- Unidirectional data flow (top-down)
- Minimal state (only what's necessary)
- Local component state for UI interactions
- No global state management needed
- Context only for shared values, not state lifting

## Testing Strategy

### Visual Regression Testing Approach

1. **Component-Level Snapshots**
    - Each component tested independently
    - Mock data from `constants.ts` or test fixtures
    - Test variants: light/dark themes, different screen sizes

2. **Test Hierarchy**
    - **Atomic Tests (Leaf Components)**
        - SubMenuItem (all variants)
        - AuthButtons (desktop/mobile variants)
        - NavMenuItem (dropdown vs simple link)
    - **Composite Tests (Container Components)**
        - NavMenu (empty, single item, nested items)
        - DesktopNav (all menu items)
        - MobileNav (all menu items, states)
    - **Integration Tests (Full Component)**
        - Navbar (desktop view, mobile view, themed variants)

3. **Testing Tools**
    - Storybook (visual regression)
    - Jest + React Testing Library (behavior verification)
    - Playwright/Cypress (end-to-end visual regression)
    - Chromatic/Argos (visual regression CI/CD)

4. **Test Data Strategy**

    ```typescript
    // __tests__/fixtures/navbar-fixtures.ts
    export const mockMenuItems: MenuItem[] = [...];
    export const mockAuthConfig: AuthConfig = {...};
    ```

5. **Visual Regression Test Cases**
    - Theme variations (light/dark)
    - Responsive states (mobile, tablet, desktop)
    - Interactive states (hover, active, focus)
    - Edge cases (empty menu, single item, deeply nested)

## Migration Path

### Incremental Refactor Strategy

**Phase 1: Setup & Foundation** (No Breaking Changes)

1. Create new file structure (empty files with exports)
2. Extract `types.ts` from existing interfaces
3. Create `constants.ts` with default menu data
4. Set up `nav-context.tsx`
5. Create `index.ts` barrel export

**Phase 2: Extract Leaf Components**

1. Extract `SubMenuItem` → `sub-menu-item.tsx`
2. Extract `AuthButtons` → `auth-buttons.tsx`
3. Write tests for both components
4. Verify visual regression tests pass

**Phase 3: Extract Mid-Level Components**

1. Extract `NavMenuItem` → `nav-menu-item.tsx`
2. Extract `NavMenu` → `nav-menu.tsx`
3. Update imports in `navbar.tsx` to use new components
4. Test each component in isolation

**Phase 4: Split Desktop/Mobile**

1. Extract desktop nav logic → `desktop-nav.tsx`
2. Extract mobile nav logic → `mobile-nav.tsx`
3. Update `navbar.tsx` to use new split components
4. Test responsive behavior thoroughly

**Phase 5: Finalize & Clean Up**

1. Update `navbar.tsx` to be thin container
2. Add `NavContext` provider if needed
3. Remove old helper functions (`renderMenuItem`, etc.)
4. Final comprehensive testing

### Backward Compatibility

- Existing imports continue to work: `import { Navbar } from '@/components/navbar'`
- Props interface remains the same
- Zero breaking changes to consuming components

### Verification Steps

- After each phase: Run visual regression tests
- After each phase: Manual smoke test (desktop + mobile)
- Final: Full regression suite

### Rollback Plan

- Each phase is a separate commit
- Can rollback to any previous phase if issues arise
- Original `navbar.tsx` always works until final phase

## Success Criteria

1. ✅ All components are independently testable
2. ✅ Visual regression tests pass for all components
3. ✅ Zero breaking changes to existing functionality
4. ✅ Code is more maintainable (clear separation of concerns)
5. ✅ Components can be reused in other parts of the application
6. ✅ TypeScript compilation passes
7. ✅ Production build succeeds
8. ✅ Manual testing confirms desktop and mobile navigation work correctly
9. ✅ No performance regression (Lighthouse scores maintained or improved)
10. ✅ Keyboard navigation works correctly (WCAG 2.1 AA compliant)
11. ✅ All component interfaces are properly documented with JSDoc comments

## Future Considerations

- Consider adding menu item badges/notifications
- Support for internationalization (i18n)
- Accessibility improvements (ARIA labels, keyboard navigation)
- Performance optimization (memoization where beneficial)
- Support for nested dropdowns (currently 2 levels max)
