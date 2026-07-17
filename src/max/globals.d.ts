declare let inlets: number;
declare let outlets: number;

declare function outlet(index: number, ...values: unknown[]): void;
declare function post(...values: unknown[]): void;
declare function error(...values: unknown[]): void;

declare class LiveAPI {
  constructor(callback?: (args: unknown[]) => void, path?: string);
  property: string;
  valid: number;
  get(property: string): number | number[];
  getstring(property: string): string | string[];
}
