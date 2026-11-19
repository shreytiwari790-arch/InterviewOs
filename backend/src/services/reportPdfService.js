import PDFDocument from 'pdfkit';

const COLORS = {
  brand: '#0a9a78',
  ink: '#1f2330',
  muted: '#5b6274',
  line: '#e2e8f0',
  light: '#ecfdf7',
  danger: '#dc2626',
  warning: '#d97706',
};
const CATEGORY_LABELS = {
  resume_project: 'Resume & projects',
  mcq: 'MCQs',
  programming: 'Programming',
  core_cs: 'Core CS',
  scenario: 'Scenarios',
  hr: 'HR & behavioural',
};
const MARGIN = 50;

const scoreColor = (score) => (score >= 75 ? COLORS.brand : score >= 50 ? COLORS.warning : COLORS.danger);

function sectionTitle(doc, text) {
  if (doc.y > doc.page.height - 140) doc.addPage();
  doc.moveDown(1.2).font('Helvetica-Bold').fontSize(13).fillColor(COLORS.ink).text(text);
  doc.moveDown(0.4);
}

function bulletList(doc, items) {
  for (const item of items) {
    doc.font('Helvetica').fontSize(10).fillColor(COLORS.ink).text(`•  ${item}`, { indent: 6, paragraphGap: 3 });
  }
}

function scoreBars(doc, rows) {
  const width = doc.page.width - MARGIN * 2;
  for (const { label, score } of rows) {
    if (doc.y > doc.page.height - 80) doc.addPage();
    const y = doc.y;
    doc.font('Helvetica').fontSize(10).fillColor(COLORS.ink).text(label, MARGIN, y);
    doc.font('Helvetica-Bold').fillColor(scoreColor(score)).text(`${score}%`, MARGIN, y, { width, align: 'right' });
    const barY = y + 15;
    doc.roundedRect(MARGIN, barY, width, 5, 2.5).fill(COLORS.line);
    if (score > 0) doc.roundedRect(MARGIN, barY, (width * score) / 100, 5, 2.5).fill(scoreColor(score));
    doc.y = barY + 14;
  }
}

/** Writes a printable report to `stream` (e.g. the HTTP response). */
export function writeReportPdf(stream, { interview, report, answers, candidateName }) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: MARGIN,
    info: { Title: `InterviewOS report – ${interview.company.name} ${interview.role.name}` },
  });
  doc.pipe(stream);
  const width = doc.page.width - MARGIN * 2;

  // Header band
  doc.rect(0, 0, doc.page.width, 150).fill(COLORS.ink);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#69e0bd').text('interview os  ·  INTERVIEW REPORT', MARGIN, 40);
  doc
    .fontSize(22)
    .fillColor('#ffffff')
    .text(`${interview.company.name} · ${interview.role.name}`, MARGIN, 60, { width: width - 120 });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#cbd5e1')
    .text(
      `${candidateName}  ·  ${new Date(interview.completedAt).toDateString()}  ·  ${answers.length} questions  ·  ${interview.config.difficulty} difficulty`,
      MARGIN,
      95,
      { width: width - 120 },
    );
  doc
    .circle(doc.page.width - MARGIN - 45, 75, 42)
    .lineWidth(6)
    .strokeColor(scoreColor(report.overallScore))
    .stroke();
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor('#ffffff')
    .text(`${report.overallScore}%`, doc.page.width - MARGIN - 87, 66, { width: 84, align: 'center' });

  doc.y = 175;
  doc.font('Helvetica').fontSize(11).fillColor(COLORS.ink).text(report.summary, MARGIN, doc.y, { width, lineGap: 3 });

  sectionTitle(doc, 'Category performance');
  scoreBars(
    doc,
    report.categoryScores.map(({ category, score }) => ({ label: CATEGORY_LABELS[category] ?? category, score })),
  );

  sectionTitle(doc, 'Topic performance');
  scoreBars(
    doc,
    [...report.topicScores].sort((a, b) => b.score - a.score).map(({ topic, score }) => ({ label: topic, score })),
  );

  sectionTitle(doc, 'Strengths');
  bulletList(doc, report.strengths.length ? report.strengths : ['Keep practising to build clear strengths.']);
  sectionTitle(doc, 'Weak topics');
  bulletList(doc, report.weakTopics.length ? report.weakTopics : ['No weak topics identified.']);
  sectionTitle(doc, 'What to prepare next');
  bulletList(doc, report.recommendations);

  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLORS.ink).text('Answer review');
  doc.moveDown(0.6);

  answers.forEach((answer, index) => {
    if (doc.y > doc.page.height - 160) doc.addPage();
    doc
      .moveTo(MARGIN, doc.y)
      .lineTo(MARGIN + width, doc.y)
      .strokeColor(COLORS.line)
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.6);
    const top = doc.y;
    doc
      .font('Helvetica-Bold')
      .fontSize(10.5)
      .fillColor(COLORS.ink)
      .text(`${index + 1}. ${answer.prompt}`, MARGIN, top, { width: width - 60 });
    doc
      .font('Helvetica-Bold')
      .fillColor(scoreColor(answer.maxScore ? (answer.score / answer.maxScore) * 100 : 0))
      .text(`${answer.score}/${answer.maxScore}`, MARGIN, top, { width, align: 'right' });
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .text(`${CATEGORY_LABELS[answer.category]} · ${answer.topic}`, MARGIN);
    doc.moveDown(0.3);

    const isChoice = answer.type === 'single_choice' || answer.type === 'multi_select';
    const optionText = (ids) =>
      answer.options
        .filter((o) => ids.includes(o.id))
        .map((o) => o.text)
        .join(', ') || '—';
    const lines = isChoice
      ? [
          ['Your answer', optionText(answer.selectedOptionIds)],
          ['Correct answer', optionText(answer.correctOptionIds)],
        ]
      : [
          ['Your answer', answer.answerText?.trim() || 'No answer submitted'],
          ['Feedback', answer.feedback],
          ['Model answer', answer.modelAnswer],
        ];
    if (answer.explanation) lines.push(['Explanation', answer.explanation]);

    for (const [label, value] of lines) {
      if (!value) continue;
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(COLORS.ink)
        .text(`${label}: `, MARGIN, doc.y, { continued: true, width });
      doc.font('Helvetica').fillColor(COLORS.ink).text(String(value).slice(0, 1500), { width, lineGap: 1.5 });
    }
    doc.moveDown(0.6);
  });

  doc
    .moveDown(1)
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      'Practice feedback generated by InterviewOS. Company profiles are preparation guides, not official interview patterns. This report is not a hiring decision.',
      MARGIN,
      doc.y,
      { width, align: 'center' },
    );
  doc.end();
}
