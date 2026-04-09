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
