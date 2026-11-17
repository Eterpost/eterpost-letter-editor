/**
 * Флаг в localStorage. Хранилища может не быть (песочница, приватный режим,
 * сервер) — тогда флаг сброшен и не запоминается
 */
export declare function readFlag(key: string): boolean;
export declare function writeFlag(key: string, value: boolean): void;
