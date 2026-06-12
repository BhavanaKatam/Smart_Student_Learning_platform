import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi, getApiError } from '../api';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(getApiError(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1>Join SSLPM Today</h1>
        <p>
          Register as a student, trainer, or admin and start managing learning and placement
          activities in one place.
        </p>
        <ul>
          <li>Students — enroll, submit assignments, apply for jobs</li>
          <li>Trainers — create courses, evaluate submissions</li>
          <li>Admins — manage users, courses & job postings</li>
        </ul>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="subtitle">Fill in your details to get started</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                required
                type="password"
                placeholder="Min. 6 characters"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
