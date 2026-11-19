import { ContactMessage } from '../models/ContactMessage.js';

/** Stores a contact message. Submissions that fill the hidden honeypot field are silently dropped. */
export async function submitContactMessage({ website, ...message }) {
  if (website) return;
  await ContactMessage.create(message);
}
