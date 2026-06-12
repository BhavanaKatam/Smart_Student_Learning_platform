const express = require('express');
const {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeSubmission,
} = require('../controllers/assignmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('trainer', 'admin'), createAssignment);
router.get('/course/:courseId', protect, getCourseAssignments);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.patch(
  '/:assignmentId/submission/:submissionId/grade',
  protect,
  authorize('trainer', 'admin'),
  gradeSubmission
);

module.exports = router;
