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
        if (json.length === 0) return { type: 'array' };
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
            ...(Object.keys(properties).length > 0 ? { properties } : {}),
            ...(required.length > 0 ? { required } : {}),
        };
    }

    return {};
}

function mergeSchemas(schemas: object[]): object {
    // Flatten oneOf schemas and filter out completely empty schemas
    const flatSchemas: object[] = [];
    for (const schema of schemas) {
        if ('oneOf' in schema && Array.isArray((schema as any).oneOf)) {
            flatSchemas.push(...(schema as any).oneOf);
        } else if (Object.keys(schema).length > 0) {
            flatSchemas.push(schema);
        }
    }

    if (flatSchemas.length === 0) return {};
    if (flatSchemas.length === 1) return flatSchemas[0];

    // Stringify and deduplicate schemas first to prevent massive oneOf arrays
    const uniqueSchemasStr = Array.from(new Set(flatSchemas.map((s) => JSON.stringify(s))));
    let uniqueSchemas = uniqueSchemasStr.map((s) => JSON.parse(s));

    if (uniqueSchemas.length === 1) return uniqueSchemas[0];

    // Simplify number/integer fallback
    const hasNumber = uniqueSchemas.some(s => (s as any).type === 'number');
    if (hasNumber) {
        uniqueSchemas = uniqueSchemas.filter(s => (s as any).type !== 'integer');
    }

    if (uniqueSchemas.length === 1) return uniqueSchemas[0];

    // Merge multiple object schemas into a single object schema
    const objectSchemas = uniqueSchemas.filter(
        (s) => (s as { type?: string }).type === 'object',
    );

    if (objectSchemas.length > 1) {
        const allProps: Record<string, object[]> = {};
        const requiredCount: Record<string, number> = {};

        for (const schema of objectSchemas) {
            const s = schema as { properties?: Record<string, object>; required?: string[] };
            if (s.properties) {
                for (const [key, val] of Object.entries(s.properties)) {
                    if (!allProps[key]) allProps[key] = [];
                    allProps[key].push(val);
                }
            }
            if (s.required) {
                s.required.forEach((r) => {
                    requiredCount[r] = (requiredCount[r] || 0) + 1;
                });
            }
        }

        const properties: Record<string, object> = {};
        for (const [key, vals] of Object.entries(allProps)) {
            properties[key] = mergeSchemas(vals);
        }

        const allRequired: string[] = [];
        for (const [key, count] of Object.entries(requiredCount)) {
            if (count === objectSchemas.length) {
                allRequired.push(key);
            }
        }

        const mergedObject = {
            type: 'object',
            ...(Object.keys(properties).length > 0 ? { properties } : {}),
            ...(allRequired.length > 0 ? { required: allRequired } : {}),
        };

        const otherSchemas = uniqueSchemas.filter(
            (s) => (s as { type?: string }).type !== 'object',
        );
        return mergeSchemas([mergedObject, ...otherSchemas]);
    }

    // Merge multiple array schemas into a single array schema
    const arraySchemas = uniqueSchemas.filter(
        (s) => (s as { type?: string }).type === 'array',
    );

    if (arraySchemas.length > 1) {
        const allItems = arraySchemas
            .map((s) => (s as { items?: object }).items)
            .filter(Boolean) as object[];
        const mergedArray = {
            type: 'array',
            ...(allItems.length > 0 ? { items: mergeSchemas(allItems) } : {}),
        };
        const otherSchemas = uniqueSchemas.filter(
            (s) => (s as { type?: string }).type !== 'array',
        );
        return mergeSchemas([mergedArray, ...otherSchemas]);
    }

    return { oneOf: uniqueSchemas };
}
