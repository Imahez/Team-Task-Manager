import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [error, setError] = useState('');
  
  const isOwner = project?.owner_id === user?.id;
  const isAdmin = isOwner || project?.members?.find(m => m.id === user?.id)?.role === 'admin';

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (error) {
      console.error("Error fetching project data", error);
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail, role: newMemberRole });
      setNewMemberEmail('');
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member.');
    }
  };

  if (loading) return <div className="loading-spinner">Loading project...</div>;
  if (!project) return <div className="error-message">Project not found.</div>;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1>{project.name}</h1>
          <p className="subtitle">{project.description}</p>
        </div>
        <Link to={`/projects/${id}/tasks`} className="btn btn-primary">Go to Kanban Board</Link>
      </div>

      <div className="project-members-section">
        <h2>Team Members</h2>
        
        {error && <div className="alert alert-error">{error}</div>}

        {isAdmin && (
          <form className="add-member-form" onSubmit={handleAddMember}>
            <input 
              type="email" 
              placeholder="User Email" 
              value={newMemberEmail} 
              onChange={(e) => setNewMemberEmail(e.target.value)} 
              required 
            />
            <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn btn-secondary">Add Member</button>
          </form>
        )}

        <div className="members-list">
          {project.members?.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <div className="user-avatar small-avatar">{member.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="member-name">{member.name}</p>
                  <p className="member-email">{member.email}</p>
                </div>
              </div>
              <div className="member-actions">
                <span className={`role-badge role-${member.role}`}>{member.role}</span>
                {isAdmin && member.id !== project.owner_id && (
                  <button className="delete-btn" onClick={() => handleRemoveMember(member.id)}>Remove</button>
                )}
                {member.id === project.owner_id && <span className="owner-badge">Owner</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
