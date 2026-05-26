import React, { useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export function TaskCard({ task, onTaskUpdate }) {
  const { user } = useContext(AuthContext);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { ...task, status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updatePriority = async (newPriority) => {
    try {
      await api.put(`/tasks/${task._id}`, { ...task, priority: newPriority });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const deleteTask = async () => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      try {
        await api.delete(`/tasks/${task._id}`);
        onTaskUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const priorityConfig = {
    low: { color: '#16a34a', label: 'Baja', bg: '#f0fdf4' },
    medium: { color: '#d97706', label: 'Media', bg: '#fffbeb' },
    high: { color: '#dc2626', label: 'Alta', bg: '#fef2f2' }
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: '#6b7280' },
    'in-progress': { label: 'En progreso', color: '#2563eb' },
    completed: { label: 'Completada', color: '#16a34a' }
  };

  const config = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  const assignedUserName = task.assignedTo?.name || task.assignedTo?.email || 'Sin asignar';
  const isAssignedToMe = task.assignedTo?._id === user?._id;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: isDragging ? '0 18px 35px rgba(15,23,42,0.12)' : '0 8px 24px rgba(15,23,42,0.06)',
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${config.color}`,
        borderTop: '1px solid #e5e7eb',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative'
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              background: config.bg,
              color: config.color
            }}>
              {config.label}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              background: '#f3f4f6',
              color: status.color
            }}>
              {status.label}
            </span>
            {task.assignedTo && (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                background: isAssignedToMe ? '#ecfdf5' : '#eff6ff',
                color: isAssignedToMe ? '#047857' : '#1d4ed8'
              }}>
                {isAssignedToMe ? 'Mía' : assignedUserName}
              </span>
            )}
            {!task.assignedTo && (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                background: '#f3f4f6',
                color: '#6b7280'
              }}>
                Sin asignar
              </span>
            )}
          </div>
          <h3 style={{ 
            margin: '10px 0', 
            fontSize: '18px', 
            color: '#2d3748',
            textDecoration: task.status === 'completed' ? 'line-through' : 'none'
          }}>
            {task.title}
          </h3>
          {task.description && (
            <p style={{ color: '#718096', marginBottom: '15px', fontSize: '14px' }}>
              {task.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <select
              value={task.priority}
              onChange={(e) => updatePriority(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
            <select
              value={task.status}
              onChange={(e) => updateStatus(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value="pending">Pendiente</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>
        <button
          onClick={deleteTask}
          style={{
            background: '#fff',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Eliminar
        </button>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        fontSize: '11px',
        color: '#cbd5e0'
      }}>
        ⋮⋮
      </div>
    </div>
  );
}
