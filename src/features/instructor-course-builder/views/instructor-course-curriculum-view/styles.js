export const styles = {
  content: {
    px: { xs: 2, sm: 2.5 },
    pb: 0,
  },
  shell: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: `calc(100vh - ${theme.spacing(4)})`,
    mx: { xs: -2, sm: -2.5 },
  }),
  body: {
    flex: 1,
    minHeight: 0,
    alignItems: 'stretch',
  },
};
