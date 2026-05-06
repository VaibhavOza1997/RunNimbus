import { isProd } from '@/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (isProd && level !== 'error') return;

  const prefix = `[${level.toUpperCase()}]`;
  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.log(prefix, message, ...args);
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.info(prefix, message, ...args);
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(prefix, message, ...args);
      break;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(prefix, message, ...args);
      // TODO: [MONITORING] route to Sentry in production
      break;
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};
