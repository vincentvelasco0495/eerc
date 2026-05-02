import styled, { css } from 'styled-components';

import { radii, colors, shadow } from './course-detail-tokens';

const variants = {
  default: css`
    background: ${colors.white};
    border: 1px solid ${colors.border};
  `,
  completion: css`
    background: #eff6ff;
    border: 1px solid #dbeafe;
  `,
  muted: css`
    background: #f9fafb;
    border: 1px solid ${colors.border};
  `,
};

/** Shared sidebar surface: rounded card, subtle shadow (~12px radius). */
export const SidebarCard = styled.section`
  border-radius: ${radii.card};
  box-shadow: ${shadow.card};
  padding: 18px;
  ${(props) => variants[props.$variant] ?? variants.default};
`;
