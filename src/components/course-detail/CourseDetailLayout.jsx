import styled from 'styled-components';

import { SidebarCard } from './SidebarCard';
import { CourseHeader } from './CourseHeader';
import { CourseContent } from './CourseContent';
import { PopularCourses } from './PopularCourses';
import { space, colors } from './course-detail-tokens';
import { CourseDetailsCard } from './CourseDetailsCard';

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

const ProgressHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${space(2)};
`;

const CompletionLeft = styled.div`
  display: flex;
  align-items: flex-start;
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
  color: ${colors.white};
  background: ${colors.primary};
  font-size: 16px;
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
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid ${colors.primary};
  background: ${colors.white};
  color: ${colors.primary};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.08);
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
  margin-top: ${space(2)};
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

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${space(2)};
  row-gap: ${space(1)};
`;

const QuietBtn = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  color: ${colors.muted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  svg {
    flex-shrink: 0;
    opacity: 0.9;
  }

  &:hover {
    color: ${colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 4px;
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
  popularCoursesItems,
  relatedCoursesItems,
  noticeContent,
  noticeRelatedCoursesItems,
  faqItems,
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
                <ProgressHead>
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
                </ProgressHead>
                <ContinueBtn href={continueHref ?? '#'}>CONTINUE</ContinueBtn>
                <ActionsRow role="toolbar" aria-label="Secondary actions">
                  <QuietBtn type="button">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        d="M12 21C12 21 5 14.36 5 9.5A4.5 4.5 0 0112 8a4.5 4.5 0 017 1.5C19 14.36 12 21 12 21z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Add to wishlist
                  </QuietBtn>
                  <QuietBtn type="button">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        d="M12 3v12m0 0l4-4m-4 4L8 11M6 21h12a3 3 0 003-3v-2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Share
                  </QuietBtn>
                </ActionsRow>
              </SidebarCard>

              <SidebarCard $variant="muted">
                <CourseDetailsCard rows={detailRows} heading="Course details" />
              </SidebarCard>

              <SidebarCard>
                <PopularCourses items={popularCoursesItems} />
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
                relatedCourses={relatedCoursesItems}
                noticeContent={noticeContent}
                relatedCoursesNotice={noticeRelatedCoursesItems}
                curriculumModules={curriculumModules}
                faqItems={faqItems}
              />
            </MainColumn>
          </TwoColGrid>
        </PageMain>
      </PageInner>
    </PageBg>
  );
}
