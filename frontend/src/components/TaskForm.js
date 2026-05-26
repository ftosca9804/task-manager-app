import React, { useState, useEffect } from 'react';
import api from '../services/api';

const getMemberId = (member) => member.user?._id || member.user;
const getMemberName = (member) => (
  member.displayName ||
  member.user?.name ||
  member.displayEmail ||
  member.user?.email ||
  'Pendiente de datos'
);

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
      setAssignedTo(getMemberId(currentProject.members[0]) || '');
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

  const priorityColors = {
    low: '#16a34a',
    medium: '#d97706',
    high: '#dc2626'
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Crear nueva tarea</h3>
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
                    border: priority === p ? `1px solid ${priorityColors[p]}` : '1px solid #d1d5db'
                  }}
                >
                  {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
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
              {members.map(member => {
                const memberId = getMemberId(member);

                return (
                  <option key={memberId} value={memberId}>
                    {getMemberName(member)}
                  </option>
                );
              })}
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
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '25px',
    marginBottom: '24px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#111827'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
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
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default TaskForm;
