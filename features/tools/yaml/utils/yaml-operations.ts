import yaml from 'js-yaml';

export function formatYaml(input: string, indent = 2): string {
    const parsed = yaml.load(input);
    return yaml.dump(parsed, { indent, lineWidth: -1 });
}

export function yamlToJson(input: string, pretty = true): string {
    const parsed = yaml.load(input);
    return JSON.stringify(parsed, null, pretty ? 2 : 0);
}

export function jsonToYaml(input: string, indent = 2): string {
    const parsed = JSON.parse(input);
    return yaml.dump(parsed, { indent, lineWidth: -1 });
}

export function validateYaml(input: string): { valid: boolean; error?: string } {
    try {
        yaml.load(input);
        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
