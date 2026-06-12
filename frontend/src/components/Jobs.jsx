import { useEffect, useState } from 'react';
import { getJobs, postJob, applyJob, deleteJob, getUserId } from '../api';
import { useAuth } from '../AuthContext';
import Layout from './Layout';

export default function Jobs() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const { data } = await getJobs();
      setJobs(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const createJob = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await postJob(form);
      setForm({ title: '', company: '', location: '', description: '' });
      setMessage('Job posted successfully!');
      loadJobs();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post job');
    }
  };

  const apply = async (id) => {
    try {
      await applyJob(id);
      setMessage('Application submitted!');
      loadJobs();
    } catch (err) {
      setError(err?.response?.data?.message || 'Application failed');
    }
  };

  const removeJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await deleteJob(id);
      setMessage('Job deleted.');
      loadJobs();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Job Portal">
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error">{error}</p>}

      {['trainer', 'admin'].includes(user?.role) && (
        <form onSubmit={createJob} className="card form-card">
          <h3>Post a New Job</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input
                required
                placeholder="e.g. Frontend Developer"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                required
                placeholder="Company name"
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              placeholder="e.g. Remote / Hyderabad"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Job requirements and details..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Post Job
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card empty-state">
          <span>💼</span>
          <p>No job postings yet.</p>
        </div>
      ) : (
        <div className="card-list grid-2">
          {jobs.map((job) => {
            const hasApplied = job.applicants?.some(
              (a) => (a.student?._id || a.student)?.toString() === userId?.toString()
            );
            const posterId = job.postedBy?._id || job.postedBy;
            const canManage =
              user?.role === 'admin' || posterId?.toString() === userId?.toString();

            return (
              <div key={job._id} className="card">
                <h3>{job.title}</h3>
                <p>
                  <strong>{job.company}</strong>
                  {job.location && ` · ${job.location}`}
                </p>
                <p>{job.description || 'No description provided.'}</p>
                <p>
                  Posted by: {job.postedBy?.name || 'Unknown'} ·{' '}
                  <span className="badge badge-applied">
                    {job.applicants?.length || 0} applicants
                  </span>
                </p>
                <div className="btn-group">
                  {user?.role === 'student' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => apply(job._id)}
                      disabled={hasApplied}
                    >
                      {hasApplied ? '✓ Applied' : 'Apply Now'}
                    </button>
                  )}
                  {canManage && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeJob(job._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
