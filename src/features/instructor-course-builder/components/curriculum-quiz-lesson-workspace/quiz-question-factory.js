export function nid() {
  return globalThis.crypto?.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEMO_ANSWER_TEXTS = [
  'Computer Processing Unit',
  'Central Peripheral Unit',
  'Central Processing Unit',
  'Computer Processing User',
];

/** Seed question when opening a quiz lesson (demo content). */
export function createDemoQuestion() {
  const answers = DEMO_ANSWER_TEXTS.map((text) => ({ id: nid(), text }));
  return {
    id: nid(),
    collapsed: true,
    questionText: '<p>What does CPU stand for?</p>',
    questionType: 'single_choice',
    required: false,
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
    answers: [
      { id: a1, text: '' },
      { id: a2, text: '' },
    ],
    correctAnswerId: a1,
    newAnswerDraft: '',
  };
}
