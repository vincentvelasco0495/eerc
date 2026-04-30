/** Course builder → Notice tab */

const border = '#e5e7eb';

export const styles = {
  workspaceRoot: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    px: { xs: 2, sm: 2.5 },
    pb: 4,
    pt: { xs: 2, md: 2.5 },
  },

  pageCard: {
    maxWidth: 920,
    width: '100%',
    mx: 'auto',
    bgcolor: 'background.paper',
    border: `1px solid ${border}`,
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    p: { xs: 2.5, sm: 3, md: 3.5 },
    boxSizing: 'border-box',
  },

  cardTitle: {
    fontSize: { xs: 22, sm: 26 },
    fontWeight: 700,
    color: 'primary.dark',
    letterSpacing: '-0.02em',
    mb: 0,
  },

  dividerUnderTitle: {
    borderColor: border,
    my: 2.5,
  },

  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    pt: 2.5,
    mt: 1,
    borderTop: `1px solid ${border}`,
  },

  saveBtn: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 15,
    px: 4,
    py: 1.125,
    borderRadius: '8px',
  },
};
