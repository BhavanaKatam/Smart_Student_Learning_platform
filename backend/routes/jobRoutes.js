const express = require('express');
const {
  postJob,
  getJobs,
  applyJob,
  updateApplicationStatus,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', protect, getJobs);
router.post('/', protect, authorize('trainer', 'admin'), postJob);
router.post('/:id/apply', protect, authorize('student'), applyJob);
router.patch('/:id/applicant/:applicantId/status', protect, authorize('trainer', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('trainer', 'admin'), deleteJob);

module.exports = router;
