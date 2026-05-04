import styled from 'styled-components';
import { useMemo, useState } from 'react';

import { CourseFaq } from './CourseFaq';
import { CourseTabs } from './CourseTabs';
import { CourseNotice } from './CourseNotice';
import { tabKeys } from './course-detail-data';
import { CourseCurriculum } from './CourseCurriculum';
import { radii, space, colors } from './course-detail-tokens';

const HeroFigure = styled.figure`
  margin: 0 0 ${space(2)};
`;

const HeroImg = styled.img`
  display: block;
  width: 100%;
  border-radius: ${radii.card};
  aspect-ratio: 16 / 9;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background: #e8f4fc;
`;

const ProseStack = styled.div`
  font-size: 14px;
  line-height: 1.65;
  color: ${colors.muted};
`;

const Para = styled.p`
  margin: 0 0 ${space(2)};
`;

const BulletSection = styled.div`
  margin-top: ${space(3)};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${space(2)};
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  color: ${colors.text};
`;

const List = styled.ul`
  margin: 0;
  padding-left: 22px;
`;

const Li = styled.li`
  margin-bottom: 10px;

  &::marker {
    color: ${colors.muted};
  }
`;

const PlaceholderPane = styled.div`
  padding: ${space(3)};
  border: 1px dashed ${colors.border};
  border-radius: ${radii.card};
  color: ${colors.muted};
  font-size: 14px;
  line-height: 1.6;
`;

const TAB_LABEL_READABLE = {
  reviews: 'Reviews',
};

const ContentRoot = styled.div``;

/** Hero + tabs + panels (sits in right column beneath full-width course header). */
export function CourseContent({
  data,
  heroImageUrl,
  noticeContent,
  curriculumModules,
  faqItems,
  courseLookup,
}) {
  const [tabKey, setTabKey] = useState('description');

  const tabOptions = useMemo(() => [...tabKeys], []);

  const { paragraphs, learningOutcomes, audience } = data;

  return (
    <ContentRoot>
      <HeroFigure role="presentation">
        <HeroImg src={heroImageUrl} alt="Course visualization with wireframes and collaboration" />
      </HeroFigure>

      <CourseTabs activeKey={tabKey} onChange={setTabKey} options={tabOptions} />

      {tabKey === 'description' ? (
        <>
          <ProseStack>
            {paragraphs.map((text, index) => (
              <Para key={String(index)}>{text}</Para>
            ))}
          </ProseStack>

          <BulletSection>
            <SectionTitle>What you&apos;ll learn</SectionTitle>
            <List>
              {learningOutcomes.map((text) => (
                <Li key={text}>{text}</Li>
              ))}
            </List>
          </BulletSection>

          <BulletSection style={{ marginTop: space(3) }}>
            <SectionTitle>What is the target audience?</SectionTitle>
            <List>
              {audience.map((text) => (
                <Li key={text}>{text}</Li>
              ))}
            </List>
          </BulletSection>
        </>
      ) : null}

      {tabKey === 'curriculum' ? (
        <CourseCurriculum modules={curriculumModules} courseLookup={courseLookup} />
      ) : null}

      {tabKey === 'faq' ? <CourseFaq items={faqItems} /> : null}

      {tabKey === 'notice' && noticeContent ? (
        <CourseNotice heading={noticeContent.heading} items={noticeContent.items} />
      ) : null}

      {tabKey === 'reviews' ? (
        <PlaceholderPane role="region" aria-labelledby="placeholder-title">
          <strong id="placeholder-title" style={{ color: colors.text }}>
            {TAB_LABEL_READABLE.reviews}
          </strong>
          {' — '}
          This reference page uses static copy for this tab until content is wired.
        </PlaceholderPane>
      ) : null}
    </ContentRoot>
  );
}
