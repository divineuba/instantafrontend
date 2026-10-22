/** A light client-side email check: enough to catch typos before a round
 * trip. The server's @IsEmail() stays the authority. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your email address";
  if (!EMAIL_PATTERN.test(v)) return "Enter a valid email address, like name@example.com";
  return undefined;
}
