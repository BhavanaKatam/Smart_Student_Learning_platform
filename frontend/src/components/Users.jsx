import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUsers, updateUser, deleteUser } from '../api';
import { useAuth } from '../AuthContext';
import Layout from './Layout';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const changeRole = async (userId, role) => {
    try {
      await updateUser(userId, { role });
      setMessage('User role updated.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed');
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(userId);
      setMessage('User deleted.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  const roleBadge = {
    admin: 'badge-admin',
    trainer: 'badge-trainer',
    student: 'badge-student',
  };

  return (
    <Layout title="Manage Users">
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="card-list grid-2">
          {users.map((u) => (
            <div key={u._id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="avatar">{u.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                </div>
              </div>
              <p>
                Role: <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
              </p>
              <div className="btn-group">
                <select
                  className="select-sm"
                  value={u.role}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn btn-danger btn-sm" onClick={() => removeUser(u._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
