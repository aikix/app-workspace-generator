# Streamlined CLI Flow Implementation

## Overview

Simplified the interactive CLI flow by removing unnecessary prompts and setting sensible defaults focused on the Next.js + Firebase ecosystem.

## Changes Made

### 1. Removed Prompts

The following prompts were removed from the interactive flow, with defaults set automatically:

- **Framework Selection**: Removed (always defaults to Next.js)
- **TypeScript**: Removed (always enabled)
- **Styling Solution**: Removed (always defaults to Tailwind CSS)
- **Package Manager**: Removed (always defaults to npm)

### 2. Simplified Prompts

#### Testing Framework

- **Before**: Playwright, Cypress (disabled), Vitest (disabled), None
- **After**: Playwright, None (default: None)

#### Backend Services

- **Before**: Firebase, Supabase (disabled), Custom backend, None
- **After**: Firebase, None (default: None)

### 3. Files Modified

#### `/src/prompts/interactive.ts`

- Removed framework, typescript, styling, and packageManager from the prompt interface
- Removed corresponding prompt questions
- Added default values after prompt collection:
  ```typescript
  const framework: FrameworkType = 'next';
  const typescript = true;
  const styling: StylingType = 'tailwind';
  const packageManager: PackageManagerType = 'npm';
  ```
- Merged these defaults into the returned PromptAnswers object

### 4. Current CLI Flow

```
🚀 App Workspace Generator

Questions asked:
1. Project name
2. Workspace type (Single web app / PWA / Multi-platform)
   - If PWA: offline support, installable, notifications
3. UI component library
4. Testing framework (Playwright / None)
5. State management (Context / Zustand / None)
6. Animations (Framer Motion)
7. Backend services (Firebase / None)
   - If Firebase: features and architecture pattern
8. AI instructions (CLAUDE.md)
9. Architecture documentation
10. ESLint + Prettier setup
11. Git hooks (Husky)

Automatic defaults (not prompted):
- Framework: Next.js
- TypeScript: Yes
- Styling: Tailwind CSS
- Package Manager: npm
```

## Benefits

1. **Faster Setup**: Reduced number of questions from ~16 to ~11
2. **Less Decision Fatigue**: Users don't need to make choices about well-established defaults
3. **Focused**: Emphasizes Next.js + Firebase ecosystem as the primary use case
4. **Cleaner UX**: No more "Coming soon" disabled options cluttering the interface

## Testing

All tests passing:

- ✅ CLI creation tests (tests/cli/create.test.ts)
- ✅ Config mode tests (tests/cli/config-mode.test.ts)

The config file mode still supports all options (framework, typescript, styling, packageManager) for advanced users who want to specify different values.

## Backward Compatibility

Config files can still specify any value for the removed prompts:

- `web.framework`: "next" | "vite" | "remix"
- `web.typescript`: boolean
- `web.styling`: "tailwind" | "css-modules" | "styled-components"
- `packageManager`: "npm" | "yarn" | "pnpm" | "bun"

This ensures existing config files continue to work while the interactive mode is streamlined.

## Future Considerations

When adding support for other frameworks (Vite, Remix) or styling solutions:

1. Add them back as prompts if there's a real use case
2. Keep the prompts clean (avoid showing "coming soon" options)
3. Maintain sensible defaults to minimize decision fatigue

---

**Date**: November 16, 2025
**Status**: Implemented ✅
**Version**: 1.17.0+
