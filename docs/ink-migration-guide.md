# Ink Migration Guide for Claude Multi

## Executive Summary

This guide migrates **Claude Multi** from a `prompts`-based CLI to an **Ink** (React-for-terminals) UI while preserving all existing functionality.

**Target Benefits:**
- Composable layouts via flexbox
- Persistent UI state across multi-step flows
- Modern React component model
- Real-time feedback (spinners, progress, errors)

**Migration Complexity:** Medium-High (28 interactive elements to convert)

---

## Table of Contents

1. [AI Agent Autonomy with z.ai Tools](#ai-agent-autonomy-with-zai-tools)
2. [Current State Analysis](#current-state-analysis)
3. [Technology Stack Comparison](#technology-stack-comparison)
4. [Migration Architecture](#migration-architecture)
5. [Component Mapping](#component-mapping)
6. [State Management Strategy](#state-management-strategy)
7. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
8. [Code Examples](#code-examples)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Considerations](#deployment-considerations)
11. [Rollback Plan](#rollback-plan)

---

## AI Agent Autonomy with z.ai Tools

> **Important:** The AI model doesn't have vision or web search capabilities by default. To enable autonomous research, documentation updates, and migration assistance, use z.ai's internal MCP tools and web search capabilities.

### Available z.ai Tools for Migration

#### 1. **Image Analysis MCP** (`mcp__4_5v_mcp__analyze_image`)

**Purpose:** Analyze screenshots, terminal UI mockups, and visual designs

**When to Use:**
- Reviewing UI mockups and design concepts
- Analyzing terminal screenshots for layout reference
- Validating visual design choices
- Comparing before/after UI states

**Example Usage:**
```markdown
# For AI agents working on UI design
"Analyze this CLI screenshot to understand the current layout structure"
"Review this Ink component design for visual hierarchy"
"Compare these two terminal UI approaches and recommend the best one"
```

**Parameters:**
- `imageSource`: Remote URL to the image (PNG, JPG, JPEG)
- `prompt`: Detailed instructions for analysis

#### 2. **Web Search MCP** (`mcp__web-search-prime__web_search_prime`)

**Purpose:** Search for latest Ink patterns, React hooks, and CLI UI best practices

**When to Use:**
- Finding current Ink component patterns
- Researching React hooks for CLI applications
- Discovering new Ink UI libraries
- Checking for updated migration strategies

**Example Usage:**
```typescript
// Search for Ink patterns
await mcp__web-search-prime__web_search_prime({
  search_query: "Ink React CLI select menu patterns 2026",
  content_size: "high"
});

// Research specific libraries
await mcp__web-search-prime__web_search_prime({
  search_query: "ink-ui TextInput ConfirmInput examples",
  content_size: "high"
});
```

#### 3. **Web Reader MCP** (`mcp__web_reader__webReader`)

**Purpose:** Fetch and convert library documentation to markdown

**When to Use:**
- Reading Ink documentation pages
- Processing React hooks reference
- Analyzing migration guides
- Extracting code examples from tutorials

**Example Usage:**
```typescript
// Read Ink documentation
await mcp__web_reader__webReader({
  url: "https://github.com/vadimdemedes/ink",
  return_format: "markdown",
  retain_images: true
});

// Process component examples
await mcp__web_reader__webReader({
  url: "https://github.com/vadimdemedes/ink-ui",
  return_format: "markdown",
  with_links_summary: true
});
```

#### 4. **Context7 MCP** (`mcp__plugin_context7_context7__query-docs`)

**Purpose:** Query up-to-date documentation for any library

**When to Use:**
- Getting current Ink API documentation
- Finding React hooks examples
- Checking library version compatibility
- Resolving library-specific issues

**Example Usage:**
```typescript
// Query Ink documentation
await mcp__plugin_context7_context7__query-docs({
  libraryId: "/vadimdemedes/ink",
  query: "How to implement keyboard navigation with useInput hook?"
});

// Get ink-ui examples
await mcp__plugin_context7_context7__query-docs({
  libraryId: "/vadimdemedes/ink-ui",
  query: "Show examples of Select and TextInput components with validation"
});
```

### Autonomous Migration Workflow

When AI agents work on the Ink migration, they should follow this pattern:

```markdown
## Migration Task: Convert prompts Select to Ink Select

1. **Research Phase:**
   - Search for "ink-select-input examples 2026"
   - Read ink-select-input documentation
   - Find 3-5 real-world usage examples
   - Analyze any component screenshots

2. **Implementation Phase:**
   - Review current prompts usage in codebase
   - Map prompts options to ink-select-input API
   - Implement new Ink component
   - Add keyboard navigation

3. **Validation Phase:**
   - Use image analysis to compare UI output
   - Verify all interactive features work
   - Test keyboard shortcuts

### Required z.ai Tools:
- ✅ Web search for discovery
- ✅ Web reader for documentation
- ✅ Context7 for API reference
- ✅ Image analysis for visual validation
```

### Example: Autonomous Component Migration

```markdown
Task: Migrate Add Instance flow from prompts to Ink

AI Agent Instructions:

1. **Analyze Current Implementation:**
   - Search for "prompts multiselect text input patterns"
   - Review current cli.ts implementation
   - Document all user interactions

2. **Research Ink Alternatives:**
   - Query Context7 for ink-ui components
   - Search for "Ink form validation patterns 2026"
   - Read ink-text-input documentation
   - Find multi-select implementation examples

3. **Design New Component:**
   - Create component structure
   - Implement state management
   - Add form validation
   - Handle keyboard navigation

4. **Validate Implementation:**
   - Test all user flows
   - Compare visual output with screenshots
   - Verify error handling

Use z.ai Tools:
- Web search for patterns
- Web reader for docs
- Context7 for API reference  
- Image analysis for UI comparison
```

### Best Practices for Tool Usage

**For Research:**
```typescript
// Good - Current, specific searches
"Ink React hooks useInput useFocus 2026"
"ink-ui Select component validation examples"

// Bad - Generic, potentially outdated
"Ink tutorial"
"React CLI examples"
```

**For Documentation:**
```typescript
// Good - Official, up-to-date sources
"/vadimdemedes/ink" via Context7
"/vadimdemedes/ink-ui" via Context7

// Bad - Unofficial, potentially outdated
Random Medium articles
Old blog posts
```

**For Image Analysis:**
```typescript
// Good - Specific analysis goals
"Analyze this terminal UI for layout structure and color usage"
"Compare these two CLI designs and recommend improvements"
"Review this component mockup for accessibility issues"

// Bad - Vague requests
"What do you think of this design"
"Look at this screenshot"
```

### Integration with Migration Tasks

**When AI agents need to implement migration:**
1. **Use Context7** for current library APIs
2. **Use Web Search** to find implementation patterns
3. **Use Web Reader** to analyze documentation deeply
4. **Use Image Analysis** to validate visual output

**Example Agent Prompt:**
```markdown
Migrate the prompts-based select menu to Ink Select component:

Research:
1. Query Context7 for "/vadimdemedes/ink-select-input" examples
2. Search for "Ink keyboard navigation patterns 2026"
3. Read documentation for best practices

Implementation:
1. Create Select component with proper props
2. Implement keyboard shortcuts (arrows, enter, numbers)
3. Add focus management
4. Handle selection state

Validation:
1. Test all keyboard interactions
2. Verify visual output matches design
3. Compare with screenshots if available

Use z.ai tools for autonomous research and validation
```

---

## Current State Analysis

### Existing Interactive Elements (28 Total)

Based on comprehensive code analysis, the following interactive elements need migration:

#### **Interactive Mode Flows**
1. **Main Menu** (cli.ts:786-805) - Select with 8 options
2. **Continue Prompt** (cli.ts:838-843) - Confirm dialog
3. **Add Instance Wizard** (cli.ts:862-1106) - Multi-step form
4. **List Instances** (cli.ts:1108-1128) - Display view
5. **Instance Info** (cli.ts:1130-1161) - Detail view
6. **Remove Instance** (cli.ts:1163-1207) - Select + confirm
7. **Auto-sync Toggle** (cli.ts:1209-1281) - Select + action
8. **Plugin Management** (cli.ts:1283-1401) - Multi-step wizard
9. **MCP Management** (cli.ts:1434-1625) - Multiple sub-flows

#### **Non-Interactive Command Flows**
10. **Add Instance CLI** (cli.ts:147-202) - Copy options select
11. **Fix Symlinks** (cli.ts:712-721) - Multi-select
12. **Update Check** (cli.ts:1641-1646) - Confirm dialog

### Current Dependencies

```json
{
  "chalk": "^5.3.0",
  "commander": "^12.0.0", 
  "prompts": "^2.4.2"
}
```

### Current Styling Patterns

```typescript
// Color mapping
chalk.red()    → Errors, failures
chalk.yellow() → Warnings, notices
chalk.green()  → Success messages
chalk.cyan()   → Interactive elements
chalk.gray()   → Secondary information
```

---

## Technology Stack Comparison

### Current: Prompts Library

**Pros:**
- Lightweight (~5KB)
- Simple API
- Stable and mature

**Cons:**
- Linear question flow
- No complex layouts
- Limited customization
- No persistent UI state

### Target: Ink + Ink UI

**Pros:**
- React-based (declarative)
- Beautiful flexbox layouts
- Rich component ecosystem
- Real-time updates
- Modern architecture

**Cons:**
- Larger bundle size
- React learning curve
- More complex setup

---

## Migration Architecture

### Recommended Libraries

```bash
# Core Ink + UI components (covers Select, TextInput, PasswordInput, ConfirmInput, Spinner)
bun add ink react @inkjs/ui

# Optional: only if you need controlled <TextInput value=... /> with a `mask` prop
#   bun add ink-text-input
```

> `useFocus` / `useFocusManager` ship with Ink — no separate `ink-use-focus` package exists.
> Use `Spinner` from `@inkjs/ui` inside Ink trees; avoid mixing `ora` (writes to stdout directly) with the Ink renderer.

### Library Breakdown

| Feature | Current | Target | Package |
|---------|---------|--------|---------|
| Select menus | `prompts.select` | `Select` | `@inkjs/ui` |
| Multi-select | `prompts.multiselect` | `MultiSelect` | `@inkjs/ui` |
| Text input | `prompts.text` | `TextInput` | `@inkjs/ui` |
| Password | `prompts.password` | `PasswordInput` (preferred) or `TextInput` with `mask` | `@inkjs/ui` / `ink-text-input` |
| Confirm | `prompts.confirm` | `ConfirmInput` | `@inkjs/ui` |
| Styling | `chalk` | `Text` with color props | `ink` |

---

## Component Mapping

### 1. Select Menu → Select Component

**Before (prompts):**
```typescript
const { action } = await prompts({
  type: "select",
  name: "action",
  message: "What would you like to do?",
  choices: [
    { title: "➕ Add new instance", value: "add" },
    { title: "📋 List all instances", value: "list" },
    // ...
  ],
  initial: 0,
});
```

**After (Ink):**
```typescript
import { Select } from '@inkjs/ui';

<Select
  options={[
    { label: '➕ Add new instance', value: 'add' },
    { label: '📋 List all instances', value: 'list' },
    // ...
  ]}
  onChange={(value) => {
    // Handle selection
  }}
/>
```

### 2. Text Input → TextInput Component

**Before (prompts):**
```typescript
const { name } = await prompts({
  type: "text",
  name: "name",
  message: "Instance name:",
  validate: (value: string) => {
    if (!value.trim()) return "Name is required";
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      return "Name can only contain letters, numbers, hyphens, and underscores";
    }
    return true;
  },
});
```

**After (Ink — `@inkjs/ui`):**
```typescript
import { TextInput } from '@inkjs/ui';
import { Text } from 'ink';
import { useState } from 'react';

const [error, setError] = useState('');

<>
  <TextInput
    placeholder="Instance name"
    onSubmit={(value) => {
      if (!value.trim()) {
        setError('Name is required');
        return;
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        setError('Invalid name format');
        return;
      }
      setError('');
      // Proceed with valid name
    }}
  />
  {error && <Text color="red">{error}</Text>}
</>
```

> `@inkjs/ui`'s `TextInput` is uncontrolled — read the value via `onSubmit(value)` / `onChange(value)` instead of `value=`.
> If you need controlled input, install `ink-text-input` and use its default export instead.

### 3. Password Input → PasswordInput Component

**Before (prompts):**
```typescript
const { inputApiKey } = await prompts({
  type: "password",
  name: "inputApiKey",
  message: `Enter your ${providerTemplate.displayName} API key:`,
  validate: (value: string) => {
    if (!value.trim()) return "API key is required";
    return true;
  },
});
```

**After (Ink — `@inkjs/ui`):**
```typescript
import { PasswordInput } from '@inkjs/ui';

<PasswordInput
  placeholder="API key"
  onChange={setApiKey}
  onSubmit={(value) => {
    if (!value.trim()) {
      setError('API key is required');
      return;
    }
    // Proceed with API key
  }}
/>
```

**Alternative (controlled, via `ink-text-input`):**
```typescript
import TextInput from 'ink-text-input';

<TextInput
  placeholder="API key"
  mask="*"
  value={apiKey}
  onChange={setApiKey}
  onSubmit={() => { /* validate & advance */ }}
/>
```

### 4. Confirm Dialog → ConfirmInput Component

**Before (prompts):**
```typescript
const { confirm } = await prompts({
  type: "confirm",
  name: "confirm",
  message: `Are you sure you want to remove instance '${instanceName}'?`,
  initial: false,
});
```

**After (Ink):**
```typescript
import { ConfirmInput } from '@inkjs/ui';

// For destructive prompts, default to cancel (matches `prompts` `initial: false`).
// Without `defaultChoice="cancel"`, bare Enter triggers `onConfirm`.
<ConfirmInput
  defaultChoice="cancel"
  onConfirm={() => {
    removeInstance(instanceName);
  }}
  onCancel={() => {
    // User canceled
  }}
/>
```

> `ConfirmInput` props: `defaultChoice: 'confirm' | 'cancel'` (default `'confirm'`),
> `submitOnEnter: boolean` (default `true`), plus `onConfirm` / `onCancel`.

### 5. Multi-Select → MultiSelect Component

**Before (prompts):**
```typescript
const { selected } = await prompts({
  type: "multiselect",
  name: "selected",
  message: "Select instances to fix:",
  choices: instances.map(i => ({
    title: `${i.name} ${i.autoSync ? "(auto-sync)" : "(manual)"}`,
    value: i.name,
  })),
});
```

**After (Ink — `@inkjs/ui`):**
```typescript
import { MultiSelect } from '@inkjs/ui';
import { Box, Text } from 'ink';

<Box flexDirection="column">
  <Text>Select instances to fix (space to toggle, enter to submit):</Text>
  <MultiSelect
    options={instances.map(i => ({
      label: `${i.name} ${i.autoSync ? '(auto-sync)' : '(manual)'}`,
      value: i.name,
    }))}
    onSubmit={(selected) => {
      // `selected` is a string[] of chosen instance names
      fixSymlinks(selected);
    }}
  />
</Box>
```

> `MultiSelect` props: `options`, `defaultValue?: string[]`, `highlightText?`, `onChange(value: string[])`, `onSubmit(value: string[])`.

---

## State Management Strategy

### Current State Management

The current CLI uses:
- **Global config**: `~/.claude-multi/config.json`
- **In-memory state**: Local variables in functions
- **No caching**: Always reads from disk

### Proposed Ink State Management

```typescript
// App-level state structure
interface AppState {
  // Data state
  instances: Instance[];
  config: ClaudeMultiConfig;
  
  // UI state
  currentScreen: Screen;
  selectedInstance: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Form states
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
}

type Screen = 
  | 'main-menu'
  | 'add-instance'
  | 'list-instances'
  | 'instance-info'
  | 'remove-instance'
  | 'manage-plugins'
  | 'manage-mcp'
  | 'auto-sync';

// Custom hook for config management
const useConfig = () => {
  const [config, setConfig] = useState<ClaudeMultiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig()
      .then(setConfig)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const saveConfig = async (newConfig: ClaudeMultiConfig) => {
    setLoading(true);
    try {
      await saveConfigFile(newConfig);
      setConfig(newConfig);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, saveConfig };
};
```

---

## Step-by-Step Migration Plan

Ordered task groups. No fixed timeline — work through them sequentially.

### Step 1 — Foundation

1. Install Ink dependencies
   ```bash
   bun add ink react @inkjs/ui
   ```

2. Create new entry point
   ```typescript
   // src/ink-cli.tsx
   import React from 'react';
   import { render } from 'ink';
   import { App } from './ink-app';

   render(<App />);
   ```

3. Create base components
   - `src/ink/components/Header.tsx`
   - `src/ink/components/Spinner.tsx`
   - `src/ink/components/ErrorBoundary.tsx`

4. Migrate simple display views
   - `ListInstances` component
   - `InstanceInfo` component

---

### Step 2 — Interactive Components

1. Create reusable form components
   - `SelectMenu.tsx`
   - `MultiSelect.tsx`
   - `TextInput.tsx` wrapper
   - `ConfirmDialog.tsx`

2. Migrate Add Instance flow
   - Name input with validation
   - Provider template selection
   - API key input
   - Path configuration
   - Copy options selection

3. Migrate Remove Instance flow
   - Instance selection
   - Confirmation dialog (use `defaultChoice="cancel"` for destructive actions)

4. Migrate Auto-sync toggle
   - Instance selection
   - Action selection
   - Progress feedback

---

### Step 3 — Advanced Features

1. Migrate Plugin Management
   - Plugin listing
   - Enable/disable plugins
   - Copy plugins between instances

2. Migrate MCP Management
   - MCP server listing
   - Copy servers between instances
   - Verification display

3. Migrate Fix Symlinks
   - Multi-select instances
   - Progress feedback
   - Error handling

---

### Step 4 — Polish

1. Animations and transitions (spinners, screen transitions)
2. Visual design (color scheme, border styles, spacing)
3. Manual testing of all flows + edge cases
4. Update README and migration notes

---

## Code Examples

### Complete Add Instance Flow in Ink

```typescript
// src/ink/screens/AddInstance.tsx
import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { TextInput, Select, ConfirmInput, PasswordInput } from '@inkjs/ui';
import { useConfig } from '../hooks/useConfig';

export const AddInstance = () => {
  const { exit } = useApp();
  const { addInstance, createWrapper } = useConfig();

  const [step, setStep] = useState<'name' | 'provider' | 'paths' | 'copy' | 'done'>('name');
  const [instanceName, setInstanceName] = useState('');
  const [useProvider, setUseProvider] = useState<boolean | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleNameSubmit = (value: string) => {
    if (!value.trim()) {
      setError('Name is required');
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      setError('Invalid name format');
      return;
    }
    setError('');
    setInstanceName(value);
    setStep('provider');
  };

  const handleProviderConfirm = (confirmed: boolean) => {
    setUseProvider(confirmed);
    if (!confirmed) {
      setStep('paths');
    }
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setStep('paths');
  };

  const handleComplete = async () => {
    try {
      const instance: Instance = {
        name: instanceName,
        configDir: join(homedir(), `.claude-${instanceName}`),
        binaryPath: getDefaultBinaryPath(instanceName),
        createdAt: new Date().toISOString(),
        autoSync: true,
      };

      await addInstance(instance);
      await createWrapper(instance);
      
      if (useProvider && selectedProvider && apiKey) {
        const template = getProviderTemplate(selectedProvider);
        await createSettingsFromTemplate(instance.configDir, template, apiKey);
      }

      setStep('done');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box
        borderStyle="bold"
        borderColor="cyan"
        padding={1}
        marginBottom={1}
        justifyContent="center"
      >
        <Text bold color="cyan">➕ Add New Instance</Text>
      </Box>

      {/* Step indicator */}
      <Box marginBottom={1}>
        <Text dimColor>
          Step: {step === 'name' ? '1/4 Name' : step === 'provider' ? '2/4 Provider' : step === 'paths' ? '3/4 Configuration' : '4/4 Confirm'}
        </Text>
      </Box>

      {/* Error display */}
      {error && (
        <Box marginBottom={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}

      {/* Step content */}
      {step === 'name' && (
        <Box flexDirection="column">
          <Text>Enter instance name:</Text>
          <Text dimColor>(letters, numbers, hyphens, underscores only)</Text>
          <TextInput
            placeholder="my-instance"
            onSubmit={handleNameSubmit}
          />
          <Text dimColor>Press Enter to continue</Text>
        </Box>
      )}

      {step === 'provider' && useProvider === null && (
        <Box flexDirection="column">
          <Text>Would you like to use a provider template?</Text>
          <ConfirmInput
            onConfirm={() => handleProviderConfirm(true)}
            onCancel={() => handleProviderConfirm(false)}
          />
        </Box>
      )}

      {step === 'provider' && useProvider === true && !selectedProvider && (
        <Box flexDirection="column">
          <Text>Select a provider:</Text>
          <Select
            options={[
              { label: 'GLM (Zhipu AI)', value: 'glm' },
              { label: 'MiniMax', value: 'minimax' },
              { label: 'DeepSeek', value: 'deepseek' },
            ]}
            onChange={setSelectedProvider}
          />
        </Box>
      )}

      {step === 'provider' && selectedProvider && !apiKey && (
        <Box flexDirection="column">
          <Text>Enter your {selectedProvider} API key:</Text>
          <PasswordInput
            placeholder="sk-..."
            onSubmit={(value) => {
              if (!value.trim()) {
                setError('API key is required');
                return;
              }
              setError('');
              setApiKey(value);
              handleComplete();
            }}
          />
        </Box>
      )}

      {step === 'done' && (
        <Box flexDirection="column">
          <Text color="green">✓ Instance created successfully!</Text>
          <Text dimColor>Binary: ~/.local/bin/claude-{instanceName}</Text>
          <Text dimColor>Config: ~/.claude-{instanceName}</Text>
          <Box marginTop={1}>
            <Text dimColor>Press q to return to menu</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
```

### Main App Component

```typescript
// src/ink/App.tsx
import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Select } from '@inkjs/ui';
import { useConfig } from './hooks/useConfig';
import { AddInstance } from './screens/AddInstance';
import { ListInstances } from './screens/ListInstances';
import { RemoveInstance } from './screens/RemoveInstance';
import { ManagePlugins } from './screens/ManagePlugins';
import { ManageMcp } from './screens/ManageMcp';

type Screen = 'menu' | 'add' | 'list' | 'remove' | 'plugins' | 'mcp';

export const App = () => {
  const { exit } = useApp();
  const { config, loading, error } = useConfig();
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
    if (input === 'b' && currentScreen !== 'menu') {
      setCurrentScreen('menu');
    }
  });

  if (loading) {
    return (
      <Box>
        <Text dimColor>Loading configuration...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (currentScreen === 'menu') {
    return (
      <Box flexDirection="column" padding={1}>
        {/* Header */}
        <Box
          borderStyle="bold"
          borderColor="cyan"
          padding={1}
          marginBottom={1}
          justifyContent="center"
        >
          <Text bold color="cyan">🤖 Claude Multi</Text>
        </Box>

        {/* Instance count */}
        <Box marginBottom={1}>
          <Text dimColor>
            Managing {config?.instances.length || 0} instance(s)
          </Text>
        </Box>

        {/* Main menu */}
        <Select
          options={[
            { label: '➕ Add new instance', value: 'add' },
            { label: '📋 List all instances', value: 'list' },
            { label: '🗑️ Remove instance', value: 'remove' },
            { label: '🔌 Manage plugins', value: 'plugins' },
            { label: '⚙️ Manage MCP servers', value: 'mcp' },
          ]}
          onChange={(value) => setCurrentScreen(value as Screen)}
        />

        {/* Footer */}
        <Box marginTop={1}>
          <Text dimColor>↑↓ navigate • Enter select • q quit</Text>
        </Box>
      </Box>
    );
  }

  // Screen routing
  switch (currentScreen) {
    case 'add':
      return <AddInstance />;
    case 'list':
      return <ListInstances />;
    case 'remove':
      return <RemoveInstance />;
    case 'plugins':
      return <ManagePlugins />;
    case 'mcp':
      return <ManageMcp />;
    default:
      return null;
  }
};
```

---

## Testing Strategy

Use [`ink-testing-library`](https://github.com/vadimdemedes/ink-testing-library) (v4) to render components and assert on frame output / simulated keypresses.

```bash
bun add -d ink-testing-library
```

### Unit Testing

```typescript
// test/ink/AddInstance.test.tsx
import { test, expect } from 'bun:test';
import { render } from 'ink-testing-library';
import { AddInstance } from '../../src/ink/screens/AddInstance';

test('rejects empty instance name', () => {
  const { stdin, lastFrame } = render(<AddInstance />);
  stdin.write('\r'); // press Enter with empty input
  expect(lastFrame()).toContain('Name is required');
});

test('rejects invalid characters in name', () => {
  const { stdin, lastFrame } = render(<AddInstance />);
  stdin.write('bad name!\r');
  expect(lastFrame()).toContain('Invalid name format');
});

test('advances to provider step on valid name', () => {
  const { stdin, lastFrame } = render(<AddInstance />);
  stdin.write('my-instance\r');
  expect(lastFrame()).toContain('Would you like to use a provider template?');
});
```

### Integration Testing

```typescript
// test/ink/flows.test.tsx
import { test, expect } from 'bun:test';
import { render } from 'ink-testing-library';
import { App } from '../../src/ink/App';

test('main menu navigates to Add Instance', () => {
  const { stdin, lastFrame } = render(<App />);
  // Default selection is "Add new instance"; Enter to confirm.
  stdin.write('\r');
  expect(lastFrame()).toContain('Add New Instance');
});

test('q exits the app', () => {
  const { stdin, frames } = render(<App />);
  stdin.write('q');
  // App should unmount; final frame stops updating.
  expect(frames.at(-1)).toBeDefined();
});
```

### Key simulation reference

| Action | `stdin.write(...)` |
|---|---|
| Enter | `'\r'` |
| Arrow down | `'[B'` |
| Arrow up | `'[A'` |
| Space | `' '` |
| Escape | `''` |
| Ctrl+C | `''` |

### Manual Testing Checklist

- [ ] All 28 interactive elements work
- [ ] Keyboard navigation functions correctly
- [ ] Error states display properly
- [ ] Loading states show appropriately
- [ ] Form validation works as expected
- [ ] Configuration saves correctly
- [ ] Back navigation works
- [ ] Help text is clear

---

## Deployment Considerations

### Build Configuration

```json
// package.json updates
{
  "scripts": {
    "build": "bun build src/ink-cli.tsx --outfile dist/cli.js --banner \"#!/usr/bin/env bun\"",
    "dev": "bun run src/ink-cli.tsx",
    "dev:old": "bun run src/cli.ts"
  },
  "dependencies": {
    "ink": "^7.0.2",
    "react": "^19.2.6",
    "@inkjs/ui": "^2.0.0"
  }
}
```

> Ink 7 requires React ≥ 19.2 as a peer. `ink-text-input` (v6) and `ink-select-input` (v6.2) are optional add-ons — only include if you need their specific props (e.g. `mask` on a controlled `TextInput`).

### Backward Compatibility

```bash
# Support both old and new interfaces
claude-multi          # Uses new Ink UI
claude-multi --old    # Uses old prompts UI
```

### Feature Flags

```typescript
// Default-on; opt out with CLAUDE_MULTI_INK=false
const useInkUI = process.env.CLAUDE_MULTI_INK !== 'false';
```

---

## Rollback Plan

### If Migration Fails

1. **Keep old CLI accessible**
   ```bash
   # Old CLI remains available
   claude-multi --legacy
   ```

2. **Feature flag control**
   ```bash
   # Disable Ink UI
   export CLAUDE_MULTI_INK=false
   ```

3. **Quick rollback steps**
   ```bash
   # Revert the migration commit(s) on a branch, do not discard local history
   bun remove ink react @inkjs/ui ink-text-input ink-select-input
   git revert <migration-commit-sha>
   bun run build
   ```

---

## Success Criteria

### Functional Requirements
- All 28 interactive elements migrated
- All existing features work identically
- No data loss or corruption
- Error handling maintained

### UX Requirements
- Clear visual hierarchy
- Intuitive keyboard navigation
- Clear feedback on success / error states

### Technical Requirements
- No perceptible performance regression
- TypeScript strict mode

---

## Resources

### Documentation
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Ink UI Components](https://github.com/vadimdemedes/ink-ui)
- [React Hooks](https://react.dev/reference/react)

### Community
- [Ink Discord](https://discord.gg/vxvsQ8jp)
- [Reddit r/CLI](https://reddit.com/r/CLI)

### Examples
- [Ink Examples](https://github.com/vadimdemedes/ink/tree/master/examples)
- [CLI Showcase](https://github.com/topic/awesome-cli)

---

## Appendix: Quick Reference

### Chalk to Ink Color Mapping

| Chalk | Ink | Usage |
|-------|-----|-------|
| `chalk.red()` | `color="red"` | Errors |
| `chalk.yellow()` | `color="yellow"` | Warnings |
| `chalk.green()` | `color="green"` | Success |
| `chalk.cyan()` | `color="cyan"` | Interactive |
| `chalk.gray()` | `dimColor` | Secondary |
| `chalk.bold()` | `bold` | Emphasis |

### Keyboard Shortcuts to Implement

| Key | Action |
|-----|--------|
| `q` | Quit/Exit |
| `b` | Back (when not in menu) |
| `↑↓` | Navigate |
| `Enter` | Select/Confirm |
| `Space` | Toggle (multi-select) |
| `Esc` | Cancel |
| `1-9` | Quick select |

