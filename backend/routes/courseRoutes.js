const express = require('express');
const {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollCourse,
  removeCourse,
  updateCourse,
} = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorize('trainer', 'admin'), createCourse);
router.patch('/:id', protect, authorize('trainer', 'admin'), updateCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.delete('/:id', protect, authorize('admin', 'trainer'), removeCourse);

module.exports = router;
