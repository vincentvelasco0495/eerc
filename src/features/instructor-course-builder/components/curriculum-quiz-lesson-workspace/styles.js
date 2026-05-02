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
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    gap: 2,
    px: { xs: 2, sm: 2.5 },
    py: { xs: 1.75, sm: 2 },
    bgcolor: '#fff',
    borderBottom: `1px solid ${quizColors.border}`,
    borderRadius: '10px 10px 0 0',
    flexShrink: 0,
  },

  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: { xs: 1, sm: 1.5 },
    minWidth: 0,
    flex: 1,
    width: { xs: '100%', sm: 'auto' },
  },

  headerQuizBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: { xs: 0.5, sm: 0.75 },
    flexShrink: 0,
    px: { xs: 1, sm: 1.25 },
    py: { xs: 0.375, sm: 0.5 },
    borderRadius: '999px',
    bgcolor: '#f3f4f6',
    border: `1px solid ${quizColors.border}`,
  },

  headerQuizIconWrap: {
    width: { xs: 22, sm: 26 },
    height: { xs: 22, sm: 26 },
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#fff',
    border: `1px solid ${quizColors.border}`,
    color: quizColors.muted,
  },

  headerQuizBadgeLabel: {
    fontSize: { xs: 12, sm: 13 },
    fontWeight: 600,
    color: quizColors.text,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
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
    minWidth: 0,
    m: 0,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 2,
      fontSize: { xs: 14, sm: 15 },
      fontWeight: 600,
    },
    '& .MuiOutlinedInput-input': {
      py: { xs: 0.875, sm: 1 },
      fontWeight: 600,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  saveBtn: {
    textTransform: 'none',
    fontWeight: 600,
    px: 2.5,
    py: 1,
    borderRadius: '999px',
    fontSize: 14,
    width: { xs: '100%', sm: 'auto' },
    alignSelf: { xs: 'stretch', sm: 'auto' },
  },

  tabsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: { xs: 1, sm: 1.5, md: 2 },
    flexWrap: 'nowrap',
    minWidth: 0,
    mt: 0,
    pt: { xs: 1.5, sm: 2 },
    pb: { xs: 1.5, sm: 2 },
    flexShrink: 0,
  },

  tabsWrap: {
    display: 'flex',
    gap: '4px',
    p: '4px',
    bgcolor: '#e8eaed',
    borderRadius: '10px',
    flex: '1 1 0%',
    minWidth: 0,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    flexShrink: 1,
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { height: 4 },
  },

  tabActions: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 0.75, sm: 1.25 },
    flexShrink: 0,
    flexWrap: 'nowrap',
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
    fontSize: { xs: 13, sm: 14 },
    px: { xs: 1.25, sm: 2 },
    py: 1,
    borderRadius: '8px',
    borderColor: quizColors.primaryBlue,
    color: quizColors.primaryBlue,
    whiteSpace: 'nowrap',
  },

  tabBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: { xs: 13, sm: 14 },
    px: { xs: 1.5, sm: 2.25 },
    py: { xs: 1, sm: 1.125 },
    borderRadius: '8px',
    color: quizColors.muted,
    border: 'none',
    bgcolor: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
    whiteSpace: 'nowrap',
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
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1.5, sm: 2 },
    p: { xs: 1.75, sm: 2.5 },
    alignItems: { xs: 'stretch', sm: 'flex-start' },
  },

  imageTile: {
    width: { xs: '100%', sm: 52 },
    height: { xs: 52, sm: 52 },
    maxWidth: { xs: 76, sm: 'none' },
    flexShrink: 0,
    border: `1px solid ${quizColors.border}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#f9fafb',
    color: quizColors.muted,
    cursor: 'pointer',
    alignSelf: { xs: 'flex-start', sm: 'auto' },
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
    gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
    alignItems: 'center',
    gap: { xs: 1.5, sm: 2 },
    pt: { xs: 2, sm: 3 },
    mt: 'auto',
    flexShrink: 0,
  },

  footerCenter: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'center',
    gap: 2,
    flexWrap: 'wrap',
    gridColumn: { xs: '1 / -1', sm: 'auto' },
    order: { xs: -1, sm: 0 },
    '& .MuiButton-root': {
      width: { xs: 1, sm: 'auto' },
    },
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
    justifySelf: { xs: 'stretch', sm: 'end' },
    width: { xs: '100%', sm: 'auto' },
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
