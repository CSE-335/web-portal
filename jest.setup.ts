import enMessages from './src/messages/en.json';
import type { ReactNode } from 'react';
import * as webStreams from 'node:stream/web';

type MessageTree = Record<string, unknown>;

function lookupValue(path: string, obj: MessageTree): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function lookupMessage(path: string, obj: MessageTree): string | undefined {
  const value = lookupValue(path, obj);
  return typeof value === 'string' ? value : undefined;
}

const messages = enMessages as MessageTree;

const runtimeGlobal = globalThis as Record<string, unknown>;
if (!runtimeGlobal.ReadableStream) {
  runtimeGlobal.ReadableStream = webStreams.ReadableStream;
}
if (!runtimeGlobal.TransformStream) {
  runtimeGlobal.TransformStream = webStreams.TransformStream;
}
if (!runtimeGlobal.WritableStream) {
  runtimeGlobal.WritableStream = webStreams.WritableStream;
}

function createTranslator(namespace?: string) {
  const t = ((key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return lookupMessage(fullKey, messages) ?? fullKey;
  }) as ((key: string) => string) & {
    has: (key: string) => boolean;
    raw: (key: string) => unknown;
    rich: (key: string) => string;
    markup: (key: string) => string;
  };

  t.has = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return lookupValue(fullKey, messages) !== undefined;
  };

  t.raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return lookupValue(fullKey, messages);
  };

  t.rich = (key: string) => t(key);
  t.markup = (key: string) => t(key);

  return t;
}

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
  useTranslations: (namespace?: string) => createTranslator(namespace),
}));

jest.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
  getMessages: async () => messages,
}));
