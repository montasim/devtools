export type TsType =
    | { kind: 'primitive'; name: string }
    | { kind: 'array'; elementType: TsType }
    | { kind: 'interface'; name: string; fingerprint: string }
    | { kind: 'union'; types: TsType[] };

export interface InterfaceDetail {
    name: string;
    properties: Map<string, { type: TsType; optional: boolean }>;
    body: string;
}

export class TsInterfaceGenerator {
    private declaredInterfaces: Map<string, InterfaceDetail> = new Map();
    private nameCounter: Map<string, number> = new Map();

    private getUniqueName(suggestedName: string): string {
        const cleanName = this.toPascalCase(suggestedName) || 'RootObject';
        if (!this.nameCounter.has(cleanName)) {
            this.nameCounter.set(cleanName, 1);
            return cleanName;
        }
        const count = this.nameCounter.get(cleanName)! + 1;
        this.nameCounter.set(cleanName, count);
        return `${cleanName}${count}`;
    }

    private toPascalCase(str: string): string {
        return str
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^[a-z]/, (chr) => chr.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
    }

    inferType(val: unknown, suggestedName: string = 'RootObject'): TsType {
        if (val === null) {
            return { kind: 'primitive', name: 'any' };
        }
        if (typeof val === 'string') {
            return { kind: 'primitive', name: 'string' };
        }
        if (typeof val === 'number') {
            return { kind: 'primitive', name: 'number' };
        }
        if (typeof val === 'boolean') {
            return { kind: 'primitive', name: 'boolean' };
        }
        if (Array.isArray(val)) {
            if (val.length === 0) {
                return { kind: 'array', elementType: { kind: 'primitive', name: 'any' } };
            }
            const elemTypes = val.map((item) => this.inferType(item, `${suggestedName}Item`));
            const merged = elemTypes.reduce((acc, curr) => this.mergeTypes(acc, curr));
            return { kind: 'array', elementType: merged };
        }
        if (typeof val === 'object') {
            const properties = new Map<string, { type: TsType; optional: boolean }>();
            const obj = val as Record<string, unknown>;
            for (const [key, value] of Object.entries(obj)) {
                const propType = this.inferType(value, key);
                properties.set(key, { type: propType, optional: false });
            }
            return this.registerInterface(properties, suggestedName);
        }
        return { kind: 'primitive', name: 'any' };
    }

    private registerInterface(
        properties: Map<string, { type: TsType; optional: boolean }>,
        suggestedName: string
    ): TsType {
        const fieldsList: { key: string; typeStr: string; optional: boolean }[] = [];
        for (const [key, info] of properties.entries()) {
            fieldsList.push({
                key,
                typeStr: this.getTypeString(info.type, key),
                optional: info.optional,
            });
        }

        fieldsList.sort((a, b) => a.key.localeCompare(b.key));

        const fingerprint = fieldsList
            .map((f) => `${f.key}${f.optional ? '?' : ''}:${f.typeStr}`)
            .join(';');

        if (this.declaredInterfaces.has(fingerprint)) {
            const registered = this.declaredInterfaces.get(fingerprint)!;
            return { kind: 'interface', name: registered.name, fingerprint };
        }

        const uniqueName = this.getUniqueName(suggestedName);

        let body = '';
        for (const field of fieldsList) {
            const formattedKey = this.formatKey(field.key);
            body += `  ${formattedKey}${field.optional ? '?' : ''}: ${field.typeStr};\n`;
        }

        this.declaredInterfaces.set(fingerprint, {
            name: uniqueName,
            properties,
            body,
        });

        return { kind: 'interface', name: uniqueName, fingerprint };
    }

    private formatKey(key: string): string {
        const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
        return isValidIdentifier ? key : JSON.stringify(key);
    }

    mergeTypes(t1: TsType, t2: TsType): TsType {
        if (t1.kind === 'primitive' && t1.name === 'any') return t2;
        if (t2.kind === 'primitive' && t2.name === 'any') return t1;

        if (t1.kind === 'primitive' && t2.kind === 'primitive') {
            if (t1.name === t2.name) return t1;
            return this.makeUnion([t1, t2]);
        }

        if (t1.kind === 'array' && t2.kind === 'array') {
            return {
                kind: 'array',
                elementType: this.mergeTypes(t1.elementType, t2.elementType),
            };
        }

        if (t1.kind === 'interface' && t2.kind === 'interface') {
            const int1 = this.declaredInterfaces.get(t1.fingerprint);
            const int2 = this.declaredInterfaces.get(t2.fingerprint);
            if (!int1 || !int2) return t1;

            if (t1.fingerprint === t2.fingerprint) {
                return t1;
            }

            const mergedProperties = new Map<string, { type: TsType; optional: boolean }>();

            for (const [key, prop] of int1.properties.entries()) {
                mergedProperties.set(key, { type: prop.type, optional: prop.optional });
            }

            for (const [key, prop] of int2.properties.entries()) {
                if (mergedProperties.has(key)) {
                    const existing = mergedProperties.get(key)!;
                    mergedProperties.set(key, {
                        type: this.mergeTypes(existing.type, prop.type),
                        optional: existing.optional || prop.optional,
                    });
                } else {
                    mergedProperties.set(key, { type: prop.type, optional: true });
                }
            }

            for (const key of int1.properties.keys()) {
                if (!int2.properties.has(key)) {
                    mergedProperties.get(key)!.optional = true;
                }
            }

            return this.registerInterface(mergedProperties, int1.name);
        }

        return this.makeUnion([t1, t2]);
    }

    private makeUnion(types: TsType[]): TsType {
        const flatTypes: TsType[] = [];
        for (const t of types) {
            if (t.kind === 'union') {
                flatTypes.push(...t.types);
            } else {
                flatTypes.push(t);
            }
        }

        const unique: TsType[] = [];
        for (const t of flatTypes) {
            if (!unique.some((u) => this.areTypesEqual(u, t))) {
                unique.push(t);
            }
        }

        if (unique.length === 1) return unique[0];
        return { kind: 'union', types: unique };
    }

    private areTypesEqual(t1: TsType, t2: TsType): boolean {
        if (t1.kind !== t2.kind) return false;
        if (t1.kind === 'primitive' && t2.kind === 'primitive') {
            return t1.name === t2.name;
        }
        if (t1.kind === 'array' && t2.kind === 'array') {
            return this.areTypesEqual(t1.elementType, t2.elementType);
        }
        if (t1.kind === 'interface' && t2.kind === 'interface') {
            return t1.fingerprint === t2.fingerprint;
        }
        if (t1.kind === 'union' && t2.kind === 'union') {
            if (t1.types.length !== t2.types.length) return false;
            return t1.types.every((typeVal) =>
                t2.types.some((otherVal) => this.areTypesEqual(typeVal, otherVal))
            );
        }
        return false;
    }

    getTypeString(type: TsType, suggestedName: string = 'RootObject'): string {
        switch (type.kind) {
            case 'primitive':
                return type.name;
            case 'array': {
                const elemStr = this.getTypeString(type.elementType, `${suggestedName}Item`);
                if (type.elementType.kind === 'union') {
                    return `(${elemStr})[]`;
                }
                return `${elemStr}[]`;
            }
            case 'interface':
                return type.name;
            case 'union':
                return type.types.map((t) => this.getTypeString(t, suggestedName)).join(' | ');
        }
    }

    getDeclaredInterfaces() {
        return this.declaredInterfaces;
    }
}

export function jsonToTypeScript(jsonStr: string, rootName: string = 'RootObject'): string {
    if (!jsonStr.trim()) return '';
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (e: any) {
        throw new Error(`Invalid JSON: ${e.message}`);
    }

    const generator = new TsInterfaceGenerator();
    const tsType = generator.inferType(parsed, rootName);

    let output = '';

    const declaredInterfaces = generator.getDeclaredInterfaces();
    
    // We output interfaces in reverse order of definition to put dependencies first, or normal order.
    // Let's output them in insertion order.
    for (const details of declaredInterfaces.values()) {
        output += `export interface ${details.name} {\n${details.body}}\n\n`;
    }

    if (tsType.kind !== 'interface') {
        const rootTypeStr = generator.getTypeString(tsType, rootName);
        output += `export type ${rootName} = ${rootTypeStr};\n`;
    }

    return output.trim();
}
