import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router';

import { space, colors } from './course-detail-tokens';

function BookmarkSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-6-4-6 4V5z"
        stroke={colors.primary}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Outer = styled.header`
  width: 100%;
  margin-bottom: ${space(4)};
`;

const MetaSection = styled.div`
  width: 100%;
  padding-bottom: ${space(2.5)};
  margin-bottom: ${space(2.5)};
  border-bottom: 1px solid ${colors.border};
`;

const HeaderTopNav = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${space(2)};
  margin-bottom: ${space(2)};
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  color: ${colors.headingNavy};
  background: transparent;
  cursor: pointer;

  &:hover {
    background: rgba(30, 58, 138, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

function BackArrowSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BadgeChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.white};
  background: #f97316;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const MetaBar = styled.div`
  background: ${colors.white};
`;

/**
 * Single row: Category | Instructor | Reviews — equal-width columns, vertical rules between.
 * Padding: 16px 24px shell; 0 20px per column (reference).
 */
const CourseMetaContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 16px 24px;
  margin: 0;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
  }
`;

const MetaItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 20px;
  margin: 0;
  box-sizing: border-box;

  border-right: 1px solid ${colors.border};

  &:last-child {
    border-right: none;
  }

  justify-content: ${(props) =>
    ({
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
    })[props.$align] ?? 'flex-start'};

  @media (max-width: 900px) {
    justify-content: flex-start;
    border-right: none;
    border-bottom: 1px solid ${colors.border};
    padding: 14px 0;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const LabelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const MetaLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  color: ${colors.muted};
`;

const MetaValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: ${colors.headingNavy};
`;

const Title = styled.h1`
  margin: 0 0 ${space(2)};
  font-size: clamp(1.75rem, 3.25vw, 2.125rem);
  font-weight: 700;
  line-height: 1.22;
  color: ${colors.headingNavy};
  letter-spacing: -0.02em;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid ${colors.border};
`;

/** Stars + numeric score one row; review count stacked below — right-aligned in column. */
const RatingColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  line-height: 1.35;
  margin: 0;

  @media (max-width: 900px) {
    align-items: flex-start;
  }
`;

const StarsRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const StarsWrap = styled.div`
  display: inline-flex;
  gap: 2px;
  font-size: 16px;
  line-height: 1;
`;

const StarSym = styled.span`
  color: ${(props) => (props.$filled ? colors.star : colors.starEmpty)};
`;

const ScoreNum = styled.span`
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  color: ${colors.headingNavy};
`;

const ReviewLineMeta = styled.span`
  font-size: 12px;
  color: ${colors.muted};
  line-height: 1.35;
`;

const DescRow = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: ${colors.muted};
`;

const DescToggle = styled.button`
  display: inline;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: inherit;
  line-height: inherit;
  font-weight: 600;
  color: ${colors.primary};

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

function Stars({ ratingValue, max = 5 }) {
  return (
    <StarsWrap aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <StarSym key={String(i)} $filled={i < Math.min(ratingValue, max)}>
          ★
        </StarSym>
      ))}
    </StarsWrap>
  );
}

const DESCRIPTION_PREVIEW = 148;

/**
 * Course marketing header — bordered meta strip with equal flex columns,
 * vertical dividers between sections only, left / center / right alignment.
 */
export function CourseHeader({ data }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { category, badge, title, instructor, rating, shortDescription } = data;

  const scoreLabel = rating.scoreLabel ?? '';

  const needsToggle = shortDescription.length > DESCRIPTION_PREVIEW;
  const collapsedText = needsToggle
    ? `${shortDescription.slice(0, DESCRIPTION_PREVIEW).trimEnd()}…`
    : shortDescription;

  return (
    <Outer>
      <MetaSection>
        <HeaderTopNav>
          <BackButton type="button" aria-label="Go back" onClick={() => navigate(-1)}>
            <BackArrowSvg />
          </BackButton>
          {badge ? <BadgeChip>{badge}</BadgeChip> : null}
        </HeaderTopNav>

        <MetaBar>
          <CourseMetaContainer className="course-meta-container">
            <MetaItem $align="start" className="meta-item meta-item-category">
              <BookmarkSvg />
              <LabelStack>
                <MetaLabel>Category</MetaLabel>
                <MetaValue>{category}</MetaValue>
              </LabelStack>
            </MetaItem>

            <MetaItem $align="center" className="meta-item meta-item-instructor">
              <Avatar src={instructor.avatarUrl} alt={instructor.name} width={48} height={48} />
              <LabelStack>
                <MetaLabel>Instructor</MetaLabel>
                <MetaValue>{instructor.name}</MetaValue>
              </LabelStack>
            </MetaItem>

            <MetaItem $align="end" className="meta-item meta-item-reviews">
              <RatingColumn>
                <StarsRow>
                  <Stars ratingValue={rating.value} max={rating.max ?? 5} />
                  {scoreLabel ? <ScoreNum>{scoreLabel}</ScoreNum> : null}
                </StarsRow>
                {rating.reviewLine ? <ReviewLineMeta>{rating.reviewLine}</ReviewLineMeta> : null}
              </RatingColumn>
            </MetaItem>
          </CourseMetaContainer>
        </MetaBar>
      </MetaSection>

      <Title>{title}</Title>

      <DescRow>
        {expanded ? shortDescription : collapsedText}
        {needsToggle ? (
          <>
            {' '}
            <DescToggle type="button" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Show less' : 'Show more'}
            </DescToggle>
          </>
        ) : null}
      </DescRow>
    </Outer>
  );
}
