import { z } from 'zod';
import { CONTACT_TOPICS } from '../models/ContactMessage.js';

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254),
  topic: z.enum(CONTACT_TOPICS).default('general'),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(2000, 'Message is too long'),
  website: z.string().max(200).optional(), // Honeypot: real visitors never see or fill this field.
});
