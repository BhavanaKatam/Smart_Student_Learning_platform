const Job = require('../models/Job');

exports.postJob = async (req, res) => {
  try {
    const { title, company, location, description } = req.body;
    if (!title || !company) return res.status(400).json({ message: 'Title and company are required' });

    const job = await Job.create({ title, company, location, description, postedBy: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post job', error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email role');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = job.applicants.find(a => a.student.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ message: 'Already applied' });

    job.applicants.push({ student: req.user._id });
    await job.save();

    res.json({ message: 'Applied successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Fail to apply', error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role === 'trainer' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job', error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicant = job.applicants.find(a => a._id.toString() === req.params.applicantId);
    if (!applicant) return res.status(404).json({ message: 'Application not found' });

    if (!['applied', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    applicant.status = status;
    await job.save();

    res.json({ message: 'Status updated', applicant });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
