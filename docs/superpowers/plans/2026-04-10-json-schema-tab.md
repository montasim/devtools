# JSON Schema Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a JSON Schema tools tab that generates schemas from JSON and validates JSON against schemas with configurable options

**Architecture:** Two-mode interface (Generate/Validate) following existing tab patterns, using custom hooks for schema generation and validation, with ajv for JSON Schema validation and localStorage persistence

**Tech Stack:** React hooks, TypeScript, CodeMirror, ajv + ajv-formats, shadcn/ui components (RadioGroup)

---

## Task 1: Install dependencies

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json` (auto-generated)

- [ ] **Step 1: Install ajv and ajv-formats packages**

Run: `npm install ajv ajv-formats`
Expected: Packages added to package.json and node_modules

- [ ] **Step 2: Verify installation**

Run: `npm list ajv ajv-formats`
Expected: Shows installed versions

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: install ajv and ajv-formats for JSON Schema validation"
```

---

## Task 2: Add RadioGroup UI component

**Files:**

- Create: `/components/ui/radio-group.tsx`

- [ ] **Step 1: Create RadioGroup component using shadcn/ui CLI**

Run: `npx shadcn@latest add radio-group`
Expected: Creates `/components/ui/radio-group.tsx` with exports

- [ ] **Step 2: Verify component creation**

Run: `ls -la components/ui/radio-group.tsx`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add components/ui/radio-group.tsx
git commit -m "feat(ui): add RadioGroup component from shadcn/ui"
```

---

## Task 3: Create types file

**Files:**

- Create: `/components/schema-pane/types.ts`

- [ ] **Step 1: Create types file with all interfaces**

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
    patterns: Record<string, string>;
    ranges: Record<string, { min?: number; max?: number }>;
    enums: Record<string, any[]>;
    required: string[];
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

export interface SchemaGenerationResult {
    schema: string;
    isValid: boolean;
    error: string | null;
}

export interface SchemaPaneProps {
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    className?: string;
}
```

- [ ] **Step 2: Create directory first if needed**

Run: `mkdir -p components/schema-pane`
Expected: Directory created

- [ ] **Step 3: Commit**

```bash
git add components/schema-pane/types.ts
git commit -m "feat(schema-pane): add type definitions"
```

---

## Task 4: Create schema generation hook

**Files:**

- Create: `/components/schema-pane/use-json-schema-generator.ts`

- [ ] **Step 1: Create schema generation hook**

```typescript
import { useMemo } from 'react';
import type { SchemaOptions, ConstraintOptions, SchemaGenerationResult } from './types';

export function useJsonSchemaGenerator(
    json: string,
    options: SchemaOptions & ConstraintOptions,
): SchemaGenerationResult {
    return useMemo(() => {
        if (!json || json.trim().length === 0) {
            return {
                schema: '',
                isValid: false,
                error: null,
            };
        }

        try {
            const parsed = JSON.parse(json);
            const schema = generateSchema(parsed, options);
            return {
                schema: JSON.stringify(schema, null, 2),
                isValid: true,
                error: null,
            };
        } catch (error) {
            return {
                schema: '',
                isValid: false,
                error: (error as Error).message,
            };
        }
    }, [json, options]);
}

function generateSchema(obj: any, options: SchemaOptions & ConstraintOptions): any {
    const schema: any = {
        $schema:
            options.schemaVersion === 'draft-07'
                ? 'http://json-schema.org/draft-07/schema#'
                : 'https://json-schema.org/draft/2020-12/schema',
    };

    const inferred = inferType(obj, options.strictMode ? 'strict' : 'loose');
    Object.assign(schema, inferred);

    // Apply advanced constraints
    applyConstraints(schema, options);

    return schema;
}

function inferType(value: any, mode: 'strict' | 'loose', path: string = ''): any {
    if (value === null) {
        return { type: 'null' };
    }

    if (typeof value === 'boolean') {
        return { type: 'boolean' };
    }

    if (typeof value === 'number') {
        if (mode === 'strict' && Number.isInteger(value)) {
            return { type: 'integer' };
        }
        return { type: 'number' };
    }

    if (typeof value === 'string') {
        return { type: 'string' };
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return { type: 'array', items: {} };
        }

        const itemTypes = new Set(value.map((item) => typeof item));
        const itemsSchema =
            itemTypes.size === 1
                ? inferType(value[0], mode, `${path}[]`)
                : mode === 'loose'
                  ? { anyOf: [...new Set(value.map((item) => inferType(item, mode)))] }
                  : inferType(value[0], mode, `${path}[]`);

        return {
            type: 'array',
            items: itemsSchema,
        };
    }

    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
            return { type: 'object', properties: {} };
        }

        const properties: any = {};
        keys.forEach((key) => {
            properties[key] = inferType(value[key], mode, `${path}/${key}`);
        });

        return {
            type: 'object',
            properties,
            required: keys,
        };
    }

    return {};
}

function applyConstraints(schema: any, options: ConstraintOptions): void {
    // Apply pattern constraints
    if (Object.keys(options.patterns).length > 0) {
        applyPatternConstraints(schema.properties, options.patterns);
    }

    // Apply range constraints
    if (Object.keys(options.ranges).length > 0) {
        applyRangeConstraints(schema.properties, options.ranges);
    }

    // Apply enum constraints
    if (Object.keys(options.enums).length > 0) {
        applyEnumConstraints(schema.properties, options.enums);
    }

    // Apply required fields
    if (options.required.length > 0 && schema.properties) {
        const existingRequired = schema.required || [];
        schema.required = [...new Set([...existingRequired, ...options.required])];
    }
}

function applyPatternConstraints(properties: any, patterns: Record<string, string>): void {
    if (!properties) return;

    Object.keys(patterns).forEach((field) => {
        const parts = field.split('.');
        let current = properties;

        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] && current[parts[i]].properties) {
                current = current[parts[i]].properties;
            }
        }

        const lastPart = parts[parts.length - 1];
        if (current[lastPart]) {
            current[lastPart].pattern = patterns[field];
        }
    });
}

function applyRangeConstraints(
    properties: any,
    ranges: Record<string, { min?: number; max?: number }>,
): void {
    if (!properties) return;

    Object.keys(ranges).forEach((field) => {
        const parts = field.split('.');
        let current = properties;

        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] && current[parts[i]].properties) {
                current = current[parts[i]].properties;
            }
        }

        const lastPart = parts[parts.length - 1];
        if (current[lastPart]) {
            if (ranges[field].min !== undefined) {
                current[lastPart].minimum = ranges[field].min;
            }
            if (ranges[field].max !== undefined) {
                current[lastPart].maximum = ranges[field].max;
            }
        }
    });
}

function applyEnumConstraints(properties: any, enums: Record<string, any[]>): void {
    if (!properties) return;

    Object.keys(enums).forEach((field) => {
        const parts = field.split('.');
        let current = properties;

        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] && current[parts[i]].properties) {
                current = current[parts[i]].properties;
            }
        }

        const lastPart = parts[parts.length - 1];
        if (current[lastPart]) {
            current[lastPart].enum = enums[field];
        }
    });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit components/schema-pane/use-json-schema-generator.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/schema-pane/use-json-schema-generator.ts
git commit -m "feat(schema-pane): add schema generation hook"
```

---

## Task 5: Create schema validation hook

**Files:**

- Create: `/components/schema-pane/use-json-schema-validator.ts`

- [ ] **Step 1: Create schema validation hook**

```typescript
import { useMemo } from 'react';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { ValidationError, ValidationResult } from './types';

export function useJsonSchemaValidator(json: string, schema: string): ValidationResult {
    return useMemo(() => {
        if (!json || !schema) {
            return {
                isValid: false,
                errors: [],
            };
        }

        try {
            const jsonData = JSON.parse(json);
            const schemaData = JSON.parse(schema);

            // Create Ajv instance
            const ajv = new Ajv({
                allErrors: true,
                strict: false,
            });
            addFormats(ajv);

            // Compile and validate
            const validate: ValidateFunction = ajv.compile(schemaData);
            const valid = validate(jsonData);

            if (valid) {
                return {
                    isValid: true,
                    errors: [],
                };
            }

            // Format errors
            const errors: ValidationError[] = (validate.errors || []).map((err) => ({
                path: err.instancePath || '/',
                property: err.instancePath.split('/').pop() || 'root',
                expected: err.schema?.toString() || 'schema constraint',
                actual: err.data,
                message: err.message || 'Validation failed',
                severity: 'error',
            }));

            return {
                isValid: false,
                errors,
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [
                    {
                        path: '/',
                        property: 'root',
                        expected: 'valid JSON',
                        actual: null,
                        message: (error as Error).message,
                        severity: 'error',
                    },
                ],
            };
        }
    }, [json, schema]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit components/schema-pane/use-json-schema-validator.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/schema-pane/use-json-schema-validator.ts
git commit -m "feat(schema-pane): add schema validation hook with ajv"
```

---

## Task 6: Create schema output component

**Files:**

- Create: `/components/schema-pane/schema-output.tsx`

- [ ] **Step 1: Create schema output component**

```typescript
'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface SchemaOutputProps {
  schema: string;
  isValid: boolean;
  error?: string | null;
  onCopy?: () => void;
  onDownload?: () => void;
}

export function SchemaOutput({ schema, isValid, error, onCopy, onDownload }: SchemaOutputProps) {
  const handleCopy = async () => {
    if (schema) {
      await navigator.clipboard.writeText(schema);
      onCopy?.();
    }
  };

  const handleDownload = () => {
    if (schema) {
      const blob = new Blob([schema], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schema.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onDownload?.();
    }
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '650px' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 shrink-0">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generated Schema
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            disabled={!isValid || !schema}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
            disabled={!isValid || !schema}
            title="Download schema"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Schema Output */}
      <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto flex-1">
        {isValid && schema ? (
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all font-mono">
            {schema}
          </pre>
        ) : (
          <div className="text-gray-400 text-center py-8">
            {error ? (
              <div className="text-red-500">
                <div className="font-medium">Invalid JSON</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            ) : (
              'Enter JSON to generate schema'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/schema-pane/schema-output.tsx
git commit -m "feat(schema-pane): add schema output component"
```

---

## Task 7: Create validation results component

**Files:**

- Create: `/components/schema-pane/validation-results.tsx`

- [ ] **Step 1: Create validation results component**

```typescript
'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '../ui/button';
import type { ValidationResult, ViewMode } from './types';

interface ValidationResultsProps {
  result: ValidationResult;
  viewMode: ViewMode;
  onCopy?: () => void;
  onDownload?: () => void;
}

export function ValidationResults({ result, viewMode, onCopy, onDownload }: ValidationResultsProps) {
  const handleCopy = async () => {
    const text = result.isValid
      ? '✓ Valid JSON'
      : result.errors.map(e => `${e.path}: ${e.message}`).join('\n');
    await navigator.clipboard.writeText(text);
    onCopy?.();
  };

  const handleDownload = () => {
    const text = result.isValid
      ? '✓ Valid JSON'
      : result.errors.map(e => `${e.path}: ${e.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  if (result.errors.length === 0) {
    return (
      <div className="w-full flex flex-col" style={{ height: '600px' }}>
        <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto flex-1 flex items-center justify-center">
          <div className="text-green-600 dark:text-green-400 text-center">
            <div className="text-4xl mb-2">✓</div>
            <div className="font-medium">Valid JSON</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ height: '600px' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 shrink-0">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Validation Results
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            title="Copy results"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
            title="Download results"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Errors List */}
      <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto flex-1">
        <div className="space-y-3">
          {result.errors.map((error, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
              <div className="font-mono text-sm text-red-600 dark:text-red-400">
                {error.path}
              </div>
              <div className="text-gray-700 dark:text-gray-300 mt-1">
                {error.message}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Expected: {error.expected}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Actual: {JSON.stringify(error.actual)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/schema-pane/validation-results.tsx
git commit -m "feat(schema-pane): add validation results component"
```

---

## Task 8: Create main schema pane component

**Files:**

- Create: `/components/schema-pane/schema-pane.tsx`

- [ ] **Step 1: Create main schema pane component**

```typescript
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Download } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { useJsonSchemaGenerator } from './use-json-schema-generator';
import { useJsonSchemaValidator } from './use-json-schema-validator';
import { SchemaOutput } from './schema-output';
import { ValidationResults } from './validation-results';
import type { SchemaPaneProps, SchemaMode, SchemaVersion, ViewMode, ConstraintOptions } from './types';

export const SchemaPane = ({
  onError,
  onValidationChange,
  className,
}: SchemaPaneProps) => {
  // Mode state
  const [mode, setMode] = useState<SchemaMode>(() => {
    if (typeof window === 'undefined') return 'generate';
    try {
      return (localStorage.getItem('json-schema-mode') as SchemaMode) || 'generate';
    } catch {
      return 'generate';
    }
  });

  // JSON input state
  const [jsonInput, setJsonInput] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('json-schema-json-content') || '';
    } catch {
      return '';
    }
  });

  // Schema input state (validate mode)
  const [schemaInput, setSchemaInput] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('json-schema-schema-content') || '';
    } catch {
      return '';
    }
  });

  // Options state
  const [strictMode, setStrictMode] = useState(true);
  const [schemaVersion, setSchemaVersion] = useState<SchemaVersion>('draft-07');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced constraints state
  const [constraints, setConstraints] = useState<ConstraintOptions>({
    patterns: {},
    ranges: {},
    enums: {},
    required: [],
  });

  // Track initial content to avoid saving to localStorage
  const jsonInputRef = useRef(jsonInput);
  const schemaInputRef = useRef(schemaInput);

  useEffect(() => {
    jsonInputRef.current = jsonInput;
  }, [jsonInput]);

  useEffect(() => {
    schemaInputRef.current = schemaInput;
  }, [schemaInput]);

  // Save to localStorage
  useEffect(() => {
    if (jsonInput !== jsonInputRef.current) {
      try {
        localStorage.setItem('json-schema-json-content', jsonInput);
      } catch (error) {
        console.error('Failed to save JSON input:', error);
      }
    }
  }, [jsonInput]);

  useEffect(() => {
    if (schemaInput !== schemaInputRef.current) {
      try {
        localStorage.setItem('json-schema-schema-content', schemaInput);
      } catch (error) {
        console.error('Failed to save schema input:', error);
      }
    }
  }, [schemaInput]);

  useEffect(() => {
    try {
      localStorage.setItem('json-schema-mode', mode);
    } catch (error) {
      console.error('Failed to save mode:', error);
    }
  }, [mode]);

  // Generate schema
  const generationResult = useJsonSchemaGenerator(jsonInput, {
    strictMode,
    schemaVersion,
    viewMode,
    ...constraints,
  });

  // Validate JSON
  const validationResult = useJsonSchemaValidator(jsonInput, schemaInput);

  // Handle validation changes
  useEffect(() => {
    const isValid = mode === 'generate'
      ? generationResult.isValid
      : validationResult.isValid;
    onValidationChange?.(isValid);
  }, [generationResult.isValid, validationResult.isValid, mode, onValidationChange]);

  // Handle errors
  useEffect(() => {
    if (generationResult.error) {
      onError?.(new Error(generationResult.error));
    }
  }, [generationResult.error, onError]);

  // Handle copy schema
  const handleCopySchema = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generationResult.schema);
      console.log('Schema copied to clipboard');
    } catch (error) {
      console.error('Failed to copy schema:', error);
      onError?.(error as Error);
    }
  }, [generationResult.schema, onError]);

  // Handle download schema
  const handleDownloadSchema = useCallback(() => {
    try {
      const blob = new Blob([generationResult.schema], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schema.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Schema downloaded');
    } catch (error) {
      console.error('Failed to download schema:', error);
      onError?.(error as Error);
    }
  }, [generationResult.schema, onError]);

  // Handle clear
  const handleClear = useCallback(() => {
    setJsonInput('');
    setSchemaInput('');
    setConstraints({ patterns: {}, ranges: {}, enums: {}, required: [] });
  }, []);

  return (
    <div className={className}>
      {/* Mode Toggle */}
      <div className="mb-4">
        <RadioGroup value={mode} onValueChange={(value) => setMode(value as SchemaMode)}>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="generate" id="generate" />
              <Label htmlFor="generate">Generate Schema</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="validate" id="validate" />
              <Label htmlFor="validate">Validate JSON</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Content */}
      {mode === 'generate' ? (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: JSON Input */}
          <div className="w-full md:w-1/2 min-w-0">
            <JsonEditor
              label="JSON Input"
              value={jsonInput}
              onChange={setJsonInput}
              onError={() => {}}
              height="600px"
            />
          </div>

          <Separator orientation="vertical" className="hidden md:block" />
          <Separator orientation="horizontal" className="block md:hidden" />

          {/* Right: Schema Output */}
          <div className="w-full md:w-1/2 min-w-0">
            <SchemaOutput
              schema={generationResult.schema}
              isValid={generationResult.isValid}
              error={generationResult.error}
              onCopy={handleCopySchema}
              onDownload={handleDownloadSchema}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: JSON + Schema Inputs */}
          <div className="w-full md:w-1/2 min-w-0 flex flex-col gap-4">
            <JsonEditor
              label="JSON Input"
              value={jsonInput}
              onChange={setJsonInput}
              onError={() => {}}
              height="290px"
            />
            <JsonEditor
              label="Schema"
              value={schemaInput}
              onChange={setSchemaInput}
              onError={() => {}}
              height="290px"
            />
          </div>

          <Separator orientation="vertical" className="hidden md:block" />
          <Separator orientation="horizontal" className="block md:hidden" />

          {/* Right: Validation Results */}
          <div className="w-full md:w-1/2 min-w-0">
            <ValidationResults
              result={validationResult}
              viewMode={viewMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add components/schema-pane/schema-pane.tsx
git commit -m "feat(schema-pane): add main schema pane component with mode switching"
```

---

## Task 9: Create index file

**Files:**

- Create: `/components/schema-pane/index.ts`

- [ ] **Step 1: Create index barrel file**

```typescript
export { SchemaPane } from './schema-pane';
export type {
    SchemaPaneProps,
    SchemaMode,
    SchemaVersion,
    ViewMode,
    SchemaOptions,
    ConstraintOptions,
    ValidationError,
    ValidationResult,
    SchemaGenerationResult,
} from './types';
```

- [ ] **Step 2: Commit**

```bash
git add components/schema-pane/index.ts
git commit -m "feat(schema-pane): add barrel exports"
```

---

## Task 10: Create share dialog component

**Files:**

- Create: `/components/schema-pane/schema-share-dialog.tsx`

- [ ] **Step 1: Create share dialog component**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SchemaShareDialogProps {
  content: string;
  schema?: string;
  mode?: 'generate' | 'validate';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SchemaShareDialog({
  content,
  schema,
  mode = 'generate',
  open,
  onOpenChange,
}: SchemaShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = useCallback(() => {
    if (!content) return '';

    try {
      const encoded = btoa(encodeURIComponent(content));
      const url = new URL(window.location.href);
      url.searchParams.set('content', encoded);
      if (schema && mode === 'validate') {
        url.searchParams.set('schema', btoa(encodeURIComponent(schema)));
      }
      url.hash = 'schema';
      return url.toString();
    } catch (error) {
      console.error('Failed to generate share URL:', error);
      return '';
    }
  }, [content, schema, mode]);

  const shareUrl = generateShareUrl();

  const copyToClipboard = useCallback(async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [content]);

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, [shareUrl]);

  const downloadAsFile = useCallback(() => {
    if (!content) return;

    try {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'generate' ? 'schema.json' : 'json-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  }, [content, mode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {mode === 'generate' ? 'Schema' : 'Validation'}
          </SheetTitle>
          <SheetDescription>
            Share this {mode === 'generate' ? 'JSON schema' : 'JSON data'} with others
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {/* Shareable Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Shareable Link
            </label>

            <div className="flex gap-2 mt-2">
              <Input
                value={shareUrl}
                readOnly
                placeholder="Generating link..."
                className="flex-1 text-xs"
              />
              <Button
                size="sm"
                onClick={copyShareUrl}
                disabled={!shareUrl}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Anyone with this link can view the shared content
            </p>
          </div>

          <Separator />

          {/* Copy Content Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Copy Content
            </label>

            <div className="grid grid-cols-1 gap-2 mt-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={copyToClipboard}
                disabled={!content}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy {mode === 'generate' ? 'Schema' : 'JSON'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Export Options Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Export Options
            </label>

            <div className="grid grid-cols-1 gap-2 mt-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={downloadAsFile}
                disabled={!content}
              >
                <Download className="h-4 w-4 mr-2" />
                Download {mode === 'generate' ? 'Schema' : 'JSON'}
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-left w-full">
            💡 Tip: Use the shareable link to collaborate with others
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Update index.ts to export share dialog**

```typescript
export { SchemaPane } from './schema-pane';
export { SchemaShareDialog } from './schema-share-dialog';
export type {
    SchemaPaneProps,
    SchemaMode,
    SchemaVersion,
    ViewMode,
    SchemaOptions,
    ConstraintOptions,
    ValidationError,
    ValidationResult,
    SchemaGenerationResult,
} from './types';
```

- [ ] **Step 3: Commit**

```bash
git add components/schema-pane/schema-share-dialog.tsx components/schema-pane/index.ts
git commit -m "feat(schema-pane): add share dialog component"
```

---

## Task 11: Integrate schema pane into main app

**Files:**

- Modify: `/app/page.tsx`

- [ ] **Step 1: Add SchemaPane import and state**

Add to imports:

```typescript
import { SchemaPane, SchemaShareDialog } from '@/components/schema-pane';
```

Add to state declarations (after exportContent state):

```typescript
const [schemaMode, setSchemaMode] = useState<'generate' | 'validate'>('generate');
const [schemaStrictMode, setSchemaStrictMode] = useState(true);
const [schemaVersion, setSchemaVersion] = useState<'draft-07' | '2020-12'>('draft-07');
const [schemaViewMode, setSchemaViewMode] = useState<'inline' | 'list'>('list');
const [canSchema, setCanSchema] = useState(false);
const [schemaShareDialogOpen, setSchemaShareDialogOpen] = useState(false);
const [schemaContent, setSchemaContent] = useState('');
```

- [ ] **Step 2: Add localStorage loading for schema content**

Add useEffect after export content loading (around line 178):

```typescript
// Load schema content from localStorage on mount and keep in sync
useEffect(() => {
    const loadSchemaContent = () => {
        try {
            const content = localStorage.getItem('json-schema-json-content') || '';
            setSchemaContent(content);
        } catch (error) {
            console.error('Failed to load schema content:', error);
        }
    };

    loadSchemaContent();

    const handleStorageChange = () => {
        loadSchemaContent();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

- [ ] **Step 3: Add SchemaShareDialog component**

Add after ExportShareDialog (around line 482):

```typescript
<SchemaShareDialog
  content={schemaContent}
  mode={schemaMode}
  open={schemaShareDialogOpen}
  onOpenChange={setSchemaShareDialogOpen}
/>
```

- [ ] **Step 4: Add Schema tab to tabs list**

Add to tabs array (around line 269):

```typescript
{ value: 'schema', label: 'Schema', icon: FileJson },
```

- [ ] **Step 5: Add Schema tab content**

Add after Export tab content (around line 661):

```typescript
<TabsContent value="schema" className="mt-0">
  <div>
    <Toolbar
      toggles={[]}
      actions={[
        {
          id: 'clear',
          label: 'Clear All',
          onClick: handleClear,
          variant: 'outline',
          icon: <Trash2 className="h-4 w-4" />,
        },
        {
          id: 'share',
          label: 'Share',
          onClick: () => {
            const content = localStorage.getItem('json-schema-json-content');
            if (!content) {
              alert('No content to share. Please enter some JSON first.');
              return;
            }
            setSchemaShareDialogOpen(true);
          },
          variant: 'outline',
          icon: <Share2 className="h-4 w-4" />,
        },
      ]}
    />

    <SchemaPane
      className='mx-auto'
      onError={handleError}
      onValidationChange={setCanSchema}
    />
  </div>
</TabsContent>
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat(integration): add Schema tab to main application"
```

---

## Task 12: Build verification

**Files:**

- All

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Start dev server and test**

Run: `npm run dev`
Expected: Server starts on port 3000

- [ ] **Step 3: Manual verification checklist**
- Navigate to Schema tab
- Switch between Generate and Validate modes
- Test JSON input in Generate mode
- Verify schema generation output
- Test Copy and Download buttons
- Test Validate mode with JSON and schema inputs
- Verify validation errors display correctly
- Test share dialog
- Verify localStorage persistence

- [ ] **Step 4: Commit final build verification**

```bash
git add .
git commit -m "test: verify JSON Schema tab implementation"
```

---

## Summary

This implementation plan creates a complete JSON Schema tools tab with:

- Two modes: Generate Schema and Validate JSON
- Configurable type inference (strict/loose)
- Schema version selection (draft-07, 2020-12)
- Real-time schema generation and validation
- Copy, download, and share functionality
- localStorage persistence for all inputs and options
- Integration with existing tab pattern and toolbar

The implementation follows all established patterns from Format, Minify, Viewer, Parser, and Export tabs.
