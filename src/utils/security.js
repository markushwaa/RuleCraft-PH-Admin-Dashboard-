// Control characters are deliberately removed from administrator-supplied plain text.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizePlainText(value, maximumLength = 2000) {
  return String(value ?? "")
    .replace(CONTROL_CHARACTERS, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maximumLength);
}

export function sanitizeEmail(value) {
  return sanitizePlainText(value, 254).toLowerCase();
}

export function sanitizeHttpsUrl(value) {
  const clean = sanitizePlainText(value, 2048);
  if (!clean) return "";
  let parsed;
  try {
    parsed = new URL(clean);
  } catch {
    throw new Error("Enter a valid HTTPS URL.");
  }
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS URLs are allowed.");
  return parsed.toString();
}

export function sanitizeFormValues(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (typeof value !== "string") return [key, value];
    if (/(url|source)$/i.test(key)) return [key, sanitizeHttpsUrl(value)];
    const maximum = /description|meaning|explanation|message|notes|question/i.test(key)
      ? 5000
      : 500;
    return [key, sanitizePlainText(value, maximum)];
  }));
}

export function validateUpload(file, { maximumBytes, allowedMimeTypes }) {
  if (!file) return;
  if (file.size <= 0 || file.size > maximumBytes)
    throw new Error(`File size must be between 1 byte and ${Math.floor(maximumBytes / 1048576)} MB.`);
  if (!allowedMimeTypes.has(file.type)) throw new Error("This file type is not allowed.");
}

export function validateStrongPassword(password) {
  if (typeof password !== "string" || password.length < 12)
    return "Password must contain at least 12 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password))
    return "Use uppercase, lowercase, number, and symbol characters.";
  if (/\s/.test(password)) return "Password cannot contain spaces.";
  return "";
}
