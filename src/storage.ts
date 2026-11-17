/**
 * Флаг в localStorage. Хранилища может не быть (песочница, приватный режим,
 * сервер) — тогда флаг сброшен и не запоминается
 */
export function readFlag (key: string): boolean {
  try {
    return globalThis.localStorage?.getItem(key) === '1';
  } catch (error) {
    return false;
  }
}

export function writeFlag (key: string, value: boolean) {
  try {
    globalThis.localStorage?.setItem(key, value ? '1' : '0');
  } catch (error) {
    // не запомним — не страшно
  }
}
