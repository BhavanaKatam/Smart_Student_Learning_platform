import { useEffect, useState } from 'react';
import { getCourses, createCourse, enrollCourse, deleteCourse, updateCourse, getUserId } from '../api';
import { useAuth } from '../AuthContext';
import Layout from './Layout';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = getUserId(user);

  const load = async () => {
    try {
      const { data } = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCourse = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createCourse(form);
      setForm({ title: '', description: '' });
      setMessage('Course created successfully!');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create course');
    }
  };

  const join = async (id) => {
    try {
      await enrollCourse(id);
      setMessage('Enrolled successfully!');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Enrollment failed');
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      setMessage('Course deleted.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  const doUpdate = async (course) => {
    const titleValue = window.prompt('Course title', course.title);
    if (titleValue == null) return;
    const descriptionValue = window.prompt('Course description', course.description || '');
    try {
      await updateCourse(course._id, { title: titleValue, description: descriptionValue });
      setMessage('Course updated.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <Layout title="Course Management">
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error">{error}</p>}

      {['trainer', 'admin'].includes(user?.role) && (
        <form onSubmit={addCourse} className="card form-card">
          <h3>Create New Course</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Course Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Full Stack Web Development"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief course description"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Course
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card empty-state">
          <span>📚</span>
          <p>No courses available yet.</p>
        </div>
      ) : (
        <div className="card-list grid-2">
          {courses.map((course) => {
            const trainerId = course.trainer?._id || course.trainer;
            const isTrainer = trainerId?.toString() === userId?.toString();
            const enrolled = course.students?.some(
              (s) => (s._id || s)?.toString() === userId?.toString()
            );

            return (
              <div key={course._id} className="card">
                <h3>{course.title}</h3>
                <p>{course.description || 'No description provided.'}</p>
                <p>
                  <strong>Trainer:</strong> {course.trainer?.name || 'N/A'}
                </p>
                <p>
                  <strong>Students enrolled:</strong> {course.students?.length || 0}
                </p>
                {user?.role === 'student' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => join(course._id)}
                    disabled={enrolled}
                  >
                    {enrolled ? '✓ Enrolled' : 'Enroll Now'}
                  </button>
                )}
                {(isTrainer || user?.role === 'admin') && (
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => doUpdate(course)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => doDelete(course._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
