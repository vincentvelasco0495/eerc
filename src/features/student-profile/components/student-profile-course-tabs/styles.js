export const styles = {
  heading: { fontSize: { xs: '1.7rem', md: '2rem' } },
  tabs: {
    minHeight: 44,
    '& .MuiTabs-indicator': { height: 3, borderRadius: 99 },
  },
  tabRoot: {
    px: 0.5,
    minHeight: 44,
    minWidth: 'auto',
    mr: 2,
    color: 'text.secondary',
    '&.Mui-selected': { color: 'text.primary' },
  },
  tabLabelTypography: { fontWeight: 700 },
};

export function tabCountBadgeSx(isSelected) {
  return {
    minWidth: 20,
    height: 20,
    px: 0.75,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    bgcolor: isSelected ? 'primary.main' : 'background.neutral',
    color: isSelected ? 'common.white' : 'text.secondary',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  };
}
