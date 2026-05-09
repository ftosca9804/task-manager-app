import React, { useState, useEffect } from 'react';
import api from '../services/api';

export function TaskForm({ onTaskCreated, currentProject }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProject?.members) {
      setMembers(currentProject.members);
      setAssignedTo(currentProject.members[0]?.user._id || '');
    }
  }, [currentProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !currentProject) return;
    
    setLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        projectId: currentProject._id,
        assignedTo
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityEmojis = {
    low: '🟢',
    medium: '🟠',
    high: '🔴'
  };

  const priorityColors = {
    low: '#48bb78',
    medium: '#ed8936',
    high: '#f56565'
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>✨ Crear Nueva Tarea</h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <textarea
            placeholder="Describe tu tarea (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            rows="3"
          />
        </div>
        <div style={styles.row}>
          <div style={styles.priorityGroup}>
            <span style={styles.label}>Prioridad:</span>
            <div style={styles.priorityButtons}>
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    ...styles.priorityBtn,
                    background: priority === p ? priorityColors[p] : '#f7fafc',
                    color: priority === p ? 'white' : '#4a5568',
                    border: priority === p ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  {priorityEmojis[p]} {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={styles.assignGroup}>
            <span style={styles.label}>Asignar a:</span>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={styles.assignSelect}
            >
              {members.map(member => (
                <option key={member.user._id} value={member.user._id}>
                  👤 {member.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Creando...' : '+ Agregar Tarea'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#2d3748'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    outline: 'none',
    resize: 'vertical'
  },
  row: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  priorityGroup: {
    flex: 1
  },
  assignGroup: {
    flex: 1
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568'
  },
  priorityButtons: {
    display: 'flex',
    gap: '10px'
  },
  priorityBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  assignSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default TaskForm;
