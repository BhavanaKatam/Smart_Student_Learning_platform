const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;
    if (!courseId || !title || !dueDate) {
      return res.status(400).json({ message: 'courseId, title, dueDate are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isOwner = course.trainer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only assigned trainer or admin can add assignment' });
    }

    const assignment = await Assignment.create({ course: courseId, title, description, dueDate, createdBy: req.user._id });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Create assignment failed', error: err.message });
  }
};

exports.getCourseAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('createdBy', 'name email')
      .populate('submissions.student', 'name email');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Submission content required' });

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isEnrolled = course.students.some(
      (s) => s.toString() === req.user._id.toString()
    );
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You must be enrolled in this course to submit' });
    }

    if (assignment.submissions.some(s => s.student.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    assignment.submissions.push({ student: req.user._id, content });
    await assignment.save();

    res.json({ message: 'Submitted successfully', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed', error: err.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isOwner = course.trainer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to grade this assignment' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (grade === undefined || grade === null || grade === '') {
      return res.status(400).json({ message: 'Grade is required' });
    }

    const gradeNum = Number(grade);
    if (Number.isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      return res.status(400).json({ message: 'Grade must be a number between 0 and 100' });
    }

    submission.grade = gradeNum;
    submission.feedback = feedback || '';
    await assignment.save();

    res.json({ message: 'Graded successfully', submission });
  } catch (err) {
    res.status(500).json({ message: 'Grading failed', error: err.message });
  }
};
