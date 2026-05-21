type Meta = Record<string, unknown> | undefined;

function fmt(message: string, meta: Meta): string {
  if (!meta) return message;
  try {
    return `${message} ${JSON.stringify(meta)}`;
  } catch {
    return message;
  }
}

export const logger = {
  info(message: string, meta?: Meta): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console -- dev-only routing of info logs
      console.log(fmt(message, meta));
    }
  },
  warn(message: string, meta?: Meta): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console -- dev-only routing of warn logs
      console.warn(fmt(message, meta));
    }
    // TODO: Sentry.captureMessage in production
  },
  error(message: string, error?: unknown, meta?: Meta): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console -- dev-only routing of error logs
      console.error(fmt(message, meta), error);
    }
    // TODO: Sentry.captureException in production
  },
};
