const DEFAULT_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60
const DEFAULT_IDLE_TIMEOUT_SECONDS = 30 * 60
const DEFAULT_IDLE_WARNING_SECONDS = 60

function parsePositiveInteger(value: string | undefined, fallbackValue: number) {
  const parsedValue = Number.parseInt(value ?? "", 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallbackValue
  }

  return parsedValue
}

export type AuthSessionConfig = {
  sessionMaxAgeSeconds: number
  idleTimeoutSeconds: number
  idleWarningSeconds: number
}

export function resolveAuthSessionConfig(env: NodeJS.ProcessEnv = process.env): AuthSessionConfig {
  const sessionMaxAgeSeconds = parsePositiveInteger(
    env.NEXTAUTH_SESSION_MAX_AGE_SECONDS,
    DEFAULT_SESSION_MAX_AGE_SECONDS,
  )

  const idleTimeoutSeconds = Math.min(
    parsePositiveInteger(env.NEXTAUTH_IDLE_TIMEOUT_SECONDS, DEFAULT_IDLE_TIMEOUT_SECONDS),
    sessionMaxAgeSeconds,
  )

  const idleWarningSeconds = Math.min(
    parsePositiveInteger(env.NEXTAUTH_IDLE_WARNING_SECONDS, DEFAULT_IDLE_WARNING_SECONDS),
    Math.max(idleTimeoutSeconds - 1, 1),
  )

  return {
    sessionMaxAgeSeconds,
    idleTimeoutSeconds,
    idleWarningSeconds,
  }
}