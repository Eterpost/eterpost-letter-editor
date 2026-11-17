declare module 'pretty' {
  export default function pretty (html: string): string;
}

declare module 'pell' {
  const pell: {
    exec (command: string, value?: unknown): boolean;
    init (config: unknown): { content: HTMLElement };
  };
  export default pell;
}
