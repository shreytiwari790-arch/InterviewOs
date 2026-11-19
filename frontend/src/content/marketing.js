// Marketing copy for the public website. Edit this file to change plans, FAQs or reviews
// without touching any page layout code.

export const companies = ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys', 'Deloitte', 'Accenture'];

/** Sample questions shown in the hero card, one per question category. */
export const sampleQuestions = [
  {
    category: 'Resume',
    question: 'Your resume mentions a MERN e-commerce project. How did you handle authentication and why?',
  },
  {
    category: 'MCQ',
    question: 'Which normal form removes transitive dependencies between non-key attributes?',
    options: ['2NF', '3NF', 'BCNF', '4NF'],
  },
  {
    category: 'Programming',
    question: 'What is the time complexity of searching a balanced binary search tree, and why?',
  },
  {
    category: 'Core CS',
    question: 'Explain the difference between a process and a thread. When would you choose one over the other?',
  },
  {
    category: 'Scenario',
    question: 'Your API slows down sharply at peak traffic. Walk us through how you would investigate it.',
  },
  {
    category: 'HR',
    question: 'Describe a project that did not go as planned. What did you do and what did you learn?',
  },
];

export const faqs = [
  {
    question: 'How are the interview questions generated?',
    answer:
      'We combine your resume profile with the preparation profile of the company and role you pick. AI then writes a fresh set of questions that follows that profile’s mix of categories, topics and difficulty.',
  },
  {
    question: 'Are these the official interview patterns of each company?',
    answer:
      'No. Company profiles are preparation guides built from publicly available information. They help you practise the right material, but companies change their processes and we do not claim to have official question papers.',
  },
  {
    question: 'Is there live coding or a voice interview?',
    answer:
      'Not yet. Interviews are text-based and include MCQs, code output prediction, debugging and written answers. Live coding and voice interviews are planned for a future version.',
  },
  {
    question: 'How is my answer scored?',
    answer:
      'Multiple-choice answers are checked exactly. Written answers are evaluated against a rubric for correctness, relevance, completeness and clarity, and every answer comes with feedback you can act on.',
  },
  {
    question: 'What happens to my resume?',
    answer:
      'We extract the text to personalise your questions and store the analysis in your account. You can delete your resume at any time, and we never share it with employers.',
  },
];

/**
 * Features planned for InterviewOS Pro. Pro is not built yet: it is shown as "coming soon"
 * on the pricing page and the dashboard, and candidates can join a waitlist.
 */
export const proFeatures = [
  {
    title: 'A fresh interview every day',
    text: 'A new daily mock interview, built around your resume and target company.',
  },
  {
    title: 'Important topics for each company',
    text: 'The topics each company and role focuses on most, in one place.',
  },
  { title: 'Unlimited mock interviews', text: 'Practise as often as you like, for every company and role track.' },
  { title: 'Weekly study plan', text: 'A plan built from your weakest topics and sections, updated every week.' },
];

/**
 * Pricing plans. Payments are not connected yet: Starter is everything available today,
 * Pro is coming soon (waitlist), and the institution plan leads to the contact form.
 */
export const pricingPlans = [
  {
    name: 'Starter',
    price: '₹0',
    period: 'free in early access',
    description: 'Everything InterviewOS offers today, free while we are in early access.',
    features: [
      'Resume analysis, including scanned PDFs',
      'Mock interviews for every company and role',
      'MCQ, coding, core CS, scenario and HR questions',
      'Answer-by-answer feedback',
      'Detailed report with PDF download',
    ],
    cta: 'Try for free',
    href: '/register',
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'per month at launch',
    badge: 'Coming soon',
    description: 'For candidates preparing every day for their target companies.',
    features: ['Everything in Starter', ...proFeatures.map(({ title }) => title), 'Progress tracking across companies'],
    cta: 'Join the waitlist',
    href: 'pro-waitlist',
    isFeatured: true,
  },
  {
    name: 'Institutions',
    price: 'Custom',
    period: 'for colleges & teams',
    description: 'For placement cells and training teams preparing many candidates.',
    features: ['Bulk candidate accounts', 'Cohort performance overview', 'Custom company profiles', 'Priority support'],
    cta: 'Contact us',
    href: '#contact',
  },
];

/**
 * Real reviews from real users only. The reviews section stays hidden until this list has entries.
 * Example entry: { name: 'Full name', role: 'Placed at …', quote: '…' }
 */
export const testimonials = [];
