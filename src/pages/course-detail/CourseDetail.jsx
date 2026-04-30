import styled from 'styled-components';

import { SidebarCard } from '../../components/course-detail/SidebarCard';
import { CourseHeader } from '../../components/course-detail/CourseHeader';
import { CourseContent } from '../../components/course-detail/CourseContent';
import { PopularCourses } from '../../components/course-detail/PopularCourses';
import { space, colors } from '../../components/course-detail/course-detail-tokens';
import { CourseDetailsCard } from '../../components/course-detail/CourseDetailsCard';
import {
  faqItemsMock,
  courseDetailMock,
  noticeContentMock,
  popularCoursesMock,
  relatedCoursesMock,
  curriculumModulesMock,
  noticeRelatedCoursesMock,
} from '../../components/course-detail/course-detail-data';

const PageBg = styled.div`
  min-height: 100vh;
  background: ${colors.white};
  font-family:
    'Public Sans',
    system-ui,
    -apple-system,
    sans-serif;
`;

const PageInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${space(3)} ${space(3)} ${space(6)};

  @media (max-width: 900px) {
    padding: ${space(2)};
  }
`;

const PageMain = styled.main`
  width: 100%;
`;

/** Narrow sidebar + wide content; mobile: flex column — main (hero) above sidebar. */
const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: ${space(5)};
  align-items: start;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: ${space(4)};
  }
`;

const AsideColumn = styled.aside`
  position: sticky;
  top: ${space(3)};
  display: flex;
  flex-direction: column;
  gap: ${space(3)};

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

/** Progress card — completion state, progress bar, CTA */
const ProgressHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${space(2)};
  margin-bottom: ${space(2)};
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

const ProgressTrack = styled.div`
  height: 8px;
  border-radius: 999px;
  background: rgba(229, 231, 235, 0.9);
  overflow: hidden;
  margin-bottom: ${space(2)};
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  width: ${(props) => props.$pct}%;
  background: ${colors.primary};
  transition: width 0.25s ease;
`;

const ContinueBtn = styled.a`
  display: block;
  width: 100%;
  padding: 14px ${space(2)};
  margin-bottom: ${space(2)};
  border-radius: 12px;
  border: none;
  text-align: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: ${colors.white};
  background: ${colors.primary};
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.15s ease;

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
`;

const QuietBtn = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  color: ${colors.muted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

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
 * Standalone learner course detail UI (styled-components reference build).
 *
 * Routed at **`/course-detail`** — see `routes/sections/main.jsx`.
 */
export default function CourseDetail() {
  const {
    heroImageUrl,
    details,
    completion,
  } = courseDetailMock;

  return (
    <PageBg>
      <PageInner>
        <PageMain>
          <CourseHeader data={courseDetailMock} />
          <TwoColGrid>
          <AsideColumn aria-label="Course summary sidebar">
            <SidebarCard $variant="completion">
              <ProgressHead>
                <CompletionLeft>
                  <CheckBadge aria-hidden>✓</CheckBadge>
                  <CompletionTitles>
                    <strong>{completion.label}</strong>
                    <span>Score: {completion.scorePercent}%</span>
                  </CompletionTitles>
                </CompletionLeft>
                <DetailsBtn type="button">Details</DetailsBtn>
              </ProgressHead>
              <ProgressTrack>
                <ProgressFill $pct={completion.scorePercent} aria-hidden />
              </ProgressTrack>
              <ContinueBtn href="#">CONTINUE</ContinueBtn>
              <ActionsRow role="toolbar" aria-label="Secondary actions">
                <QuietBtn type="button">
                  <span aria-hidden>♥</span> Add to wishlist
                </QuietBtn>
                <QuietBtn type="button">
                  <span aria-hidden>⇪</span> Share
                </QuietBtn>
              </ActionsRow>
            </SidebarCard>

            <SidebarCard $variant="muted">
              <CourseDetailsCard rows={details} heading="Course details" />
            </SidebarCard>

            <SidebarCard>
              <PopularCourses items={popularCoursesMock} />
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
              data={courseDetailMock}
              heroImageUrl={heroImageUrl}
              relatedCourses={relatedCoursesMock}
              noticeContent={noticeContentMock}
              relatedCoursesNotice={noticeRelatedCoursesMock}
              curriculumModules={curriculumModulesMock}
              faqItems={faqItemsMock}
            />
          </MainColumn>
        </TwoColGrid>
        </PageMain>
      </PageInner>
    </PageBg>
  );
}
