/**
 * Outgoing email is not configured yet. Reset links are written to the server
 * log so the flow can be used in development. To add real email later, replace
 * the body of this function with a provider call (Nodemailer, Resend, etc.).
 */
export async function sendPasswordResetLink({ to, name, resetUrl }) {
  console.info(`[mail] Password reset requested for ${name} <${to}>`);
  console.info(`[mail] Reset link (valid 30 minutes): ${resetUrl}`);
}
