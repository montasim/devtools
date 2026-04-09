# JSON Schema Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a JSON Schema tools tab that generates schemas from JSON and validates JSON against schemas

**Architecture:** Two-mode interface (Generate/Validate) following existing tab patterns, using custom hooks for schema generation and validation, with localStorage persistence and configurable options

**Tech Stack:** React hooks, TypeScript, CodeMirror, ajv or similar JSON Schema validator, shadcn/ui components

---

## Overview

The JSON Schema tab provides two primary features:
1. **Generate Schema**: Infer JSON Schema from JSON input with configurable strictness
2. **Validate JSON**: Validate JSON against a user-provided schema

Users switch between modes using a radio toggle. The tab follows the established two-column pattern used throughout the app.

## Component Structure

```
components/schema-pane/
├── types.ts                      # Type definitions
├── use-json-schema-generator.ts  # Schema generation hook
├── use-json-schema-validator.ts  # Schema validation hook
├── schema-pane.tsx              # Main component
├── schema-output.tsx            # Generated schema display
├── validation-results.tsx       # Validation error display
├── schema-share-dialog.tsx      # Share functionality
└── index.ts                     # Barrel exports
```

## Type Definitions

**types.ts:**

```typescript
export type SchemaMode = 'generate' | 'validate';
export type SchemaVersion = 'draft-07' | '2020-12';
export type ViewMode = 'inline' | 'list';

export interface SchemaOptions {
  strictMode: boolean;
  schemaVersion: SchemaVersion;
  viewMode: ViewMode;
}

export interface ConstraintOptions {
  patterns: Record<string, string>;           // regex patterns for strings
  ranges: Record<string, {min?: number, max?: number}>; // number ranges
  enums: Record<string, any[]>;               // allowed values
  required: string[];                         // required field paths
}

export interface ValidationError {
  path: string;
  property: string;
  expected: string;
  actual: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface SchemaPaneProps {
  onError?: (error: Error) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}
```

## Schema Generation Hook

**use-json-schema-generator.ts:**

Processes JSON input and generates JSON Schema based on options.

```typescript
export function useJsonSchemaGenerator(
  json: string,
  options: SchemaOptions & ConstraintOptions
): { schema: string; isValid: boolean; error: string | null } {
  // Parse JSON
  // Generate schema based on strictMode
  // Apply advanced constraints (patterns, ranges, enums)
  // Format output based on schemaVersion
  // Return schema string + validation status
}
```

**Schema Generation Logic:**

1. **Type Inference (strict mode):**
   - `"value": 123` → `{"type": "integer"}`
   - `"value": "123"` → `{"type": "string"}`
   - Arrays → infer item types from first element
   - Objects → infer properties from all keys

2. **Type Inference (loose mode):**
   - `"value": 123` → `{"type": ["number", "string"]}`
   - Union types for ambiguous values

3. **Advanced Constraints:**
   - Patterns: Add `pattern` property to string fields
   - Ranges: Add `minimum`/`maximum` to number fields
   - Enums: Add `enum` property with allowed values
   - Required: Add field paths to `required` array

4. **Schema Version:**
   - draft-07: `$schema: "http://json-schema.org/draft-07/schema#"`
   - 2020-12: `$schema: "https://json-schema.org/draft/2020-12/schema"`

## Schema Validation Hook

**use-json-schema-validator.ts:**

Validates JSON against a schema using ajv or similar library.

```typescript
export function useJsonSchemaValidator(
  json: string,
  schema: string
): ValidationResult {
  // Parse both JSON and schema
  // Create Ajv validator instance
  // Run validation
  // Format errors into ValidationError[] structure
  // Return result
}
```

**Validation Process:**

1. Parse JSON and schema
2. Create Ajv validator with appropriate schema version
3. Run validation
4. Transform errors to consistent format:
   - Extract JSON pointer path
   - Format expected vs actual
   - Generate human-readable message
5. Return validation result

## Main Component

**schema-pane.tsx:**

Main container with mode switching and state management.

**UI Structure:**

```tsx
<div className="flex flex-col gap-4">
  {/* Mode Toggle */}
  <RadioGroup value={mode} onValueChange={setMode}>
    <RadioGroupItem value="generate">Generate Schema</RadioGroupItem>
    <RadioGroupItem value="validate">Validate JSON</RadioGroupItem>
  </RadioGroup>

  {/* Toolbar */}
  <Toolbar
    toggles={[
      { id: 'strict', label: 'Strict Mode', checked: strictMode, onChange: setStrictMode },
      { id: 'view', label: 'Inline View', checked: viewMode === 'inline', onChange: () => setViewMode(viewMode === 'inline' ? 'list' : 'inline') },
    ]}
    dropdowns={[
      { id: 'version', label: 'Schema Version', value: schemaVersion, options: ['draft-07', '2020-12'], onChange: setSchemaVersion }
    ]}
    actions={[
      { id: 'clear', label: 'Clear All', onClick: handleClear },
      { id: 'share', label: 'Share', onClick: handleShare },
    ]}
  />

  {/* Content */}
  {mode === 'generate' ? (
    <GenerateModeView />
  ) : (
    <ValidateModeView />
  )}
</div>
```

**State Management:**

```typescript
const [mode, setMode] = useState<SchemaMode>(() => {
  return localStorage.getItem('json-schema-mode') as SchemaMode || 'generate';
});

const [jsonInput, setJsonInput] = useState<string>(() => {
  return localStorage.getItem('json-schema-json-content') || '';
});

const [schemaInput, setSchemaInput] = useState<string>(() => {
  return localStorage.getItem('json-schema-schema-content') || '';
});

const [strictMode, setStrictMode] = useState(true);
const [schemaVersion, setSchemaVersion] = useState<SchemaVersion>('draft-07');
const [viewMode, setViewMode] = useState<ViewMode>('list');

const [showAdvanced, setShowAdvanced] = useState(false);
const [constraints, setConstraints] = useState<ConstraintOptions>({
  patterns: {},
  ranges: {},
  enums: {},
  required: [],
});
```

## Generate Mode View

Two-column layout:

```tsx
<div className="flex gap-4">
  {/* Left: JSON Input */}
  <div className="w-1/2">
    <JsonEditor
      label="JSON Input"
      value={jsonInput}
      onChange={setJsonInput}
      height="600px"
    />
  </div>

  {/* Right: Generated Schema */}
  <div className="w-1/2">
    <SchemaOutput
      schema={generatedSchema}
      isValid={isInputValid}
      onCopy={handleCopySchema}
      onDownload={handleDownloadSchema}
    />

    {/* Advanced Options */}
    {showAdvanced && (
      <AdvancedOptions
        constraints={constraints}
        onChange={setConstraints}
      />
    )}
  </div>
</div>
```

**Schema Output Component:**

Displays generated schema with Copy/Download buttons. Shows error message if JSON is invalid.

## Validate Mode View

Split left column (two editors) + right column (results):

```tsx
<div className="flex gap-4">
  {/* Left: JSON + Schema Inputs */}
  <div className="w-1/2 flex flex-col gap-4">
    <JsonEditor
      label="JSON Input"
      value={jsonInput}
      onChange={setJsonInput}
      height="290px"
    />
    <JsonEditor
      label="Schema"
      value={schemaInput}
      onChange={setSchemaInput}
      height="290px"
    />
  </div>

  {/* Right: Validation Results */}
  <div className="w-1/2">
    <ValidationResults
      result={validationResult}
      viewMode={viewMode}
      onCopy={handleCopyErrors}
      onDownload={handleDownloadErrors}
    />
  </div>
</div>
```

## Validation Results Component

**List View:**

```tsx
<div className="validation-results">
  {result.isValid ? (
    <div className="success-message">✓ Valid JSON</div>
  ) : (
    <div className="error-list">
      {result.errors.map(error => (
        <div key={error.path} className="error-item">
          <div className="error-path">{error.path}</div>
          <div className="error-message">{error.message}</div>
          <div className="error-details">
            Expected: {error.expected}<br/>
            Actual: {JSON.stringify(error.actual)}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

**Inline View:**

Use CodeMirror line widgets/decorations to show errors directly in the JSON editor:
- Red underline on error lines
- Hover tooltip with error details
- Click to scroll to error location

## Advanced Options Panel

Collapsible section for adding constraints (Generate mode only):

```tsx
<details open={showAdvanced}>
  <summary>Advanced Options</summary>

  {/* Pattern Constraints */}
  <div>
    <label>Pattern Constraints (regex)</label>
    {stringFields.map(field => (
      <Input
        key={field}
        placeholder={`Pattern for ${field}`}
        value={constraints.patterns[field] || ''}
        onChange={(e) => updatePattern(field, e.target.value)}
      />
    ))}
  </div>

  {/* Range Constraints */}
  <div>
    <label>Number Ranges</label>
    {numberFields.map(field => (
      <div key={field}>
        <Input type="number" placeholder="Min" onChange={(e) => updateRange(field, 'min', e.target.value)} />
        <Input type="number" placeholder="Max" onChange={(e) => updateRange(field, 'max', e.target.value)} />
      </div>
    ))}
  </div>

  {/* Enum Values */}
  <div>
    <label>Enum Constraints</label>
    <Button onClick={addEnum}>Add Enum</Button>
  </div>
</details>
```

## LocalStorage Persistence

Keys:
- `json-schema-mode`: Active mode ('generate' | 'validate')
- `json-schema-json-content`: JSON input text
- `json-schema-schema-content`: Schema input text (validate mode)
- `json-schema-strict-mode`: Boolean for strict mode preference
- `json-schema-schema-version`: Schema version preference
- `json-schema-view-mode`: View mode preference ('inline' | 'list')

Load on mount with lazy initialization, save on change (excluding initial props).

## Share Dialog

**schema-share-dialog.tsx:**

Follows existing share dialog pattern:
- Encode JSON and/or schema content in URL
- Copy content to clipboard (JSON, schema, or both)
- Download as files
- Shareable URL with encoded content

## Integration with Main App

**app/page.tsx:**

Add to tabs list:
```typescript
{ value: 'schema', label: 'Schema', icon: FileJson },
```

Add state:
```typescript
const [schemaMode, setSchemaMode] = useState<SchemaMode>('generate');
const [schemaStrictMode, setSchemaStrictMode] = useState(true);
const [schemaVersion, setSchemaVersion] = useState<SchemaVersion>('draft-07');
const [schemaViewMode, setSchemaViewMode] = useState<ViewMode>('list');
const [canSchema, setCanSchema] = useState(false);
const [schemaShareDialogOpen, setSchemaShareDialogOpen] = useState(false);
const [schemaContent, setSchemaContent] = useState('');
```

Add localStorage loading/syncing for schema content (similar to format, minify, viewer, parser, export tabs).

## Dependencies

Install JSON Schema validator:

```bash
npm install ajv ajv-formats
```

or alternative: `jsonschema` library

## Files to Create

1. `/components/schema-pane/types.ts`
2. `/components/schema-pane/use-json-schema-generator.ts`
3. `/components/schema-pane/use-json-schema-validator.ts`
4. `/components/schema-pane/schema-pane.tsx`
5. `/components/schema-pane/schema-output.tsx`
6. `/components/schema-pane/validation-results.tsx`
7. `/components/schema-pane/schema-share-dialog.tsx`
8. `/components/schema-pane/index.ts`

## Files to Modify

1. `/app/page.tsx` - Add Schema tab integration
2. `/components/ui/radio-group.tsx` - Ensure exists (shadcn/ui component)

## Testing Considerations

- Test schema generation with various JSON structures (nested objects, arrays, primitives)
- Test strict vs loose type inference
- Test advanced constraints (patterns, ranges, enums)
- Test validation with valid and invalid JSON
- Test validation error formatting and display
- Test inline view error decorations
- Test localStorage persistence across page reloads
- Test share dialog URL generation and decoding
- Test both schema versions (draft-07, 2020-12)
