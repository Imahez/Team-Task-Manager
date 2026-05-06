import React from 'react';

const TaskCard = ({ task, onEdit, onDelete }) => {
  return (
    <div className={`task-card ${task.isOverdue ? 'overdue' : ''}`}>
      <div className="task-header">
        <h4>{task.title}</h4>
        <div className="task-actions">
          <button onClick={() => onEdit(task)}>Edit</button>
          <button className="delete-btn" onClick={() => onDelete(task.id)}>Del</button>
        </div>
      </div>
      
      <p className="task-desc">{task.description}</p>
      
      <div className="task-badges">
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>
        {task.isOverdue && <span className="overdue-badge">Overdue</span>}
      </div>

      <div className="task-footer">
        <span className="assignee" title={task.assignee_email}>
          {task.assignee_name || 'Unassigned'}
        </span>
        {task.due_date && (
          <span className={`due-date ${task.isOverdue ? 'text-danger' : ''}`}>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
