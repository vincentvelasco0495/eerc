export function nid() {
  return globalThis.crypto?.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEMO_ANSWER_TEXTS = [
  'Drain surface runoff only',
  'Support vertical roof loads',
  'Resist lateral earth pressure',
  'Measure soil compaction in the field',
];

/** Seed question when opening a quiz lesson (demo content). */
export function createDemoQuestion() {
  const answers = DEMO_ANSWER_TEXTS.map((text) => ({ id: nid(), text }));
  return {
    id: nid(),
    collapsed: true,
    questionText: '<p>What is the primary purpose of a retaining wall?</p>',
    questionType: 'single_choice',
    required: false,
    problemImageMaterialPublicId: null,
    problemImagePreviewUrl: null,
    problemImageName: null,
    solutionImageMaterialPublicId: null,
    solutionImagePreviewUrl: null,
    solutionImageName: null,
    answers,
    correctAnswerId: answers[2].id,
    newAnswerDraft: '',
  };
}

/** New row from “+ Question” — empty stem, two answer slots, starts collapsed. */
export function createBlankQuestion() {
  const a1 = nid();
  const a2 = nid();
  return {
    id: nid(),
    collapsed: true,
    questionText: '',
    questionType: 'single_choice',
    required: false,
    problemImageMaterialPublicId: null,
    problemImagePreviewUrl: null,
    problemImageName: null,
    solutionImageMaterialPublicId: null,
    solutionImagePreviewUrl: null,
    solutionImageName: null,
    answers: [
      { id: a1, text: '' },
      { id: a2, text: '' },
    ],
    correctAnswerId: a1,
    newAnswerDraft: '',
  };
}
