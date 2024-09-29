import React from 'react';
import './TaskCard.css';  



interface TaskCardProps {
  id: string;
  title: string;
  status: string;
  priority: number;
  userId: number;
  users: any[];
}

const TaskCard: React.FC<TaskCardProps> = ({id, title, status, priority, userId, users }) => {
  const user = users.find((user) => user.id === userId);
  const userName = user ? user.name : 'Unknown User';

  
  const priorityClass = [
    'priority-no',   
    'priority-low',  
    'priority-medium', 
    'priority-high',  
    'priority-urgent',  
  ][priority] || 'priority-no';


  const getPriorityImage = (priority: number) => {
    switch (priority) {
      case 1:
        return <img src=".\Img - Low Priority.svg" alt="Low Priority" className="priority-icon" />;
      case 2:
        return <img src=".\Img - Medium Priority.svg" alt="Medium Priority" className="priority-icon" />;
      case 3:
        return <img src=".\Img - High Priority.svg" alt="High Priority" className="priority-icon" />;
      case 4:
        return <img src=".\SVG - Urgent Priority colour.svg" alt="Urgent Priority" className="priority-icon" />;
      default:
        return <img src=".\No-priority.svg" alt="No Priority" className="priority-icon" />;
    }
  };

  return (
    <div className="task-card">
      <div className="card-actions">
        <div className="card-header">
         <h4>{id}</h4>
          <h3>{title}</h3>
          <p>{status}</p>
        </div>
        <span className="tag user">{userName}</span>
      </div>
      <div className="card-details">
        <span className={`tag priority ${priorityClass}`}>
    
          {getPriorityImage(priority)}
          {['No Priority', 'Low', 'Medium', 'High', 'Urgent'][priority]}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
