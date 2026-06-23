export interface EnvironmentConfig {
  baseUrl: string;
  username: string;
  password: string;
  lockedUsername: string;
  invalidPassword: string;
  otpCode: string;
}

function readEnv(name: string, fallback = ''): string {
  return process.env[name]?.trim() || fallback;
}

function readFirstEnv(names: string[], fallback = ''): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return fallback;
}

function readUsername(fallback = ''): string {
  const explicit = readFirstEnv(['APP_USERNAME', 'E2E_USERNAME']);
  if (explicit) {
    return explicit;
  }

  const legacy = process.env.USERNAME?.trim();
  // Ignore common Windows account names to avoid accidental credential override.
  if (legacy?.includes('@')) {
    return legacy;
  }

  return fallback;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    baseUrl: readEnv('BASE_URL', 'http://localhost:3000/'),
    username: readUsername('alice@flashguard.local'),
    password: readFirstEnv(['APP_PASSWORD', 'E2E_PASSWORD', 'PASSWORD'], 'offline-demo'),
    lockedUsername: readFirstEnv(
      ['APP_LOCKED_USERNAME', 'E2E_LOCKED_USERNAME', 'LOCKED_USERNAME'],
      'locked.user@example.com',
    ),
    invalidPassword: readFirstEnv(
      ['APP_INVALID_PASSWORD', 'E2E_INVALID_PASSWORD', 'INVALID_PASSWORD'],
      'wrong-password',
    ),
    otpCode: readEnv('OTP_CODE', '123456'),
  };
}
