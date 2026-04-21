import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export interface ValidationResult {
    valid: boolean;
    errors?: Array<{ path: string; message: string }>;
}

export function validateJsonSchema(jsonData: unknown, schema: unknown): ValidationResult {
    const validate = ajv.compile(schema as object);
    const valid = validate(jsonData);

    if (valid) return { valid: true };

    return {
        valid: false,
        errors: validate.errors?.map((err) => ({
            path: err.instancePath || '/',
            message: err.message ?? 'Validation error',
        })),
    };
}

export function generateSchema(json: unknown): object {
    if (json === null) return { type: 'null' };
    if (typeof json === 'string') return { type: 'string' };
    if (typeof json === 'number') return { type: Number.isInteger(json) ? 'integer' : 'number' };
    if (typeof json === 'boolean') return { type: 'boolean' };

    if (Array.isArray(json)) {
        if (json.length === 0) return { type: 'array', items: {} };
        const itemSchemas = json.map((item) => generateSchema(item));
        return { type: 'array', items: mergeSchemas(itemSchemas) };
    }

    if (typeof json === 'object') {
        const properties: Record<string, object> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
            properties[key] = generateSchema(value);
            required.push(key);
        }

        return {
            type: 'object',
            properties,
            required,
        };
    }

    return {};
}

function mergeSchemas(schemas: object[]): object {
    if (schemas.length === 0) return {};
    if (schemas.length === 1) return schemas[0];

    const types = new Set(schemas.map((s) => (s as { type?: string }).type));
    if (types.size === 1) {
        const type = types.values().next().value;
        if (type === 'object') {
            const allProps: Record<string, object[]> = {};
            const allRequired = new Set<string>();

            for (const schema of schemas) {
                const s = schema as { properties?: Record<string, object>; required?: string[] };
                if (s.properties) {
                    for (const [key, val] of Object.entries(s.properties)) {
                        if (!allProps[key]) allProps[key] = [];
                        allProps[key].push(val);
                    }
                }
                if (s.required) {
                    s.required.forEach((r) => allRequired.add(r));
                }
            }

            const properties: Record<string, object> = {};
            for (const [key, vals] of Object.entries(allProps)) {
                properties[key] = mergeSchemas(vals);
            }

            return {
                type: 'object',
                properties,
                required: Array.from(allRequired),
            };
        }
    }

    return { oneOf: schemas };
}
