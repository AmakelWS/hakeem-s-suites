export const CONTACT_ERROR =
  "Please check the form and try again. If the issue continues, call us directly.";

export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const sanitize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .slice(0, 1200);
