export function getSidebarItemSx(item) {
  return {
    px: 1.5,
    py: { xs: 1.2, sm: 1.15 },
    minHeight: { xs: 48, sm: 44 },
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    color: item.active ? 'primary.main' : 'text.secondary',
    bgcolor: item.active ? 'primary.lighter' : 'transparent',
    fontWeight: item.active ? 700 : 500,
    textDecoration: 'none',
    cursor: item.action === 'logout' ? 'pointer' : 'default',
    transition: (theme) => theme.transitions.create(['background-color', 'color']),
  };
}

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
    bgcolor: 'primary.lighter',
    color: 'primary.main',
    fontWeight: 700,
  },
  groupHeading: { color: 'text.disabled', letterSpacing: 1.1, px: 0.5 },
};

export const itemLabelTypography = { fontWeight: 'inherit', color: 'inherit' };
