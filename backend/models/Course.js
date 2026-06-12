const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    content: [{ type: String }],
    progress: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        percentage: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
