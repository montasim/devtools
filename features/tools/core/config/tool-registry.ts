import type { ToolDefinition } from '../types/tool';

const registry: Map<string, ToolDefinition> = new Map();

export function registerTool(definition: ToolDefinition) {
    registry.set(definition.pageName, definition);
}

export function getToolDefinition(pageName: string): ToolDefinition | undefined {
    return registry.get(pageName);
}

export function getAllTools(): ToolDefinition[] {
    return Array.from(registry.values());
}

export { type ToolDefinition };
