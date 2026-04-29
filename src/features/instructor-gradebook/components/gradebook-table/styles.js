export const styles = {
  container: {
    borderRadius: 2,
    boxShadow: 'none',
    overflow: 'auto',
    borderColor: 'divider',
  },
  headRow: {
    '& th': {
      bgcolor: (theme) => (theme.palette.mode === 'light' ? 'primary.lighter' : 'action.hover'),
      color: 'primary.main',
      fontWeight: 700,
      fontSize: 12,
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
  },
  bodyRow: (index) => ({
    bgcolor: index % 2 ? 'action.hover' : 'background.paper',
    '&:last-child td': { borderBottom: 0 },
  }),
  cellBold: { fontWeight: 500 },
};
