import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Editor } from 'src/components/editor';

import { styles } from './styles';
import { QuestionImagesRow } from './question-images-row';
import { isSimulationDiagramQuestion } from './quiz-question-types';

export function QuestionEditor({
  questionType,
  questionText,
  onQuestionTextChange,
  modulePublicId,
  problemImageMaterialPublicId,
  problemImagePreviewUrl,
  problemImageName,
  solutionImageMaterialPublicId,
  solutionImagePreviewUrl,
  solutionImageName,
  imageUploadingSlot,
  onImageUploadingSlotChange,
  onProblemImageChange,
  onSolutionImageChange,
  onAfterMaterialsChange,
}) {
  const showImages = isSimulationDiagramQuestion(questionType);

  return (
    <Box sx={styles.questionEditorWrap}>
      <Box sx={styles.editorMainFull}>
        <Typography sx={styles.stemLabel}>{showImages ? 'Question :' : 'Enter your question'}</Typography>
        <Box sx={styles.editorShell}>
          <Editor
            value={questionText}
            onChange={onQuestionTextChange}
            placeholder={
              showImages
                ? 'Enter the question text for this simulation…'
                : 'What is the primary purpose of a retaining wall?'
            }
            chrome="tinymce"
            sx={{
              minHeight: { xs: 200, sm: 260 },
              maxHeight: { xs: 360, sm: 440 },
              minWidth: 0,
              maxWidth: '100%',
            }}
            tinymceResizeBounds={{
              min: 100,
              max: 320,
            }}
          />
        </Box>
      </Box>

      {showImages ? (
        <QuestionImagesRow
          modulePublicId={modulePublicId}
          problemImageMaterialPublicId={problemImageMaterialPublicId}
          problemImagePreviewUrl={problemImagePreviewUrl}
          problemImageName={problemImageName}
          solutionImageMaterialPublicId={solutionImageMaterialPublicId}
          solutionImagePreviewUrl={solutionImagePreviewUrl}
          solutionImageName={solutionImageName}
          uploadingSlot={imageUploadingSlot}
          onUploadingSlotChange={onImageUploadingSlotChange}
          onProblemImageChange={onProblemImageChange}
          onSolutionImageChange={onSolutionImageChange}
          onAfterMaterialsChange={onAfterMaterialsChange}
        />
      ) : null}
    </Box>
  );
}
