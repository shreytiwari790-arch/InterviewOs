// Deterministic stand-in for OpenAI used by tests and local end-to-end runs.
// It produces schema-valid output for each prompt the backend sends.

function parsePlan(userText) {
  const match = userText.match(/Category plan \(follow exactly\):\n(\[[\s\S]*?\n\])/);
  return match ? JSON.parse(match[1]) : [];
}

function fakeQuestion(category, index) {
  const shared = {
    category,
    topic: {
      mcq: 'DBMS',
      programming: 'Complexity',
      core_cs: 'Operating systems',
      resume_project: 'Your projects',
      scenario: 'Debugging',
      hr: 'Teamwork',
    }[category],
    difficulty: 'medium',
    codeSnippet: null,
    codeLanguage: null,
    modelAnswer: 'A reference answer covering the key ideas.',
    explanation: 'This is why the answer is correct.',
    expectedKeyConcepts: ['concept one', 'concept two'],
    rubric: [{ criterion: 'Accuracy', description: 'States the right idea' }],
    followUpQuestions: ['Can you give an example?'],
  };
  if (category === 'mcq') {
    return {
      ...shared,
      type: 'single_choice',
      prompt: `Which normal form removes transitive dependencies? (${index + 1})`,
      options: [
        { id: 'a', text: '2NF' },
        { id: 'b', text: '3NF' },
        { id: 'c', text: 'BCNF' },
        { id: 'd', text: '1NF' },
      ],
      correctOptionIds: ['b'],
    };
  }
  if (category === 'programming') {
    return {
      ...shared,
      type: 'multi_select',
      prompt: `Which of these operations are O(log n) on a balanced BST? (${index + 1})`,
      codeSnippet: 'tree.search(key)',
      codeLanguage: 'javascript',
      options: [
        { id: 'a', text: 'Search' },
        { id: 'b', text: 'In-order traversal' },
        { id: 'c', text: 'Insert' },
        { id: 'd', text: 'Printing all keys' },
      ],
      correctOptionIds: ['a', 'c'],
    };
  }
  return {
    ...shared,
    type: 'short_answer',
    prompt: `Explain ${shared.topic.toLowerCase()} in your own words. (${index + 1})`,
    options: [],
    correctOptionIds: [],
  };
}

export function fakeAiResponse(schemaName, userText) {
  if (schemaName === 'resume_analysis') {
    return {
      isResume: !/not a resume/i.test(userText),
      summary: 'Final-year computer science student who builds full-stack JavaScript applications.',
      estimatedExperienceLevel: 'fresher',
      technicalSkills: ['REST APIs', 'Data Structures'],
      programmingLanguages: ['JavaScript', 'Java'],
      frameworks: ['React', 'Express'],
      tools: ['MongoDB', 'Git'],
      projects: [
        {
          name: 'ShopKart',
          description: 'MERN e-commerce store with JWT auth',
          technologies: ['React', 'Node.js', 'MongoDB'],
        },
      ],
      education: [
        {
          institution: 'ABC Institute of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          graduationYear: '2026',
          score: '8.4 CGPA',
        },
      ],
      experience: [
        {
          organization: 'Startup Labs',
          role: 'Web Development Intern',
          duration: '3 months',
          highlights: ['Built dashboard pages'],
        },
      ],
      suggestedFocusAreas: [
        { topic: 'Database indexing', reason: 'Your projects use MongoDB heavily.' },
        { topic: 'JWT security', reason: 'You implemented authentication.' },
      ],
    };
  }
  if (schemaName === 'mock_interview') {
    return {
      questions: parsePlan(userText).flatMap(({ category, count }) =>
        Array.from({ length: count }, (_, i) => fakeQuestion(category, i)),
      ),
    };
  }
  if (schemaName === 'answer_evaluation') {
    const ids = [...userText.matchAll(/<item id="([^"]+)">/g)].map((m) => m[1]);
    return {
      evaluations: ids.map((questionId) => ({
        questionId,
        correctness: 8,
        relevance: 9,
        completeness: 6,
        clarity: 8,
        feedback: 'Clear explanation. Add a concrete example to make it complete.',
        missedConcepts: ['concept two'],
      })),
    };
  }
  if (schemaName === 'interview_report') {
    return {
      summary:
        'You showed solid fundamentals and explained ideas clearly. Multi-select questions and completeness are the main areas to improve.',
      strengths: ['Clear written explanations', 'Database normalisation'],
      weakTopics: ['Complexity'],
      recommendations: [
        'Practise identifying all correct options in multi-select questions',
        'Add examples to written answers',
      ],
    };
  }
  throw new Error(`fakeAi: unknown schema ${schemaName}`);
}
