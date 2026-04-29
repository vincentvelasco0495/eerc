export const styles = {
  tabs: {
    minHeight: 40,
    '& .MuiTabs-flexContainer': { gap: 1 },
    '& .MuiTabs-indicator': { display: 'none' },
  },
};

export function tabSx(isSelected) {
  return {
    px: 1.6,
    py: 0.9,
    minHeight: 40,
    minWidth: 'auto',
    borderRadius: 999,
    color: isSelected ? 'primary.main' : 'text.secondary',
    bgcolor: isSelected ? 'primary.lighter' : 'transparent',
    fontWeight: isSelected ? 700 : 600,
  };
}
