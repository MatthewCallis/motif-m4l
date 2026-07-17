declare let inlets: number;
declare let outlets: number;

declare function outlet(index: number, ...values: unknown[]): void;
declare function post(...values: unknown[]): void;
declare function error(...values: unknown[]): void;

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


declare const mgraphics: {
  init(): void;
  relative_coords: number;
  autofill: number;
  size: [number, number];
  redraw(): void;
  set_source_rgba(red: number, green: number, blue: number, alpha: number): void;
  set_line_width(width: number): void;
  move_to(x: number, y: number): void;
  line_to(x: number, y: number): void;
  stroke(): void;
  rectangle(x: number, y: number, width: number, height: number): void;
  ellipse(x: number, y: number, width: number, height: number): void;
  fill(): void;
  fill_preserve(): void;
};
