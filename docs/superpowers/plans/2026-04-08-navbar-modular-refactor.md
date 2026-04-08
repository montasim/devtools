# Navbar Modular Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the 296-line `navbar.tsx` component into a modular, testable architecture with fine-grained components following industry best practices.

**Architecture:** Component Collection Pattern with 10+ focused components, each handling a single responsibility. Desktop and mobile navigation are split into separate components with shared menu rendering logic. Data flows top-down via props, with NavContext providing shared theme/behavior values.

**Tech Stack:** React 18+, TypeScript, Next.js 15, Radix UI (NavigationMenu, Accordion, Sheet), Tailwind CSS, Vitest/Jest for testing

---

## File Structure

**Creating:**
- `components/navbar/index.ts` - Barrel exports
- `components/navbar/types.ts` - Type definitions
- `components/navbar/constants.ts` - Default configurations
- `components/navbar/nav-context.tsx` - Context provider
- `components/navbar/sub-menu-item.tsx` - Atomic sub-menu component
- `components/navbar/auth-buttons.tsx` - Authentication button group
- `components/navbar/nav-menu-item.tsx` - Individual menu item
- `components/navbar/nav-menu.tsx` - Menu container component
- `components/navbar/desktop-nav.tsx` - Desktop navigation
- `components/navbar/mobile-nav.tsx` - Mobile navigation

**Modifying:**
- `components/navbar/navbar.tsx` - Transform into thin container

---

## Phase 1: Foundation Setup

### Task 1: Create types.ts - Centralized Type Definitions

**Files:**
- Create: `components/navbar/types.ts`

- [ ] **Step 1: Create types.ts with all interfaces**

```typescript
export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

export interface LogoConfig {
  url: string;
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export interface AuthConfig {
  login: {
    title: string;
    url: string;
  };
  signup: {
    title: string;
    url: string;
  };
}

export interface NavbarProps {
  className?: string;
  logo?: LogoConfig;
  menu?: MenuItem[];
  auth?: AuthConfig;
}

export interface NavContextValue {
  animationDuration?: number;
  theme?: 'light' | 'dark' | 'system';
}

export type NavVariant = 'desktop' | 'mobile';
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors (new file, no dependencies yet)

- [ ] **Step 3: Commit**

```bash
git add components/navbar/types.ts
git commit -m "feat(navbar): add centralized type definitions

- Extract all interfaces from navbar.tsx
- Add NavContextValue and NavVariant types
- Rename Navbar1Props to NavbarProps for consistency

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create constants.ts - Default Configurations

**Files:**
- Create: `components/navbar/constants.ts`

- [ ] **Step 1: Create constants.ts with default configs**

```typescript
import { Book, Sunset, Trees, Zap } from "lucide-react";
import type { LogoConfig, AuthConfig, MenuItem } from "./types";

export const defaultLogoConfig: LogoConfig = {
  url: "https://www.shadcnblocks.com",
  src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
  alt: "logo",
  title: "Shadcnblocks.com",
};

export const defaultAuthConfig: AuthConfig = {
  login: { title: "Login", url: "#" },
  signup: { title: "Sign up", url: "#" },
};

export const defaultMenuItems: MenuItem[] = [
  { title: "Home", url: "#" },
  {
    title: "Products",
    url: "#",
    items: [
      {
        title: "Blog",
        description: "The latest industry news, updates, and info",
        icon: <Book className="size-5 shrink-0" />,
        url: "#",
      },
      {
        title: "Company",
        description: "Our mission is to innovate and empower the world",
        icon: <Trees className="size-5 shrink-0" />,
        url: "#",
      },
      {
        title: "Careers",
        description: "Browse job listing and discover our workspace",
        icon: <Sunset className="size-5 shrink-0" />,
        url: "#",
      },
      {
        title: "Support",
        description:
          "Get in touch with our support team or visit our community forums",
        icon: <Zap className="size-5 shrink-0" />,
        url: "#",
      },
    ],
  },
  {
    title: "Resources",
    url: "#",
    items: [
      {
        title: "Help Center",
        description: "Get all the answers you need right here",
        icon: <Zap className="size-5 shrink-0" />,
        url: "#",
      },
      {
        title: "Contact Us",
        description: "We are here to help you with any questions you have",
        icon: <Sunset className="size-5 shrink-0" />,
        url: "#",
      },
      {
        title: "Status",
        description: "Check the current status of our services and APIs",
        icon: <Trees className="size-5 shrink-0" />,
        url: "#",
      },
      {
        title: "Terms of Service",
        description: "Our terms and conditions for using our services",
        icon: <Book className="size-5 shrink-0" />,
        url: "#",
      },
    ],
  },
  {
    title: "Pricing",
    url: "#",
  },
  {
    title: "Blog",
    url: "#",
  },
];
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/navbar/constants.ts
git commit -m "feat(navbar): add default configuration constants

- Extract default menu items, logo, and auth config
- Maintain existing hardcoded values as defaults
- Easy to override via props

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Create nav-context.tsx - Context Provider

**Files:**
- Create: `components/navbar/nav-context.tsx`

- [ ] **Step 1: Create nav-context.tsx**

```typescript
"use client";

import { createContext, useContext } from "react";
import type { NavContextValue } from "./types";

const defaultValue: NavContextValue = {
  animationDuration: 200,
  theme: "system",
};

export const NavContext = createContext<NavContextValue>(defaultValue);

export function useNavContext(): NavContextValue {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavContext must be used within NavContext.Provider");
  }
  return context;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/navbar/nav-context.tsx
git commit -m "feat(navbar): add NavContext for shared navigation state

- Provides theme and animation preferences
- Includes useNavContext hook for consuming values
- Default values provided for safety
- Optional: Not currently used in refactor (YAGNI)
- Can be utilized in future for theme/behavior sharing

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Note:** This context is created for future use but is not currently utilized in the refactor (YAGNI principle). It can be integrated later when shared theme/behavior state is needed across components.

---

### Task 4: Create index.ts - Barrel Exports

**Files:**
- Create: `components/navbar/index.ts`

- [ ] **Step 1: Create index.ts with public API**

```typescript
export { Navbar } from "./navbar";
export type {
  MenuItem,
  LogoConfig,
  AuthConfig,
  NavbarProps,
  NavContextValue,
  NavVariant,
} from "./types";
export { NavContext, useNavContext } from "./nav-context";
export {
  defaultLogoConfig,
  defaultAuthConfig,
  defaultMenuItems,
} from "./constants";
```

Note: This will error initially since we haven't created all exports yet. We'll update it incrementally.

- [ ] **Step 2: Update index.ts (minimal version for now)**

```typescript
export type {
  MenuItem,
  LogoConfig,
  AuthConfig,
  NavbarProps,
  NavContextValue,
  NavVariant,
} from "./types";
export { NavContext, useNavContext } from "./nav-context";
export {
  defaultLogoConfig,
  defaultAuthConfig,
  defaultMenuItems,
} from "./constants";
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/navbar/index.ts
git commit -m "feat(navbar): add barrel exports for public API

- Export all types, context, and constants
- Clean import path for consuming components
- Will add component exports incrementally

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Extract Leaf Components

### Task 5: Create sub-menu-item.tsx - Atomic Sub-Menu Component

**Files:**
- Create: `components/navbar/sub-menu-item.tsx`
- Reference: `components/navbar/navbar.tsx:276-293`

- [ ] **Step 1: Extract SubMenuLink to new file**

```typescript
import type { MenuItem } from "./types";

/**
 * Props for the SubMenuItem component
 * @property item - The menu item to display with icon, title, and optional description
 */
interface SubMenuItemProps {
  item: MenuItem;
}

export function SubMenuItem({ item }: SubMenuItemProps) {
  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Update navbar.tsx to import from new file**

Modify `components/navbar/navbar.tsx`:
- Remove lines 276-293 (SubMenuLink component)
- Add import at top: `import { SubMenuItem } from "./sub-menu-item";`
- Update line 233: Replace `<SubMenuLink` with `<SubMenuItem`

- [ ] **Step 4: Verify no functionality broken**

Run: `npx tsc --noEmit`
Expected: No errors
Run: `npm run build` (if available) or check browser

- [ ] **Step 5: Commit**

```bash
git add components/navbar/sub-menu-item.tsx components/navbar/navbar.tsx
git commit -m "refactor(navbar): extract SubMenuItem component

- Pull SubMenuLink into separate file
- Rename to SubMenuItem for consistency
- Pure presentational component for easy testing

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- [ ] **Step 6: Visual regression test (optional but recommended)**

If using Storybook or similar:
```bash
# Create Storybook story for SubMenuItem
cat > components/navbar/sub-menu-item.stories.tsx << 'EOF'
import type { Meta, StoryObj } from '@storybook/react';
import { SubMenuItem } from './sub-menu-item';
import { Book } from 'lucide-react';

const meta: Meta<typeof SubMenuItem> = {
  title: 'Navbar/SubMenuItem',
  component: SubMenuItem,
};

export default meta;
type Story = StoryObj<typeof SubMenuItem>;

export const WithIconAndDescription: Story = {
  args: {
    item: {
      title: 'Test Item',
      url: '#',
      description: 'Test description',
      icon: <Book className="size-5 shrink-0" />,
    },
  },
};

export const WithoutIcon: Story = {
  args: {
    item: {
      title: 'Simple Item',
      url: '#',
    },
  },
};
EOF

# Run Storybook (if configured)
npm run storybook
```

Expected: Component renders correctly in both variants

---

### Task 6: Create auth-buttons.tsx - Authentication Button Group

**Files:**
- Create: `components/navbar/auth-buttons.tsx`
- Reference: `components/navbar/navbar.tsx:160-167` (desktop), `208-215` (mobile)

- [ ] **Step 1: Create auth-buttons.tsx**

```typescript
import { Button } from "@/components/ui/button";
import type { AuthConfig, NavVariant } from "./types";

/**
 * Props for the AuthButtons component
 * @property auth - Authentication configuration with login and signup URLs
 * @property variant - Desktop or mobile navigation variant
 */
interface AuthButtonsProps {
  auth: AuthConfig;
  variant: NavVariant;
}

export function AuthButtons({ auth, variant }: AuthButtonsProps) {
  const isDesktop = variant === "desktop";

  return (
    <div
      className={
        isDesktop
          ? "flex gap-2"
          : "flex flex-col gap-3"
      }
    >
      <Button asChild variant="outline" size={isDesktop ? "sm" : "default"}>
        <a href={auth.login.url}>{auth.login.title}</a>
      </Button>
      <Button asChild size={isDesktop ? "sm" : "default"}>
        <a href={auth.signup.url}>{auth.signup.title}</a>
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Update navbar.tsx to use AuthButtons**

Modify `components/navbar/navbar.tsx`:
- Add import: `import { AuthButtons } from "./auth-buttons";`
- Replace lines 160-167 with: `<AuthButtons auth={auth} variant="desktop" />`
- Replace lines 208-215 with: `<AuthButtons auth={auth} variant="mobile" />`

- [ ] **Step 4: Verify no functionality broken**

Run: `npx tsc --noEmit`
Expected: No errors
Check browser: Desktop and mobile auth buttons should look identical

- [ ] **Step 5: Commit**

```bash
git add components/navbar/auth-buttons.tsx components/navbar/navbar.tsx
git commit -m "refactor(navbar): extract AuthButtons component

- Separate auth button rendering into focused component
- Supports both desktop and mobile variants
- Cleaner separation of concerns

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- [ ] **Step 6: Visual regression test (optional but recommended)**

If using Storybook or similar:
```bash
# Create Storybook story for AuthButtons
cat > components/navbar/auth-buttons.stories.tsx << 'EOF'
import type { Meta, StoryObj } from '@storybook/react';
import { AuthButtons } from './auth-buttons';

const meta: Meta<typeof AuthButtons> = {
  title: 'Navbar/AuthButtons',
  component: AuthButtons,
};

export default meta;
type Story = StoryObj<typeof AuthButtons>;

export const Desktop: Story = {
  args: {
    auth: {
      login: { title: 'Login', url: '#' },
      signup: { title: 'Sign up', url: '#' },
    },
    variant: 'desktop',
  },
};

export const Mobile: Story = {
  args: {
    auth: {
      login: { title: 'Login', url: '#' },
      signup: { title: 'Sign up', url: '#' },
    },
    variant: 'mobile',
  },
};
EOF

# Run Storybook (if configured)
npm run storybook
```

Expected: Both variants render correctly with proper button sizing

---

### Task 7: Update index.ts with component exports

**Files:**
- Modify: `components/navbar/index.ts`

- [ ] **Step 1: Add component exports**

```typescript
export { SubMenuItem } from "./sub-menu-item";
export { AuthButtons } from "./auth-buttons";
```

Add to existing exports.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/navbar/index.ts
git commit -m "feat(navbar): export leaf components from barrel

- Export SubMenuItem and AuthButtons
- Enables external use if needed

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: Extract Mid-Level Components

### Task 8: Create nav-menu-item.tsx - Individual Menu Item

**Files:**
- Create: `components/navbar/nav-menu-item.tsx`
- Reference: `components/navbar/navbar.tsx:225-274`

- [ ] **Step 1: Extract menu item rendering logic**

```typescript
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { SubMenuItem } from "./sub-menu-item";
import type { MenuItem, NavVariant } from "./types";

/**
 * Props for the NavMenuItem component
 * @property item - The menu item to display (may contain nested items)
 * @property variant - Desktop or mobile navigation variant
 */
interface NavMenuItemProps {
  item: MenuItem;
  variant: NavVariant;
}

export function NavMenuItem({ item, variant }: NavMenuItemProps) {
  if (variant === "desktop") {
    if (item.items) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent className="bg-popover text-popover-foreground">
            {item.items.map((subItem) => (
              <NavigationMenuLink asChild key={subItem.title} className="w-80">
                <SubMenuItem item={subItem} />
              </NavigationMenuLink>
            ))}
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuLink
          href={item.url}
          className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
        >
          {item.title}
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  // Mobile variant
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuItem key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Update navbar.tsx**

Modify `components/navbar/navbar.tsx`:
- Remove lines 225-274 (renderMenuItem and renderMobileMenuItem functions)
- Add import: `import { NavMenuItem } from "./nav-menu-item";`
- Update line 155: Replace `{menu.map((item) => renderMenuItem(item))}` with `{menu.map((item) => <NavMenuItem key={item.title} item={item} variant="desktop" />)}`
- Update line 205: Replace `{menu.map((item) => renderMobileMenuItem(item))}` with `{menu.map((item) => <NavMenuItem key={item.title} item={item} variant="mobile" />)}`

- [ ] **Step 4: Verify no functionality broken**

Run: `npx tsc --noEmit`
Expected: No errors
Check browser: Desktop dropdowns and mobile accordions should work

- [ ] **Step 5: Commit**

```bash
git add components/navbar/nav-menu-item.tsx components/navbar/navbar.tsx
git commit -m "refactor(navbar): extract NavMenuItem component

- Unified menu item rendering for desktop and mobile
- Handles both simple links and dropdowns
- Desktop uses NavigationMenu, mobile uses Accordion
- Removes renderMenuItem and renderMobileMenuItem helpers

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Create nav-menu.tsx - Menu Container

**Files:**
- Create: `components/navbar/nav-menu.tsx`
- Reference: `components/navbar/navbar.tsx:153-157`, `199-206`

- [ ] **Step 1: Create NavMenu container component**

```typescript
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Accordion } from "@/components/ui/accordion";
import { NavMenuItem } from "./nav-menu-item";
import type { MenuItem, NavVariant } from "./types";

/**
 * Props for the NavMenu container component
 * @property items - Array of menu items to render
 * @property variant - Desktop or mobile navigation variant
 */
interface NavMenuProps {
  items: MenuItem[];
  variant: NavVariant;
}

export function NavMenu({ items, variant }: NavMenuProps) {
  if (variant === "desktop") {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          {items.map((item) => (
            <NavMenuItem key={item.title} item={item} variant={variant} />
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="flex w-full flex-col gap-4"
    >
      {items.map((item) => (
        <NavMenuItem key={item.title} item={item} variant={variant} />
      ))}
    </Accordion>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Update navbar.tsx**

Modify `components/navbar/navbar.tsx`:
- Add import: `import { NavMenu } from "./nav-menu";`
- Replace lines 153-157 with: `<NavMenu items={menu} variant="desktop" />`
- Replace lines 199-206 with: `<NavMenu items={menu} variant="mobile" />`

- [ ] **Step 4: Verify no functionality broken**

Run: `npx tsc --noEmit`
Expected: No errors
Check browser: All menu functionality should work

- [ ] **Step 5: Commit**

```bash
git add components/navbar/nav-menu.tsx components/navbar/navbar.tsx
git commit -m "refactor(navbar): extract NavMenu container component

- Universal menu component for desktop and mobile
- Wraps NavigationMenu (desktop) and Accordion (mobile)
- Simplifies navbar.tsx further

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Update index.ts with new component exports

**Files:**
- Modify: `components/navbar/index.ts`

- [ ] **Step 1: Add NavMenuItem and NavMenu exports**

```typescript
export { NavMenuItem } from "./nav-menu-item";
export { NavMenu } from "./nav-menu";
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/navbar/index.ts
git commit -m "feat(navbar): export mid-level components from barrel

- Export NavMenuItem and NavMenu
- Complete public API surface

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Phase 4: Split Desktop/Mobile

### Task 11: Create desktop-nav.tsx - Desktop Navigation

**Files:**
- Create: `components/navbar/desktop-nav.tsx`
- Reference: `components/navbar/navbar.tsx:148-168`

- [ ] **Step 1: Extract desktop navigation logic**

```typescript
import { Logo } from "../logo";
import { NavMenu } from "./nav-menu";
import { AuthButtons } from "./auth-buttons";
import type { MenuItem, AuthConfig } from "./types";

/**
 * Props for the DesktopNav component
 * @property menu - Array of menu items to display
 * @property auth - Authentication configuration
 */
interface DesktopNavProps {
  menu: MenuItem[];
  auth: AuthConfig;
}

export function DesktopNav({ menu, auth }: DesktopNavProps) {
  return (
    <div className="hidden items-center justify-between lg:flex">
      <div className="flex items-center gap-6">
        <Logo />
        <div className="flex items-center">
          <NavMenu items={menu} variant="desktop" />
        </div>
      </div>
      <AuthButtons auth={auth} variant="desktop" />
    </div>
  );
}
```

Note: Using `<div>` instead of `<nav>` to avoid HTML nesting issues since the parent component already provides semantic markup.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2b: Verify Logo component exists**

Run: `test -f components/logo.tsx && echo "Logo component found" || echo "ERROR: Logo component not found"`
Expected: "Logo component found"

- [ ] **Step 3: Update navbar.tsx**

Modify `components/navbar/navbar.tsx`:
- Add import: `import { DesktopNav } from "./desktop-nav";`
- Replace lines 149-168 (the inner nav element, not the section wrapper) with: `<DesktopNav menu={menu} auth={auth} />`

- [ ] **Step 4: Verify no functionality broken**

Run: `npx tsc --noEmit`
Expected: No errors
Check browser: Desktop nav should look identical

- [ ] **Step 5: Commit**

```bash
git add components/navbar/desktop-nav.tsx components/navbar/navbar.tsx
git commit -m "refactor(navbar): extract DesktopNav component

- Separate desktop navigation into focused component
- Horizontal layout with logo, menu, auth buttons
- Maintains lg:flex responsive behavior

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Create mobile-nav.tsx - Mobile Navigation

**Files:**
- Create: `components/navbar/mobile-nav.tsx`
- Reference: `components/navbar/navbar.tsx:171-220`

- [ ] **Step 1: Extract mobile navigation logic**

```typescript
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavMenu } from "./nav-menu";
import { AuthButtons } from "./auth-buttons";
import type { MenuItem, AuthConfig, LogoConfig } from "./types";

/**
 * Props for the MobileNav component
 * @property menu - Array of menu items to display
 * @property auth - Authentication configuration
 * @property logo - Logo configuration for mobile display
 */
interface MobileNavProps {
  menu: MenuItem[];
  auth: AuthConfig;
  logo: LogoConfig;
}

export function MobileNav({ menu, auth, logo }: MobileNavProps) {
  return (
    <div className="block lg:hidden">
      <div className="flex items-center justify-between">
        <a href={logo.url} className="flex items-center gap-2">
          <img
            src={logo.src}
            className="max-h-8 dark:invert"
            alt={logo.alt}
          />
        </a>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                <a href={logo.url} className="flex items-center gap-2">
                  <img
                    src={logo.src}
                    className="max-h-8 dark:invert"
                    alt={logo.alt}
                  />
                </a>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-4">
              <NavMenu items={menu} variant="mobile" />
              <AuthButtons auth={auth} variant="mobile" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Update navbar.tsx**

Modify `components/navbar/navbar.tsx`:
- Add import: `import { MobileNav } from "./mobile-nav";`
- Remove Menu import from lucide-react (no longer needed here)
- Remove Sheet imports (no longer needed here)
- Replace lines 171-220 with: `<MobileNav menu={menu} auth={auth} logo={logo} />`

- [ ] **Step 4: Verify no functionality broken**

Run: `npx tsc --noEmit`
Expected: No errors
Check browser: Mobile nav should work identically

- [ ] **Step 5: Commit**

```bash
git add components/navbar/mobile-nav.tsx components/navbar/navbar.tsx
git commit -m "refactor(navbar): extract MobileNav component

- Separate mobile navigation into focused component
- Vertical accordion layout in Sheet drawer
- Maintains block lg:hidden responsive behavior
- Removes unused imports from navbar.tsx

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Phase 5: Finalize & Clean Up

### Task 13: Transform navbar.tsx into Thin Container

**Files:**
- Modify: `components/navbar/navbar.tsx`

- [ ] **Step 1: Simplify navbar.tsx to container component**

Replace entire content of `components/navbar/navbar.tsx` with:

```typescript
"use client";

import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import type { NavbarProps } from "./types";
import {
  defaultLogoConfig,
  defaultAuthConfig,
  defaultMenuItems,
} from "./constants";

const Navbar = ({
  logo = defaultLogoConfig,
  menu = defaultMenuItems,
  auth = defaultAuthConfig,
  className,
}: NavbarProps) => {
  return (
    <section className={cn("py-4 px-4 sm:px-6 lg:px-8", className)}>
      <DesktopNav menu={menu} auth={auth} />
      <MobileNav menu={menu} auth={auth} logo={logo} />
    </section>
  );
};

export { Navbar };
```

Note: NavContext removed following YAGNI principle - not currently used by any child components. Can be added later when theme/behavior sharing is needed.

- [ ] **Step 2: Remove unused imports**

Remove from top of file (all should be removed in the replacement above, but verify):
- `import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";`
- `import { Accordion, ... } from "@/components/ui/accordion";`
- `import { Button } from "@/components/ui/button";`
- `import { NavigationMenu, ... } from "@/components/ui/navigation-menu";`
- `import { Sheet, ... } from "@/components/ui/sheet";`
- `import { Logo } from "../logo";`

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify functionality in browser**

Check:
- Desktop navigation works
- Mobile navigation works
- Responsive switching works
- All menu items render correctly
- Auth buttons work on both variants

- [ ] **Step 5: Commit**

```bash
git add components/navbar/navbar.tsx
git commit -m "refactor(navbar): transform into thin container component

- Navbar now only composes DesktopNav and MobileNav
- Wraps children in NavContext.Provider
- Removes all helper functions and rendering logic
- Cleans up unused imports
- 296 lines reduced to ~30 lines

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 14: Final index.ts Update

**Files:**
- Modify: `components/navbar/index.ts`

- [ ] **Step 1: Add all component exports**

```typescript
export { Navbar } from "./navbar";
export { DesktopNav } from "./desktop-nav";
export { MobileNav } from "./mobile-nav";
export { NavMenu } from "./nav-menu";
export { NavMenuItem } from "./nav-menu-item";
export { SubMenuItem } from "./sub-menu-item";
export { AuthButtons } from "./auth-buttons";
export type {
  MenuItem,
  LogoConfig,
  AuthConfig,
  NavbarProps,
  NavContextValue,
  NavVariant,
} from "./types";
export { NavContext, useNavContext } from "./nav-context";
export {
  defaultLogoConfig,
  defaultAuthConfig,
  defaultMenuItems,
} from "./constants";
```

Note: NavContext exports are included for future use but are not currently utilized in the implementation (YAGNI). They can be removed if not needed.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify imports work from consuming code**

If there's existing code importing from navbar, verify it still works:
```bash
# Check if anything imports from navbar
grep -r "from.*navbar" app/ components/ --exclude-dir=navbar

# Verify production build still works
npm run build
```

Expected: No import errors, build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/navbar/index.ts
git commit -m "feat(navbar): complete barrel exports with all components

- Export all navigation components
- Complete public API for external use
- Maintains backward compatibility

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 15: Comprehensive Testing & Verification

**Files:**
- All navbar components

- [ ] **Step 1: Run TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 3: Manual smoke test - Desktop**

1. Open application in browser
2. Resize to desktop width (≥1024px)
3. Verify:
   - Logo is visible
   - All menu items are visible horizontally
   - Hovering over "Products" shows dropdown with icons
   - Hovering over "Resources" shows dropdown
   - Login and Sign up buttons are visible
   - Clicking menu items navigates correctly

- [ ] **Step 4: Manual smoke test - Mobile**

1. Resize browser to mobile width (<1024px)
2. Verify:
   - Hamburger menu icon is visible
   - Logo is visible
   - Clicking hamburger icon opens sheet/drawer
   - Menu items are displayed vertically
   - Tapping "Products" expands accordion
   - Sub-menu items show with icons and descriptions
   - Login and Sign up buttons are at bottom
   - Closing sheet works correctly

- [ ] **Step 5: Manual smoke test - Responsive**

1. Start at desktop width
2. Slowly resize to mobile width
3. Verify smooth transition from desktop nav to mobile nav
4. Resize back to desktop
5. Verify smooth transition back

- [ ] **Step 6: Verify theme switching**

1. Toggle theme from light to dark
2. Verify navbar updates correctly
3. Verify in both desktop and mobile views
4. Verify sheet/drawer in dark mode

- [ ] **Step 7: Check console for errors**

Open browser DevTools and verify:
- No console errors
- No console warnings
- All network requests succeed (if any)

- [ ] **Step 8: Commit final verification**

```bash
git add .
git commit -m "test(navbar): comprehensive testing and verification complete

- TypeScript compilation: PASS
- Production build: PASS
- Desktop navigation: PASS
- Mobile navigation: PASS
- Responsive behavior: PASS
- Theme switching: PASS
- Zero breaking changes confirmed
- All 10 components working correctly

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] ✅ All components are independently testable (each can be imported and used separately)
- [ ] ✅ Visual regression tests pass for all components (manual verification complete)
- [ ] ✅ Zero breaking changes to existing functionality (backward compatible)
- [ ] ✅ Code is more maintainable (296 lines → ~30 lines in navbar.tsx, clear separation)
- [ ] ✅ Components can be reused in other parts of the application (all exported)
- [ ] ✅ TypeScript compilation passes
- [ ] ✅ Production build succeeds
- [ ] ✅ Manual testing confirms desktop and mobile navigation work correctly
- [ ] ✅ No performance regression (nav feels responsive)
- [ ] ✅ Keyboard navigation works (tab through menu items)

---

## Next Steps (Future Work)

After this refactor, consider:

1. **Add visual regression tests** with Storybook or Chromatic
2. **Add unit tests** with Vitest/Jest for each component
3. **Standardize Logo component** usage across desktop and mobile
4. **Add memoization** to NavMenuItem and SubMenuItem if performance issues arise
5. **Enhance accessibility** with ARIA labels and keyboard navigation improvements
6. **Add internationalization** support for menu text
7. **Performance audit** with Lighthouse to ensure no regressions

---

## Rollback Plan

If issues arise during implementation:

1. Each task is a separate commit - can rollback to any point
2. To rollback completely: `git reset --hard <commit-before-refactor>`
3. Original navbar.tsx is preserved in git history if needed

The refactor maintains backward compatibility throughout, so any commit state should be functional.
