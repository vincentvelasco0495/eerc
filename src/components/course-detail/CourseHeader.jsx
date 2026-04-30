import { useState } from 'react';
import styled from 'styled-components';

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

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${space(2)};
  margin-bottom: ${space(2)};
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    justify-items: start;
    row-gap: ${space(2)};
  }
`;

const CategoryCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
`;

const CategoryText = styled.span`
  font-size: 13px;
  line-height: 1.45;
  color: ${colors.muted};
`;

const InstructorCell = styled.div`
  justify-self: center;

  @media (max-width: 900px) {
    justify-self: start;
  }
`;

const RatingCell = styled.div`
  justify-self: end;

  @media (max-width: 900px) {
    justify-self: start;
  }
`;

const Title = styled.h1`
  margin: 0 0 ${space(2)};
  font-size: clamp(1.85rem, 3.5vw, 2.25rem);
  font-weight: 700;
  line-height: 1.15;
  color: ${colors.headingNavy};
  letter-spacing: -0.02em;
`;

const InstructorWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${colors.border};
`;

const InstructorTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CaptionMuted = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${colors.muted};
`;

const InstructorName = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`;

const RatingColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  @media (max-width: 900px) {
    align-items: flex-start;
  }
`;

const StarsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
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
  color: ${colors.text};
`;

const ReviewLineMeta = styled.span`
  font-size: 13px;
  color: ${colors.muted};
  line-height: 1.35;
`;

const DescBlock = styled.div`
  margin-top: ${space(1)};
`;

const DescriptionText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: ${colors.muted};
  ${(props) =>
    !props.$expanded &&
    `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const ShowMoreBtn = styled.button`
  margin-top: ${space(1)};
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.primary};

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
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

/** Full-width header: bookmark + category | instructor | rating; navy title; show more / less intro. */
export function CourseHeader({ data }) {
  const [expanded, setExpanded] = useState(true);
  const { category, title, instructor, rating, shortDescription } = data;

  const scoreLabel = rating.scoreLabel ?? '';

  return (
    <Outer>
      <MetaGrid>
        <CategoryCell>
          <BookmarkSvg />
          <CategoryText aria-label={`Category ${category}`}>
            <strong style={{ color: colors.text, fontWeight: 600 }}>Category:</strong> {category}
          </CategoryText>
        </CategoryCell>

        <InstructorCell>
          <InstructorWrap>
            <Avatar src={instructor.avatarUrl} alt={instructor.name} width={40} height={40} />
            <InstructorTexts>
              <CaptionMuted>Instructor:</CaptionMuted>
              <InstructorName>{instructor.name}</InstructorName>
            </InstructorTexts>
          </InstructorWrap>
        </InstructorCell>

        <RatingCell>
          <RatingColumn>
            <StarsRow>
              <Stars ratingValue={rating.value} />
              {scoreLabel ? <ScoreNum aria-hidden>{scoreLabel}</ScoreNum> : null}
            </StarsRow>
            {rating.reviewLine ? <ReviewLineMeta>{rating.reviewLine}</ReviewLineMeta> : null}
          </RatingColumn>
        </RatingCell>
      </MetaGrid>

      <Title>{title}</Title>

      <DescBlock>
        <DescriptionText data-expanded={expanded} $expanded={expanded}>
          {shortDescription}
        </DescriptionText>
        <ShowMoreBtn type="button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : 'Show more'}
        </ShowMoreBtn>
      </DescBlock>
    </Outer>
  );
}
