import { useEffect, useState } from 'react';
import {
  getCourses,
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getUserId,
} from '../api';
import { useAuth } from '../AuthContext';
import Layout from './Layout';

export default function Assignments() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitContent, setSubmitContent] = useState('');
  const [gradeModal, setGradeModal] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  const getFilteredCourses = (courseList) => {
    if (user?.role === 'trainer') {
      return courseList.filter(
        (c) => (c.trainer?._id || c.trainer)?.toString() === userId?.toString()
      );
    }
    if (user?.role === 'student') {
      return courseList.filter((c) =>
        c.students?.some((s) => (s._id || s)?.toString() === userId?.toString())
      );
    }
    return courseList;
  };

  const filteredCourses = getFilteredCourses(courses);

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const canManageCourse =
    user?.role === 'admin' ||
    (selectedCourseData &&
      (selectedCourseData.trainer?._id || selectedCourseData.trainer)?.toString() ===
        userId?.toString());

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data } = await getCourses();
        setCourses(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (!courses.length || !user) return;
    const filtered = getFilteredCourses(courses);
    if (!filtered.length) {
      setSelectedCourse('');
      return;
    }
    if (!filtered.some((c) => c._id === selectedCourse)) {
      setSelectedCourse(filtered[0]._id);
    }
  }, [courses, user]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const loadAssignments = async () => {
    if (!selectedCourse) {
      setAssignments([]);
      return;
    }
    try {
      const { data } = await getAssignments(selectedCourse);
      setAssignments(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assignments');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedCourse]);

  const add = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !canManageCourse) return;
    setError('');
    setMessage('');
    try {
      await createAssignment({ courseId: selectedCourse, ...form });
      setForm({ title: '', description: '', dueDate: '' });
      setMessage('Assignment created successfully!');
      loadAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleSubmit = async () => {
    if (!submitContent.trim()) {
      setError('Please enter your submission before submitting.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await submitAssignment(submitModal, { content: submitContent });
      setSubmitModal(null);
      setSubmitContent('');
      setMessage('Assignment submitted successfully!');
      loadAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed');
    } finally {
      setSaving(false);
    }
  };

  const handleGrade = async () => {
    if (!gradeModal) return;

    const grade = Number(gradeForm.grade);
    if (gradeForm.grade === '' || Number.isNaN(grade)) {
      setError('Please enter a valid grade between 0 and 100.');
      return;
    }
    if (grade < 0 || grade > 100) {
      setError('Grade must be between 0 and 100.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await gradeSubmission(gradeModal.assignmentId, gradeModal.submissionId, {
        grade,
        feedback: gradeForm.feedback,
      });
      setGradeModal(null);
      setGradeForm({ grade: '', feedback: '' });
      setMessage('Grade saved successfully!');
      loadAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Grading failed');
    } finally {
      setSaving(false);
    }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  if (loading) {
    return (
      <Layout title="Assignments">
        <div className="loading-screen" style={{ minHeight: '40vh' }}>
          <div className="spinner" />
          <p>Loading assignments...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Assignments">
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error">{error}</p>}

      {filteredCourses.length === 0 ? (
        <div className="card empty-state">
          <span>📝</span>
          <p>
            {user?.role === 'student'
              ? 'Enroll in a course to view and submit assignments.'
              : 'Create a course first to manage assignments.'}
          </p>
        </div>
      ) : (
        <>
          <div className="card form-card">
            <div className="form-group">
              <label>Select Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                {filteredCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {['trainer', 'admin'].includes(user?.role) && selectedCourse && canManageCourse && (
            <form onSubmit={add} className="card form-card">
              <h3>Create Assignment</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    required
                    placeholder="Assignment title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Assignment instructions..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Assignment
              </button>
            </form>
          )}

          {assignments.length === 0 ? (
            <div className="card empty-state">
              <span>📝</span>
              <p>No assignments for this course yet.</p>
            </div>
          ) : (
            <div className="card-list">
              {assignments.map((a) => {
                const studentSubmission = a.submissions?.find(
                  (s) => (s.student?._id || s.student)?.toString() === userId?.toString()
                );
                const overdue = isOverdue(a.dueDate);

                return (
                  <div key={a._id} className="card">
                    <div className="card-header">
                      <h3>{a.title}</h3>
                      {overdue && user?.role === 'student' && !studentSubmission && (
                        <span className="badge badge-pending">Overdue</span>
                      )}
                    </div>
                    <p>{a.description || 'No description.'}</p>
                    <p>
                      <strong>Due:</strong> {new Date(a.dueDate).toLocaleDateString()}
                    </p>

                    {user?.role === 'student' && (
                      <>
                        {studentSubmission ? (
                          <div className="submission-block">
                            <p>
                              <strong>Your submission:</strong> {studentSubmission.content}
                            </p>
                            <p>
                              Grade:{' '}
                              {studentSubmission.grade != null ? (
                                <span className="badge badge-success">
                                  {studentSubmission.grade}/100
                                </span>
                              ) : (
                                <span className="badge badge-pending">Pending</span>
                              )}
                            </p>
                            {studentSubmission.feedback && (
                              <p>
                                <strong>Feedback:</strong> {studentSubmission.feedback}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSubmitModal(a._id)}
                          >
                            Submit Assignment
                          </button>
                        )}
                      </>
                    )}

                    {['trainer', 'admin'].includes(user?.role) && canManageCourse && (
                      <div>
                        <h4 className="section-title">
                          Submissions ({a.submissions?.length || 0})
                        </h4>
                        {a.submissions?.length ? (
                          a.submissions.map((submission) => (
                            <div key={submission._id} className="submission-block">
                              <p>
                                <strong>Student:</strong> {submission.student?.name || 'Unknown'}
                              </p>
                              <p>
                                <strong>Content:</strong> {submission.content}
                              </p>
                              <p>
                                Grade:{' '}
                                {submission.grade != null ? (
                                  <span className="badge badge-success">
                                    {submission.grade}/100
                                  </span>
                                ) : (
                                  <span className="badge badge-pending">Not graded</span>
                                )}
                              </p>
                              {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setGradeModal({
                                    assignmentId: a._id,
                                    submissionId: submission._id,
                                    studentName: submission.student?.name || 'Student',
                                  });
                                  setGradeForm({
                                    grade: submission.grade ?? '',
                                    feedback: submission.feedback ?? '',
                                  });
                                  setError('');
                                }}
                              >
                                {submission.grade != null ? 'Update Grade' : 'Grade'}
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="empty-inline">No submissions yet</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {submitModal && (
        <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Assignment</h3>
            <div className="form-group">
              <label>Your Answer</label>
              <textarea
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                placeholder="Write your submission here..."
                rows={5}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setSubmitModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {gradeModal && (
        <div className="modal-overlay" onClick={() => setGradeModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Grade Submission</h3>
            <p className="modal-subtitle">Student: {gradeModal.studentName}</p>
            <div className="form-group">
              <label>Grade (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={gradeForm.grade}
                onChange={(e) => setGradeForm((p) => ({ ...p, grade: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))}
                placeholder="Optional feedback for the student..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setGradeModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleGrade} disabled={saving}>
                {saving ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
