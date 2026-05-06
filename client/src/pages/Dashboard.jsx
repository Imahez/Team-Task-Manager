import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Welcome, {user.name}</h1>
        <p className="subtitle">Here is an overview of your work across all projects.</p>
      </header>

      {stats && (
        <section className="dashboard-stats">
          <div className="stat-card">
            <h3>My Tasks</h3>
            <div className="stat-value">{stats.myAssignedTasks}</div>
          </div>
          <div className="stat-card">
            <h3>Due This Week</h3>
            <div className="stat-value">{stats.tasksDueThisWeek}</div>
          </div>
          <div className="stat-card danger-stat">
            <h3>Overdue Tasks</h3>
            <div className="stat-value text-danger">{stats.overdueTasks}</div>
          </div>
          <div className="stat-card">
            <h3>Total Team Tasks</h3>
            <div className="stat-value">{stats.totalTasks}</div>
          </div>
        </section>
      )}

      <section className="recent-projects mt-4">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="action-buttons">
          <Link to="/projects" className="btn btn-primary">Go to Projects</Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
