const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'hired'],
      default: 'applied',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [applicantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
