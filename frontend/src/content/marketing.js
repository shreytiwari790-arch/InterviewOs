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
 * Pricing plans. Payments are not connected yet: paid plans currently lead to sign-up,
 * and the institution plan leads to the contact form. Update prices and limits here.
 */
export const pricingPlans = [
  {
    name: 'Starter',
    price: '₹0',
    period: 'forever',
    description: 'Try InterviewOS and get a feel for company-style interviews.',
    features: [
      '2 full mock interviews per month',
      'Resume analysis',
      'MCQ and resume-based questions',
      'Score and summary report',
    ],
    cta: 'Try for free',
    href: '/register',
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    description: 'For candidates preparing seriously for upcoming interviews.',
    features: [
      '30 full mock interviews per month',
      'All six question categories',
      'Every company and role track',
      'Detailed reports with PDF download',
      'Answer-by-answer feedback',
      'Optional integrity mode',
    ],
    cta: 'Start with Pro',
    href: '/register',
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
