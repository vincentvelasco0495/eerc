import { useState, useCallback } from 'react';
import styled, { css } from 'styled-components';

import { radii, space, colors } from './course-detail-tokens';

const MODULE_ICON = {
  document: { bg: '#e8f5e9', fg: '#2e7d32' },
  video: { bg: '#fff3e0', fg: '#ef6c00' },
  quiz: { bg: '#fff3e0', fg: '#ef6c00' },
  stream: { bg: '#f3e8ff', fg: '#7e22ce' },
};

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space(2)};
`;

const ModuleOuter = styled.section`
  overflow: hidden;
  border-radius: ${radii.card};
  border: 1px solid ${colors.border};
  background: ${colors.white};
`;

const ModuleToggle = styled.button.attrs({ type: 'button' })`
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${space(2)};
  margin: 0;
  padding: ${space(2)} ${space(2.75)};
  border: none;
  background: ${colors.white};
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  color: ${colors.text};
  text-align: left;

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: -2px;
  }
`;

const ChevronCirc = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid ${colors.border};
  background: ${colors.white};
  color: ${colors.muted};
  transition: transform 0.2s ease;

  ${(props) =>
    props.$open &&
    css`
      transform: rotate(180deg);
    `}
`;

const SmallChevron = styled.span`
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid currentColor;
  margin-top: 2px;
`;

const LessonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${colors.border};
`;

const LessonItem = styled.li`
  margin: 0;
  padding: 0;
`;

const LessonRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${space(2)};
  min-height: 52px;
  padding: 14px ${space(2.75)};
  background: #f3f4f6;
  border-bottom: 2px solid ${colors.white};
`;

const OrderNum = styled.span`
  flex-shrink: 0;
  width: 18px;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.muted};
  text-align: right;
`;

const IconShell = styled.span`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: ${(props) => (props.$circle ? '50%' : '8px')};
  background: ${(props) => props.$bg};
  color: ${(props) => props.$fg};

  svg {
    display: block;
  }
`;

const LessonMid = styled.div`
  flex: 1;
  min-width: 0;
`;

const LessonTitleText = styled.span`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.42;
  color: ${colors.text};
`;

const MetaText = styled.span`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${colors.muted};
  text-align: right;
  max-width: 44%;
`;

const RowChevronBtn = styled.button.attrs({ type: 'button' })`
  appearance: none;
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin-right: -2px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${colors.muted};
  cursor: pointer;

  &:hover {
    color: ${colors.text};
    background: rgba(0, 0, 0, 0.04);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

const RowChevronIcon = styled.span`
  font-size: 9px;
  line-height: 1;
  display: inline-block;
  transition: transform 0.18s ease;

  ${(props) =>
    props.$open &&
    css`
      transform: rotate(180deg);
    `}
`;

const SubPeek = styled.div`
  padding: 12px ${space(2.75)} 14px calc(${space(2.75)} + 78px);
  margin-top: -2px;
  border-bottom: 2px solid ${colors.white};
  font-size: 13px;
  line-height: 1.55;
  color: ${colors.muted};
  background: #fafafa;
`;

function lessonGlyphForType(type) {
  switch (type) {
    case 'document':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 21h10a3 3 0 003-3V8l-6-6H8a3 3 0 00-3 3v13a3 3 0 003 3z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M14 6v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'video':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      );
    case 'quiz':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      );
    case 'stream':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 17c1.67-4 14.67-6 17-17M18 21c-.5-9.5 6-15 13-21M8 21c1-9 13-13 21-21"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function LessonTypeIcon({ type }) {
  const cfg = MODULE_ICON[type] ?? MODULE_ICON.document;

  const circle = ['video', 'quiz', 'stream'].includes(type);

  return (
    <IconShell $circle={circle} $bg={cfg.bg} $fg={cfg.fg} aria-hidden>
      {lessonGlyphForType(type)}
    </IconShell>
  );
}

/** Collapsible modules + typed lesson rows (Curriculum tab). */
export function CourseCurriculum({ modules }) {
  const [moduleOpen, setModuleOpen] = useState(() => {
    const init = {};
    modules.forEach((m) => {
      init[m.id] = m.defaultOpen !== false;
    });
    return init;
  });

  const [lessonOpen, setLessonOpen] = useState(() => ({}));

  const toggleModule = useCallback((id) => {
    setModuleOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleLesson = useCallback((id) => {
    setLessonOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <Wrapper>
      {modules.map((module) => {
        const listOpen = !!moduleOpen[module.id];

        return (
          <ModuleOuter key={module.id}>
            <ModuleToggle onClick={() => toggleModule(module.id)} aria-expanded={listOpen}>
              {module.title}
              <ChevronCirc $open={listOpen}>
                <SmallChevron />
              </ChevronCirc>
            </ModuleToggle>

            {listOpen ? (
              <LessonList>
                {module.lessons.map((lesson, idx) => {
                  const expandable = !!lesson.expandable;
                  const isOpen = !!lessonOpen[lesson.id];

                  return (
                    <LessonItem key={lesson.id}>
                      <LessonRow>
                        <OrderNum>{lesson.order ?? idx + 1}</OrderNum>
                        <LessonTypeIcon type={lesson.type} />
                        <LessonMid>
                          <LessonTitleText>{lesson.title}</LessonTitleText>
                        </LessonMid>
                        <MetaText>{lesson.meta}</MetaText>

                        {expandable ? (
                          <RowChevronBtn
                            onClick={() => toggleLesson(lesson.id)}
                            aria-expanded={isOpen}
                            aria-controls={`lesson-peek-${lesson.id}`}
                            id={`lesson-toggle-${lesson.id}`}
                          >
                            <SrOnly>Expand lesson preview</SrOnly>
                            <RowChevronIcon $open={isOpen} aria-hidden>
                              ▼
                            </RowChevronIcon>
                          </RowChevronBtn>
                        ) : (
                          <span style={{ flexShrink: 0, width: 28 }} aria-hidden />
                        )}
                      </LessonRow>

                      {expandable && isOpen ? (
                        <SubPeek id={`lesson-peek-${lesson.id}`} role="region" aria-labelledby={`lesson-toggle-${lesson.id}`}>
                          {lesson.peekBody ??
                            `Quick outline and resources for “${lesson.title}” — swap with CMS lesson body when wired.`}
                        </SubPeek>
                      ) : null}
                    </LessonItem>
                  );
                })}
              </LessonList>
            ) : null}
          </ModuleOuter>
        );
      })}
    </Wrapper>
  );
}
