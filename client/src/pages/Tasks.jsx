import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { AuthContext } from '../context/AuthContext';

const Tasks = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Error fetching project data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (currentTask && currentTask.id) {
        await api.put(`/projects/${id}/tasks/${currentTask.id}`, taskData);
      } else {
        await api.post(`/projects/${id}/tasks`, taskData);
      }
      fetchData();
      setShowTaskModal(false);
    } catch (error) {
      alert(error.response?.data?.error || "Error saving task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Error deleting task");
    }
  };

  const openNewTaskModal = () => {
    setCurrentTask(null);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setCurrentTask(task);
    setShowTaskModal(true);
  };

  const filteredTasks = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks;

  const renderColumn = (status, title, colorClass) => {
    const colTasks = filteredTasks.filter(t => t.status === status);
    return (
      <div className={`kanban-column ${colorClass}`}>
        <h3 className="column-title">
          {title} <span className="task-count-badge">{colTasks.length}</span>
        </h3>
        <div className="task-list">
          {colTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={openEditTaskModal} 
              onDelete={handleDeleteTask} 
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-spinner">Loading board...</div>;
  if (!project) return <div className="error-message">Project not found.</div>;

  return (
    <div className="page-container kanban-page">
      <div className="section-header">
        <div>
          <Link to={`/projects/${id}`} className="back-link">← Back to Project</Link>
          <h1>{project.name} Board</h1>
        </div>
        <div className="board-actions">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button className="btn btn-primary" onClick={openNewTaskModal}>+ Add Task</button>
        </div>
      </div>

      <div className="kanban-board">
        {renderColumn('todo', 'To Do', 'column-blue')}
        {renderColumn('in_progress', 'In Progress', 'column-amber')}
        {renderColumn('done', 'Done', 'column-green')}
      </div>

      <TaskModal 
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        task={currentTask}
        teamMembers={project.members || []}
      />
    </div>
  );
};

export default Tasks;
