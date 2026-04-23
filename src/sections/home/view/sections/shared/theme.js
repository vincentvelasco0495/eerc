import { varAlpha } from 'minimal-shared/utils';

export function getPalette(theme) {
  return theme.vars?.palette || theme.palette;
}

export function pageBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark'
    ? palette.background.default
    : varAlpha(palette.primary.mainChannel, 0.03);
}

export function surfaceBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark'
    ? varAlpha(palette.common.whiteChannel, 0.03)
    : palette.common.white;
}

export function subtleBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark'
    ? varAlpha(palette.common.whiteChannel, 0.04)
    : varAlpha(palette.primary.mainChannel, 0.05);
}

export function alternateBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark'
    ? varAlpha(palette.common.whiteChannel, 0.06)
    : varAlpha(palette.secondary.mainChannel, 0.06);
}

export function darkSectionBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark' ? palette.grey[900] : palette.grey[800];
}

export function adaptiveSectionBackground(theme, lightVariant = 'surface') {
  if (theme.palette.mode === 'dark') {
    return darkSectionBackground(theme);
  }

  return lightVariant === 'subtle' ? subtleBackground(theme) : surfaceBackground(theme);
}

export function adaptiveSectionText(theme) {
  return theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary;
}

export function adaptiveSectionMutedText(theme, darkColor = 'rgba(255,255,255,0.78)') {
  return theme.palette.mode === 'dark' ? darkColor : theme.palette.text.secondary;
}

export function adaptiveInactiveDot(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.4)'
    : varAlpha(palette.primary.mainChannel, 0.32);
}

export function adaptiveActiveDot(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark' ? palette.common.white : palette.primary.main;
}

export function primarySectionBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark' ? palette.primary.dark : palette.primary.main;
}

export function accentSectionBackground(theme) {
  const palette = getPalette(theme);

  return theme.palette.mode === 'dark' ? palette.secondary.dark : palette.secondary.main;
}

export function primaryShadow(theme, opacity = 0.28) {
  const palette = getPalette(theme);

  return `0 12px 24px ${varAlpha(palette.primary.mainChannel, opacity)}`;
}
