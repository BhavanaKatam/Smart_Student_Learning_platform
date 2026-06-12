const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
