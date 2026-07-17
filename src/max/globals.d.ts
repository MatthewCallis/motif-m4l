declare let inlets: number;
declare let outlets: number;

declare function outlet(index: number, ...values: unknown[]): void;
declare function post(...values: unknown[]): void;
declare function error(...values: unknown[]): void;

declare class LiveAPI {
  constructor(callback?: (args: unknown[]) => void, path?: string);
  property: string;
  valid: number;
  id: number;
  path: string;
  get(property: string): number | number[];
  getstring(property: string): string | string[];
}

declare class Folder {
  constructor(pathname: string);
  end: boolean;
  count: number;
  pathname: string;
  filename: string;
  extension: string;
  next(): void;
  close(): void;
}

declare class File {
  constructor(filename: string, access?: 'read' | 'write' | 'readwrite', typelist?: string);
  isopen: boolean;
  eof: number;
  readstring(count: number): string;
  close(): void;
}
