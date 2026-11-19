export const categoryLabels = {
  resume_project: 'Resume & projects',
  mcq: 'MCQs',
  programming: 'Programming',
  core_cs: 'Core CS',
  scenario: 'Scenarios',
  hr: 'HR & behavioural',
};

export const typeLabels = {
  single_choice: 'Single choice',
  multi_select: 'Multiple select',
  short_answer: 'Short answer',
  long_answer: 'Detailed answer',
};

export const difficultyLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
export const difficultyTones = { easy: 'success', medium: 'warning', hard: 'danger' };

export const experienceLabels = {
  fresher: 'Fresher',
  junior: 'Junior (0–2 yrs)',
  mid: 'Mid (2–5 yrs)',
  senior: 'Senior (5+ yrs)',
};

export const interviewStatusLabels = {
  generating: { label: 'Preparing', tone: 'brand' },
  ready: { label: 'Ready to start', tone: 'brand' },
  in_progress: { label: 'In progress', tone: 'warning' },
  evaluating: { label: 'Evaluating', tone: 'brand' },
  completed: { label: 'Completed', tone: 'success' },
  failed: { label: 'Needs retry', tone: 'danger' },
};

export function scoreVerdict(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Needs practice';
}

export const integrityEventLabels = {
  fullscreen_entered: 'Entered fullscreen',
  fullscreen_exited: 'Left fullscreen',
  tab_hidden: 'Switched tab / minimised',
  tab_visible: 'Returned to tab',
  window_blurred: 'Window lost focus',
  window_focused: 'Window regained focus',
  went_offline: 'Went offline',
  came_online: 'Back online',
  camera_permission_granted: 'Camera permission granted',
  camera_permission_denied: 'Camera permission denied',
  microphone_permission_granted: 'Microphone permission granted',
  microphone_permission_denied: 'Microphone permission denied',
};
