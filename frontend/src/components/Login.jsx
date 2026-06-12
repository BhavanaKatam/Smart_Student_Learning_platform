import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi, getApiError } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(getApiError(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1>Smart Student Learning & Placement Management</h1>
        <p>
          A centralized platform for students to learn, track progress, and apply for jobs — built
          for training institutes.
        </p>
        <ul>
          <li>Track course progress & assignments</li>
          <li>Trainer-led evaluations & feedback</li>
          <li>Job portal with application tracking</li>
          <li>Role-based admin, trainer & student access</li>
        </ul>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your account</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
