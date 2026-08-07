// ─── Password Strength Validation ───
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "qwerty123",
  "abc12345", "letmein", "admin123", "welcome1", "monkey123",
  "dragon123", "master123", "login123", "princess1", "football1",
  "shadow123", "sunshine1", "trustno1", "iloveyou1", "batman123",
  "access123", "hello123", "charlie1", "donald123", "password1!",
]);

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain a lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain an uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain a number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain a special character");
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("This password is too common. Choose a stronger one.");
  }

  // Check for repeating characters (e.g., "aaa", "111")
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password contains too many repeated characters");
  }

  // Check for sequential characters (4+ in a row)
  const lower = password.toLowerCase();
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl"];
  for (const seq of sequences) {
    for (let i = 0; i <= lower.length - 4; i++) {
      const chunk = lower.substring(i, i + 4);
      if (seq.includes(chunk)) {
        errors.push("Password contains sequential characters");
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  // RFC-compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}
