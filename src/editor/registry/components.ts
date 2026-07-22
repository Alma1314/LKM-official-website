import type { MdxComponentDefinition } from './types';

const registry = new Map<string, MdxComponentDefinition<Record<string, unknown>>>();

export function registerComponent(def: MdxComponentDefinition<Record<string, unknown>>): void {
  if (registry.has(def.name)) {
    console.warn(`Component "${def.name}" is already registered — overwriting.`);
  }
  registry.set(def.name, def);
}

export function getComponent(name: string): MdxComponentDefinition<Record<string, unknown>> | undefined {
  return registry.get(name);
}

export function getRegisteredNames(): string[] {
  return Array.from(registry.keys());
}

export function isRegistered(name: string): boolean {
  return registry.has(name);
}

export function clearRegistry(): void {
  registry.clear();
}
