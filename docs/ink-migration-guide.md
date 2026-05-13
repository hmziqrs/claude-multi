# Ink Migration Guide for Claude Multi

## Executive Summary

This guide provides a comprehensive roadmap for migrating **Claude Multi** from a `prompts`-based CLI to a modern **Ink**-based terminal UI. The migration will transform the CLI into a visually stunning, social-media-worthy interface while maintaining all existing functionality.

**Target Benefits:**
- 🎨 Beautiful, responsive layouts
- 🔄 Real-time updates and animations  
- 📱 Modern React-based architecture
- 🎯 Improved user experience
- 📸 Screenshot-worthy UI for Reddit/X

**Migration Complexity:** Medium-High (32 interactive elements to convert)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Technology Stack Comparison](#technology-stack-comparison)
3. [Migration Architecture](#migration-architecture)
4. [Component Mapping](#component-mapping)
5. [State Management Strategy](#state-management-strategy)
6. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
7. [Code Examples](#code-examples)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Considerations](#deployment-considerations)
10. [Rollback Plan](#rollback-plan)

---

## Current State Analysis

### Existing Interactive Elements (32 Total)

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
# Core Ink
bun add ink react

# UI Components (replaces prompts)
bun add @inkjs/ui
bun add ink-text-input
bun add ink-select-input

# Optional enhancements
bun add ink-spinner ora
bun add ink-use-focus
```

### Library Breakdown

| Feature | Current | Target | Package |
|---------|---------|--------|---------|
| Select menus | `prompts.select` | `Select` | `@inkjs/ui` |
| Multi-select | `prompts.multiselect` | Custom or `ink-select-input` | Custom |
| Text input | `prompts.text` | `TextInput` | `@inkjs/ui` |
| Password | `prompts.password` | `TextInput` with `mask` | `ink-text-input` |
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

**After (Ink):**
```typescript
import { TextInput } from 'ink-text-input';
import { useState } from 'react';

const [name, setName] = useState('');
const [error, setError] = useState('');

<TextInput
  placeholder="Instance name"
  value={name}
  onChange={setName}
  onSubmit={() => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      setError('Invalid name format');
      return;
    }
    // Proceed with valid name
  }}
/>
{error && <Text color="red">{error}</Text>}
```

### 3. Password Input → TextInput with Mask

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

**After (Ink):**
```typescript
import { TextInput } from 'ink-text-input';

<TextInput
  placeholder="API key"
  mask="*"
  value={apiKey}
  onChange={setApiKey}
  onSubmit={() => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    // Proceed with API key
  }}
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

<ConfirmInput
  onConfirm={() => {
    // User confirmed
    removeInstance(instanceName);
  }}
  onCancel={() => {
    // User canceled
  }}
/>
```

### 5. Multi-Select → Custom Component

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

**After (Ink):**
```typescript
import { useInput } from 'ink';

const MultiSelect = ({ options, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useInput((input, key) => {
    if (key.upArrow) setSelectedIndex(i => Math.max(0, i - 1));
    if (key.downArrow) setSelectedIndex(i => Math.min(options.length - 1, i + 1));
    if (input === ' ') {
      const item = options[selectedIndex];
      setSelectedItems(prev => {
        const next = new Set(prev);
        if (next.has(item.value)) {
          next.delete(item.value);
        } else {
          next.add(item.value);
        }
        return next;
      });
    }
    if (key.return && selectedItems.size > 0) {
      onSelect(Array.from(selectedItems));
    }
  });

  return (
    <Box flexDirection="column">
      <Text>Select instances (space to toggle, enter to confirm):</Text>
      {options.map((option, i) => (
        <Box key={option.value}>
          <Text color={i === selectedIndex ? 'green' : 'white'}>
            {i === selectedIndex ? '> ' : '  '}
            {selectedItems.has(option.value) ? '[x] ' : '[ ] '}
            {option.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
```

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

### Phase 1: Foundation (Week 1)

**Goal:** Set up Ink infrastructure and migrate simple components

**Tasks:**
1. ✅ Install Ink dependencies
   ```bash
   bun add ink react @inkjs/ui ink-text-input ink-select-input
   ```

2. ✅ Create new entry point
   ```typescript
   // src/ink-cli.tsx
   import React from 'react';
   import { render } from 'ink';
   import { App } from './ink-app';
   
   render(<App />);
   ```

3. ✅ Create base components
   - `src/ink/components/Header.tsx`
   - `src/ink/components/Spinner.tsx`
   - `src/ink/components/ErrorBoundary.tsx`

4. ✅ Migrate simple display views
   - `ListInstances` component
   - `InstanceInfo` component

**Deliverables:**
- Ink infrastructure running
- Basic component library
- 2 display views migrated

---

### Phase 2: Interactive Components (Week 2)

**Goal:** Migrate all interactive prompts to Ink components

**Tasks:**
1. ✅ Create reusable form components
   - `SelectMenu.tsx`
   - `MultiSelect.tsx`
   - `TextInput.tsx` wrapper
   - `ConfirmDialog.tsx`

2. ✅ Migrate Add Instance flow
   - Name input with validation
   - Provider template selection
   - API key input
   - Path configuration
   - Copy options selection

3. ✅ Migrate Remove Instance flow
   - Instance selection
   - Confirmation dialog

4. ✅ Migrate Auto-sync toggle
   - Instance selection
   - Action selection
   - Progress feedback

**Deliverables:**
- All form components created
- 3 major flows migrated
- Validation patterns established

---

### Phase 3: Advanced Features (Week 3)

**Goal:** Migrate complex multi-step wizards

**Tasks:**
1. ✅ Migrate Plugin Management
   - Plugin listing
   - Enable/disable plugins
   - Copy plugins between instances

2. ✅ Migrate MCP Management
   - MCP server listing
   - Copy servers between instances
   - Verification display

3. ✅ Migrate Fix Symlinks
   - Multi-select instances
   - Progress feedback
   - Error handling

**Deliverables:**
- All wizard flows migrated
- Progress indicators implemented
- Error handling refined

---

### Phase 4: Polish & Launch (Week 4)

**Goal:** Finalize migration and prepare for launch

**Tasks:**
1. ✅ Add animations and transitions
   - Loading spinners
   - Success animations
   - Screen transitions

2. ✅ Improve visual design
   - Color scheme refinement
   - Border styles
   - Spacing and layout

3. ✅ Testing
   - Manual testing of all flows
   - Edge case coverage
   - Performance optimization

4. ✅ Documentation
   - Update README
   - Create migration notes
   - Video demo for social media

**Deliverables:**
- Production-ready Ink UI
- Complete documentation
- Launch assets

---

## Code Examples

### Complete Add Instance Flow in Ink

```typescript
// src/ink/screens/AddInstance.tsx
import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { TextInput } from 'ink-text-input';
import { Select } from '@inkjs/ui';
import { ConfirmInput } from '@inkjs/ui';
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

  const handleNameSubmit = async () => {
    if (!instanceName.trim()) {
      setError('Name is required');
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(instanceName)) {
      setError('Invalid name format');
      return;
    }
    setError('');
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
            value={instanceName}
            onChange={setInstanceName}
            onSubmit={handleNameSubmit}
            placeholder="my-instance"
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
          <Text dimColor>q=quit • Press number to select</Text>
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
      return <App />;
  }
};
```

---

## Testing Strategy

### Unit Testing

```typescript
// test/ink/components.test.tsx
import { render } from 'ink-testing-library';
import { AddInstance } from '../src/ink/screens/AddInstance';

describe('AddInstance', () => {
  it('should validate instance name', async () => {
    const { lastFrame } = render(<AddInstance />);
    
    // Test name validation
    // Test provider selection
    // Test API key input
  });
});
```

### Integration Testing

```typescript
// test/ink/flows.test.tsx
describe('Add Instance Flow', () => {
  it('should complete full add instance flow', async () => {
    // Test complete user journey
  });
});
```

### Manual Testing Checklist

- [ ] All 32 interactive elements work
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
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "@inkjs/ui": "^2.0.0",
    "ink-text-input": "^5.0.0",
    "ink-select-input": "^5.0.0"
  }
}
```

### Backward Compatibility

```bash
# Support both old and new interfaces
claude-multi          # Uses new Ink UI
claude-multi --old    # Uses old prompts UI
```

### Feature Flags

```typescript
// Enable gradual rollout
const useInkUI = process.env.CLAUDE_MULTI_INK === 'true' || 
                 process.env.CLAUDE_MULTI_INK !== 'false';
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
   # Revert to previous version
   bun remove ink @inkjs/ui ink-text-input ink-select-input
   git checkout HEAD~1
   bun run build
   ```

---

## Success Criteria

### Functional Requirements
- ✅ All 32 interactive elements migrated
- ✅ All existing features work identically
- ✅ No data loss or corruption
- ✅ Error handling maintained

### UX Requirements
- ✅ Visually impressive UI
- ✅ Smooth animations
- ✅ Intuitive navigation
- ✅ Clear feedback

### Technical Requirements
- ✅ No performance regression
- ✅ Bundle size < 500KB
- ✅ TypeScript strict mode
- ✅ Test coverage > 80%

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

---

**Last Updated:** 2026-05-13  
**Version:** 1.0.0  
**Maintainer:** Claude Multi Team
