import styled from 'styled-components';

import { SidebarCard } from './SidebarCard';
import { CourseHeader } from './CourseHeader';
import { CourseContent } from './CourseContent';
import { CourseDetailsCard } from './CourseDetailsCard';
import { space, radii, colors } from './course-detail-tokens';

const PageBg = styled.div`
  min-height: ${(props) => (props.$fillViewport ? '100vh' : 'auto')};
  background: ${colors.white};
  font-family:
    'Public Sans',
    system-ui,
    -apple-system,
    sans-serif;
`;

const PageInner = styled.div`
  max-width: 1224px;
  margin: 0 auto;
  padding: ${space(3)} ${space(3)} ${space(6)};

  @media (max-width: 900px) {
    padding: ${space(2)};
  }
`;

const PageMain = styled.main`
  width: 100%;
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 316px minmax(0, 1fr);
  gap: 28px;
  align-items: start;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: ${space(3)};
  }
`;

const AsideColumn = styled.aside`
  position: sticky;
  top: ${space(2)};
  display: flex;
  flex-direction: column;
  gap: ${space(2.5)};

  @media (max-width: 900px) {
    position: relative;
    top: auto;
    order: 2;
  }
`;

const MainColumn = styled.section`
  min-width: 0;

  @media (max-width: 900px) {
    order: 1;
  }
`;

/** Pale pill strip — progress row + Details (reference: light panel + filled Details CTA). */
const StatusPill = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${space(2)};
  width: 100%;
  padding: 10px 14px;
  margin-bottom: ${space(2)};
  box-sizing: border-box;
  border-radius: ${radii.pill};
  background: #e8f4fc;
  border: 1px solid #dbeafe;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
`;

const CompletionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const CheckBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: ${colors.primary};
  background: ${colors.white};
  border: 1px solid rgba(59, 130, 246, 0.28);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
`;

const CompletionTitles = styled.div`
  strong {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: ${colors.text};
  }
  span {
    font-size: 13px;
    color: ${colors.muted};
  }
`;

const DetailsBtn = styled.button`
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: ${colors.primary};
  color: ${colors.white};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(0.96);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

const ContinueBtn = styled.a`
  display: block;
  width: 100%;
  padding: 15px ${space(2)};
  margin-top: 0;
  margin-bottom: ${space(1.5)};
  border-radius: 10px;
  border: none;
  text-align: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: ${colors.white};
  background: ${colors.primary};
  cursor: pointer;
  transition:
    filter 0.15s ease,
    transform 0.15s ease;

  &:hover {
    filter: brightness(1.05);
  }

  &:focus-visible {
    outline: 2px solid #1d4ed8;
    outline-offset: 2px;
  }
`;

const ArchiveLabel = styled.p`
  margin: 0 0 ${space(1)};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: ${colors.muted};
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  background: ${colors.white};
  color: ${colors.text};
  font-size: 14px;
`;

const ARCHIVE_OPTIONS = ['Current intake', 'May 2026', 'April 2026', 'March 2026'];

/**
 * Two-column learner course-detail shell styled like `/course-detail`, driven entirely by props.
 */
export function CourseDetailLayout({
  /** Full `{@link CourseHeader}` + `{@link CourseContent}` marketing payload */
  data,
  heroImageUrl,
  completion,
  detailRows,
  curriculumModules,
  noticeContent,
  faqItems,
  /** LMS course slug or `public_id` — links curriculum text rows to the text-lesson page */
  courseLookup,
  /** Primary CTA (first/next module player) */
  continueHref,
  wrapMinHeightPage = false,
}) {
  return (
    <PageBg $fillViewport={wrapMinHeightPage}>
      <PageInner>
        <PageMain>
          <CourseHeader data={data} />
          <TwoColGrid>
            <AsideColumn aria-label="Course summary sidebar">
              <SidebarCard $variant="completion">
                <StatusPill>
                  <CompletionLeft>
                    <CheckBadge aria-hidden>✓</CheckBadge>
                    <CompletionTitles>
                      <strong>{completion.label}</strong>
                      <span>
                        Quiz avg:{' '}
                        {typeof completion.quizScorePercent === 'number'
                          ? `${completion.quizScorePercent}%`
                          : '—'}
                      </span>
                    </CompletionTitles>
                  </CompletionLeft>
                  <DetailsBtn type="button">Details</DetailsBtn>
                </StatusPill>
                <ContinueBtn href={continueHref ?? '#'}>CONTINUE</ContinueBtn>
              </SidebarCard>

              <SidebarCard $variant="muted">
                <CourseDetailsCard rows={detailRows} heading="Course details" />
              </SidebarCard>

              <SidebarCard>
                <ArchiveLabel id="archive-label">Archive</ArchiveLabel>
                <StyledSelect name="month" aria-labelledby="archive-label" defaultValue="">
                  <option value="" disabled>
                    Select Month
                  </option>
                  {ARCHIVE_OPTIONS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </StyledSelect>
              </SidebarCard>
            </AsideColumn>

            <MainColumn aria-label="Lesson content">
              <CourseContent
                data={data}
                heroImageUrl={heroImageUrl}
                noticeContent={noticeContent}
                curriculumModules={curriculumModules}
                faqItems={faqItems}
                courseLookup={courseLookup}
              />
            </MainColumn>
          </TwoColGrid>
        </PageMain>
      </PageInner>
    </PageBg>
  );
}
