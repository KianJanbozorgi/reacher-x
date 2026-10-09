export function isPrivateUser(email: string | null | undefined, allowedEmails: string | undefined): boolean {
  if (!email) return false;
  const allowed = (allowedEmails ?? "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
