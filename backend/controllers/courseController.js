const Course = require('../models/Course');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Course title required' });

    const course = await Course.create({ title, description, trainer: req.user._id });
    return res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Unable to create course', error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('trainer', 'name email role').populate('students', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Unable to fetch courses', error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('trainer', 'name email role')
      .populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Unable to fetch course', error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role === 'trainer' && course.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned trainer can update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Unable to update course', error: err.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    course.students.push(req.user._id);
    await course.save();
    res.json({ message: 'Enrolled successfully', course });
  } catch (err) {
    res.status(500).json({ message: 'Enroll failed', error: err.message });
  }
};

exports.removeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role === 'trainer' && course.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned trainer can delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course removed' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to delete course', error: err.message });
  }
};
