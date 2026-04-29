import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';

import { TINYMCE } from './tinymce-theme';

export function TmIconButton({ icon, label, active, disabled, children, sx, ...other }) {
  const content = (
    <ButtonBase
      disabled={disabled}
      disableRipple
      sx={[
        {
          width: TINYMCE.iconBtnSize,
          height: TINYMCE.iconBtnSize,
          minWidth: TINYMCE.iconBtnSize,
          borderRadius: TINYMCE.buttonRadius,
          color: 'text.primary',
          fontSize: 13,
          fontWeight: 700,
          ...(active && { backgroundColor: TINYMCE.activeBg }),
          '&:hover': {
            backgroundColor: active ? TINYMCE.activeBg : 'action.hover',
          },
          '&.Mui-disabled': { opacity: 0.4 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {icon ? <SvgIcon sx={{ fontSize: 16 }}>{icon}</SvgIcon> : children}
    </ButtonBase>
  );

  if (!label) return content;

  return <Tooltip title={label}>{content}</Tooltip>;
}
