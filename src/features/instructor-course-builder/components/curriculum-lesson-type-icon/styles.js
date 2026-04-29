export const styles = {
  tile: (spec, borderRadius) => ({
    width: 30,
    height: 30,
    borderRadius,
    bgcolor: spec.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  glyph: {
    color: 'common.white',
  },
  glyphVideo: {
    color: 'common.white',
    ml: 0.25,
  },
};
