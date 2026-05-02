export const styles = {
  stickyWrap: { position: { lg: 'sticky' }, top: { lg: 24 } },
  card: {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  stackPadding: { p: 2.5 },
  avatar: {
    width: 56,
    height: 56,
    bgcolor: 'warning.lighter',
    color: 'warning.dark',
    fontWeight: 700,
  },
  subtitle: { color: 'primary.main', fontWeight: 600 },
  groupHeading: { color: 'text.disabled', letterSpacing: 1.1, px: 0.5 },
};

export function getSidebarItemSx(item) {
  return {
    px: 1.5,
    py: { xs: 1.2, sm: 1.1 },
    minHeight: { xs: 48, sm: 44 },
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.25,
    color: item.active ? 'primary.main' : 'text.secondary',
    bgcolor: item.active ? 'primary.lighter' : 'transparent',
    textDecoration: 'none',
    cursor: item.action === 'logout' ? 'pointer' : 'default',
    transition: (theme) => theme.transitions.create(['background-color', 'color']),
  };
}

export const stylesChip = {
  height: 20,
  '& .MuiChip-label': { px: 0.85, fontSize: 11, fontWeight: 700 },
};
