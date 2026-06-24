export type LogLevel = 'info' | 'warn' | 'error';

export function log(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  // Keep logs structured for easy filtering in CI output.
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}
