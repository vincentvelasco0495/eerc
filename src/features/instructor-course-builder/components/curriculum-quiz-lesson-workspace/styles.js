/** Quiz builder workspace — reference layout tokens */

export const quizColors = {
  pageBg: '#f6f8fb',
  border: '#e5e7eb',
  muted: '#6b7280',
  text: '#1f2937',
  primaryBlue: '#2563eb',
  primaryBlueHover: '#1d4ed8',
  success: '#16a34a',
  successHover: '#15803d',
};

export const styles = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    bgcolor: quizColors.pageBg,
    p: { xs: 2, sm: 2.5 },
    boxSizing: 'border-box',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    px: 2.5,
    py: 2,
    bgcolor: '#fff',
    borderBottom: `1px solid ${quizColors.border}`,
    borderRadius: '10px 10px 0 0',
    flexShrink: 0,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    minWidth: 0,
    flex: 1,
  },

  headerQuizBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
    px: 1.25,
    py: 0.5,
    borderRadius: '999px',
    bgcolor: '#f3f4f6',
    border: `1px solid ${quizColors.border}`,
  },

  headerQuizIconWrap: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#fff',
    border: `1px solid ${quizColors.border}`,
    color: quizColors.muted,
  },

  headerQuizBadgeLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: quizColors.text,
    letterSpacing: '0.02em',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: quizColors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  headerTitleField: {
    flex: 1,
    minWidth: 120,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 2,
      fontSize: 15,
      fontWeight: 600,
    },
    '& .MuiOutlinedInput-input': {
      py: 1,
      fontWeight: 600,
    },
  },

  saveBtn: {
    textTransform: 'none',
    fontWeight: 600,
    px: 2.5,
    py: 1,
    borderRadius: '999px',
    fontSize: 14,
  },

  tabsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    flexWrap: 'wrap',
    mt: 0,
    pt: 2,
    pb: 2,
    flexShrink: 0,
  },

  tabsWrap: {
    display: 'flex',
    gap: '4px',
    p: '4px',
    bgcolor: '#e8eaed',
    borderRadius: '10px',
  },

  tabBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 14,
    px: 2.25,
    py: 1.125,
    borderRadius: '8px',
    color: quizColors.muted,
    border: 'none',
    bgcolor: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  tabBtnIdle: {
    bgcolor: '#e5e7eb',
    color: quizColors.muted,
    '&:hover': {
      color: quizColors.text,
      bgcolor: '#dfe3e8',
    },
  },

  tabBtnActive: {
    bgcolor: '#fff',
    color: quizColors.text,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    '&:hover': {
      bgcolor: '#fff',
      color: quizColors.text,
    },
  },

  tabLabelRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
  },

  tabCountBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    height: 22,
    px: 0.75,
    borderRadius: '999px',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  },

  tabCountBadgeActive: {
    bgcolor: '#4b5563',
    color: '#fff',
  },

  tabCountBadgeIdle: {
    bgcolor: '#d1d5db',
    color: '#374151',
  },

  tabActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
  },

  listIconBtn: {
    width: 40,
    height: 40,
    border: `1px solid ${quizColors.border}`,
    borderRadius: '8px',
    bgcolor: '#fff',
    color: quizColors.primaryBlue,
  },

  libraryBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 14,
    px: 2,
    py: 1,
    borderRadius: '8px',
    borderColor: quizColors.primaryBlue,
    color: quizColors.primaryBlue,
  },

  mainColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minHeight: 0,
    overflow: 'auto',
    pb: 2,
  },

  card: {
    bgcolor: '#fff',
    border: `1px solid ${quizColors.border}`,
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },

  cardActionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.75,
    px: 2,
    pt: 1.5,
    pb: 0,
  },

  cardChromeInline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.75,
    flexShrink: 0,
  },

  questionCollapsedBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    px: 2,
    py: 1.5,
    bgcolor: '#f3f4f6',
    borderBottom: `1px solid ${quizColors.border}`,
  },

  collapsedBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    minWidth: 0,
    flex: 1,
  },

  collapsedQuestionText: {
    fontSize: 15,
    fontWeight: 600,
    color: quizColors.text,
    minWidth: 0,
    flex: 1,
  },

  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: '8px',
    bgcolor: '#dc2626',
    color: '#fff',
    '&:hover': { bgcolor: '#b91c1c' },
  },

  cardChromeBtn: {
    width: 36,
    height: 36,
    borderRadius: '8px',
    border: `1px solid ${quizColors.border}`,
    bgcolor: '#fff',
    color: quizColors.muted,
    '&:hover': { bgcolor: '#f9fafb', color: quizColors.text },
  },

  stemLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: quizColors.text,
    mb: 1,
  },

  editorTop: {
    display: 'flex',
    gap: 2,
    p: 2.5,
    alignItems: 'flex-start',
  },

  imageTile: {
    width: 52,
    height: 52,
    flexShrink: 0,
    border: `1px solid ${quizColors.border}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#f9fafb',
    color: quizColors.muted,
    cursor: 'pointer',
  },

  editorMain: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  settingsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    px: 2.5,
    py: 2,
    borderTop: `1px solid ${quizColors.border}`,
  },

  answersSection: {
    bgcolor: '#fff',
    border: `1px solid ${quizColors.border}`,
    borderRadius: '10px',
    p: 2.5,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },

  answersInCard: {
    borderTop: `1px solid ${quizColors.border}`,
    pt: 2.5,
    px: 2.5,
    pb: 2.5,
    bgcolor: '#fff',
  },

  answersHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },

  answersTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: quizColors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  answersTools: {
    display: 'flex',
    gap: 0.5,
  },

  answerToolBtn: {
    width: 32,
    height: 32,
    color: quizColors.muted,
  },

  answerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  answerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    minHeight: 52,
    px: 2,
    py: 1,
    border: `1px solid ${quizColors.border}`,
    borderRadius: '8px',
    bgcolor: '#fff',
    boxSizing: 'border-box',
  },

  dragHandle: {
    color: quizColors.muted,
    cursor: 'grab',
    display: 'flex',
    p: 0.5,
  },

  answerInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputBase-input': {
      py: 0.75,
    },
  },

  answerCorrect: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
    minWidth: 120,
    justifyContent: 'flex-end',
  },

  correctLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: quizColors.muted,
  },

  addAnswerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 1.5,
    px: 2,
    py: 1.25,
    border: `1px solid ${quizColors.border}`,
    borderRadius: '8px',
    bgcolor: '#f9fafb',
  },

  addAnswerBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 14,
    px: 2,
    borderRadius: '8px',
  },

  addAnswerPlusBtn: {
    width: 40,
    height: 40,
    minWidth: 40,
    p: 0,
    borderRadius: '8px',
    bgcolor: quizColors.primaryBlue,
    color: '#fff',
    '&:hover': { bgcolor: quizColors.primaryBlueHover },
  },

  footer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: 2,
    pt: 3,
    mt: 'auto',
    flexShrink: 0,
  },

  footerCenter: {
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
    flexWrap: 'wrap',
  },

  footerBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 14,
    px: 2.5,
    py: 1.125,
    borderRadius: '999px',
  },

  footerEnd: {
    justifySelf: 'end',
  },

  placeholderPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4,
    bgcolor: '#fff',
    border: `1px solid ${quizColors.border}`,
    borderRadius: '10px',
    minHeight: 280,
  },

  /** Quiz → Settings tab (MasterStudy-style form) */
  quizSettingsRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'auto',
  },

  quizSettingsCard: {
    bgcolor: '#fff',
    border: `1px solid ${quizColors.border}`,
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    p: { xs: 2, sm: 2.5, md: 3 },
    maxWidth: 960,
    width: '100%',
    mx: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    boxSizing: 'border-box',
  },

  quizSettingsFieldLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: quizColors.text,
    display: 'block',
    mb: 0.75,
  },

  quizSettingsTextArea: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      alignItems: 'flex-start',
    },
  },

  quizSettingsNumberInput: {
    borderRadius: '8px',
  },

  quizSettingsSelect: {
    borderRadius: '8px',
  },

  quizSettingsToggleGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    columnGap: 3,
    rowGap: 0,
    my: 2,
    px: { xs: 0, sm: 0 },
  },

  quizSettingsToggleCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },

  quizSettingsSwitchRow: {
    m: 0,
    mr: 'auto!important',
    alignItems: 'center',
    '& .MuiFormControlLabel-label': {
      fontSize: 14,
      fontWeight: 500,
      color: quizColors.text,
    },
  },

  quizSettingsSaveRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    pt: 2.5,
    mt: 1,
  },

  quizSettingsFooterSaveBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 15,
    px: 4,
    py: 1.25,
    borderRadius: 1,
    bgcolor: quizColors.primaryBlue,
    '&:hover': {
      bgcolor: quizColors.primaryBlueHover,
    },
  },
};
