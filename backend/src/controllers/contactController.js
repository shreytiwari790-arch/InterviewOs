import { submitContactMessage } from '../services/contactService.js';

export async function createContactMessage(req, res) {
  await submitContactMessage(req.body);
  res.status(201).json({ message: 'Thanks for reaching out. We will reply to your email soon.' });
}
