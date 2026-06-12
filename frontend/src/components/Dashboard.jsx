import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getDashboardStats } from '../api';
import Layout from './Layout';

const adminStats = [
  { key: 'totalUsers', label: 'Total Users', icon: '👥' },
  { key: 'students', label: 'Students', icon: '🎓' },
  { key: 'trainers', label: 'Trainers', icon: '👨‍🏫' },
  { key: 'totalCourses', label: 'Courses', icon: '📚' },
  { key: 'totalJobs', label: 'Job Postings', icon: '💼' },
  { key: 'totalAssignments', label: 'Assignments', icon: '📝' },
];

const trainerStats = [
  { key: 'myCourses', label: 'My Courses', icon: '📚' },
  { key: 'enrolledStudents', label: 'Enrolled Students', icon: '🎓' },
  { key: 'myJobPosts', label: 'Job Posts', icon: '💼' },
  { key: 'totalAssignments', label: 'Assignments', icon: '📝' },
  { key: 'pendingGrades', label: 'Pending Grades', icon: '⏳' },
];

const studentStats = [
  { key: 'enrolledCourses', label: 'Enrolled Courses', icon: '📚' },
  { key: 'availableCourses', label: 'Available Courses', icon: '📖' },
  { key: 'submittedAssignments', label: 'Submitted', icon: '✅' },
  { key: 'gradedAssignments', label: 'Graded', icon: '🏆' },
  { key: 'averageGrade', label: 'Avg. Grade', icon: '📊' },
  { key: 'appliedJobs', label: 'Jobs Applied', icon: '💼' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await getDashboardStats();
        setData(res);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statConfig =
    user?.role === 'admin' ? adminStats : user?.role === 'trainer' ? trainerStats : studentStats;

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="loading-screen" style={{ minHeight: '40vh' }}>
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Welcome, ${user?.name}!`}>
      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        {statConfig.map(({ key, label, icon }) => (
          <div key={key} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <h3>{label}</h3>
            <div className="stat-value">{data?.stats?.[key] ?? 0}</div>
          </div>
        ))}
      </div>

      {user?.role === 'student' && data?.stats?.courseProgress?.length > 0 && (
        <section className="progress-section">
          <h3>Course Progress</h3>
          {data.stats.courseProgress.map((item) => (
            <div key={item.courseId} className="progress-item">
              <div className="progress-header">
                <span>{item.title}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {user?.role === 'student' && !data?.stats?.courseProgress?.length && (
        <div className="card empty-state">
          <span>📚</span>
          <p>Enroll in courses to start tracking your learning progress!</p>
        </div>
      )}
    </Layout>
  );
}
