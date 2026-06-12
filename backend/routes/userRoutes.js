const express = require('express');
const {
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', protect, authorize('admin'), getUsers);
router.patch('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
