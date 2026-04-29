import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

import { TINYMCE } from './tinymce-theme';

const MENUS = [
  { id: 'view', label: 'View', items: ['Source code', 'Visual aids'] },
  { id: 'format', label: 'Format', items: ['Bold', 'Italic', 'Clear formatting'] },
  { id: 'table', label: 'Table', items: ['Insert table', 'Delete table'] },
  { id: 'tools', label: 'Tools', items: ['Word count', 'Preview'] },
];

export function TinyMceMenuBar() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: 5,
        rowGap: 0.5,
        width: 1,
        px: 2,
        py: 0.75,
        minHeight: 40,
        backgroundColor: TINYMCE.chromeSurface,
        borderBottom: `1px solid ${TINYMCE.hairline}`,
      }}
    >
      {MENUS.map((m) => (
        <MenuDropdown key={m.id} {...m} />
      ))}
    </Box>
  );
}

function MenuDropdown({ label, items }) {
  const { anchorEl, open, onOpen, onClose } = usePopover();

  return (
    <>
      <ButtonBase
        onClick={onOpen}
        disableRipple
        sx={{
          px: 1.25,
          py: 0.75,
          borderRadius: TINYMCE.buttonRadius,
          typography: 'body2',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: TINYMCE.menuColor,
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.06)' },
        }}
      >
        {label}
      </ButtonBase>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {items.map((item) => (
          <MenuItem key={item} dense disabled onClick={onClose}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
