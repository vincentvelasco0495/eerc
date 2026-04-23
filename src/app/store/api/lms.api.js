import {
  fetchLmsBootstrap,
  uploadAdminModule,
  simulateQuizAttempt,
  fetchQuizQuestionSet,
  toggleModuleVisibility,
  updateEnrollmentStatus,
  submitEnrollmentRequest,
} from 'src/services/lms.service';

export const lmsApi = {
  bootstrap: fetchLmsBootstrap,
  fetchQuizQuestionSet,
  simulateQuizAttempt,
  submitEnrollmentRequest,
  toggleModuleVisibility,
  uploadAdminModule,
  updateEnrollmentStatus,
};
