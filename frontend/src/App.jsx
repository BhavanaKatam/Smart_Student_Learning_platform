import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import Assignments from './components/Assignments';
import Jobs from './components/Jobs';
import Users from './components/Users';
import { useAuth } from './AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
      <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
