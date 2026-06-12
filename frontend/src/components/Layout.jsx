import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/courses', label: 'Courses', icon: '📚' },
  { path: '/assignments', label: 'Assignments', icon: '📝' },
  { path: '/jobs', label: 'Job Portal', icon: '💼' },
];

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = {
    admin: 'badge-admin',
    trainer: 'badge-trainer',
    student: 'badge-student',
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🎓</span>
          <div>
            <h1>SSLPM</h1>
            <p>Learning & Placement</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/users"
              className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              Manage Users
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div>
              <strong>{user?.name}</strong>
              <span className={`badge ${roleBadge[user?.role] || ''}`}>{user?.role}</span>
            </div>
          </div>
          <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {title && (
          <header className="page-header">
            <h2>{title}</h2>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
