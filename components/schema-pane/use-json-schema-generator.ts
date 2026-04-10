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

function generateSchema(
    obj: unknown,
    options: SchemaOptions & ConstraintOptions,
): Record<string, unknown> {
    const schema: Record<string, unknown> = {
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

function inferType(
    value: unknown,
    mode: 'strict' | 'loose',
    path: string = '',
): Record<string, unknown> {
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

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const keys = Object.keys(value);
        if (keys.length === 0) {
            return { type: 'object', properties: {} };
        }

        const properties: Record<string, unknown> = {};
        keys.forEach((key) => {
            properties[key] = inferType(
                (value as Record<string, unknown>)[key],
                mode,
                `${path}/${key}`,
            );
        });

        return {
            type: 'object',
            properties,
            required: keys,
        };
    }

    return {};
}

function applyConstraints(schema: Record<string, unknown>, options: ConstraintOptions): void {
    // Apply pattern constraints
    if (Object.keys(options.patterns).length > 0 && schema.properties) {
        applyPatternConstraints(schema.properties as Record<string, unknown>, options.patterns);
    }

    // Apply range constraints
    if (Object.keys(options.ranges).length > 0 && schema.properties) {
        applyRangeConstraints(schema.properties as Record<string, unknown>, options.ranges);
    }

    // Apply enum constraints
    if (Object.keys(options.enums).length > 0 && schema.properties) {
        applyEnumConstraints(schema.properties as Record<string, unknown>, options.enums);
    }

    // Apply required fields
    if (options.required.length > 0 && schema.properties) {
        const existingRequired = (schema.required as string[]) || [];
        schema.required = [...new Set([...existingRequired, ...options.required])];
    }
}

function applyPatternConstraints(
    properties: Record<string, unknown>,
    patterns: Record<string, string>,
): void {
    if (!properties) return;

    Object.keys(patterns).forEach((field) => {
        const parts = field.split('.');
        let current: Record<string, unknown> = properties;

        for (let i = 0; i < parts.length - 1; i++) {
            const prop = current[parts[i]] as Record<string, unknown> | undefined;
            if (prop && prop.properties) {
                current = prop.properties as Record<string, unknown>;
            }
        }

        const lastPart = parts[parts.length - 1];
        const lastProp = current[lastPart] as Record<string, unknown> | undefined;
        if (lastProp) {
            lastProp.pattern = patterns[field];
        }
    });
}

function applyRangeConstraints(
    properties: Record<string, unknown>,
    ranges: Record<string, { min?: number; max?: number }>,
): void {
    if (!properties) return;

    Object.keys(ranges).forEach((field) => {
        const parts = field.split('.');
        let current: Record<string, unknown> = properties;

        for (let i = 0; i < parts.length - 1; i++) {
            const prop = current[parts[i]] as Record<string, unknown> | undefined;
            if (prop && prop.properties) {
                current = prop.properties as Record<string, unknown>;
            }
        }

        const lastPart = parts[parts.length - 1];
        const lastProp = current[lastPart] as Record<string, unknown> | undefined;
        if (lastProp) {
            if (ranges[field].min !== undefined) {
                lastProp.minimum = ranges[field].min;
            }
            if (ranges[field].max !== undefined) {
                lastProp.maximum = ranges[field].max;
            }
        }
    });
}

function applyEnumConstraints(
    properties: Record<string, unknown>,
    enums: Record<string, unknown[]>,
): void {
    if (!properties) return;

    Object.keys(enums).forEach((field) => {
        const parts = field.split('.');
        let current: Record<string, unknown> = properties;

        for (let i = 0; i < parts.length - 1; i++) {
            const prop = current[parts[i]] as Record<string, unknown> | undefined;
            if (prop && prop.properties) {
                current = prop.properties as Record<string, unknown>;
            }
        }

        const lastPart = parts[parts.length - 1];
        const lastProp = current[lastPart] as Record<string, unknown> | undefined;
        if (lastProp) {
            lastProp.enum = enums[field];
        }
    });
}
