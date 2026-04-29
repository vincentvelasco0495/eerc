export const styles = {
  pageTitle: {
    fontWeight: 600,
    color: 'grey.900',
    fontSize: { xs: '1.35rem', sm: '1.5rem' },
  },
  formSurface: {
    bgcolor: '#f0f2f5',
    borderRadius: 2,
    p: { xs: 2.5, sm: 3 },
  },
  selectPlaceholder: {
    color: 'text.secondary',
    fontWeight: 500,
  },
  selectFieldRoot: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'common.white',
      borderRadius: 1.5,
    },
  },
  menuPlaceholder: { color: 'text.secondary' },
  messageField: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'common.white',
      borderRadius: 1.5,
    },
    '& .MuiInputBase-input::placeholder': { opacity: 0.55 },
  },
  actionsRow: { pt: 1 },
  submitButton: {
    px: 3.5,
    borderRadius: 1.5,
    bgcolor: '#2b7fff',
    boxShadow: 'none',
    '&:hover': { bgcolor: '#1a6fe6', boxShadow: 'none' },
  },
};
