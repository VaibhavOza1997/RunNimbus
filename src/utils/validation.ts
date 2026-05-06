/** Input validation utilities. All user input must be validated through here. */

const DANGEROUS_CHARS = /[<>"'`\\;{}()]/g;
const MAX_CHALLENGE_INPUT = 2048;
const MAX_USERNAME = 32;

export function sanitizeChallengeInput(input: string): string {
  return input.replace(DANGEROUS_CHARS, '').slice(0, MAX_CHALLENGE_INPUT);
}

export function validateUsername(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) return { valid: false, error: 'Name is required' };
  if (name.length > MAX_USERNAME) return { valid: false, error: `Max ${MAX_USERNAME} characters` };
  if (!/^[a-zA-Z0-9 _-]+$/.test(name)) return { valid: false, error: 'Letters, numbers, spaces, _ and - only' };
  return { valid: true };
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
