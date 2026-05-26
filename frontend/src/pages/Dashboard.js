import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import ProjectSelector from '../components/ProjectSelector';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentProject, setCurrentProject] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [assignedFilter, setAssignedFilter] = useState('all');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    if (!currentProject) return;
    
    try {
      const response = await api.get(`/tasks?projectId=${currentProject._id}`);
      setTasks(response.data);
      updateStats(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  const updateStats = (tasksList) => {
    const total = tasksList.length;
    const completed = tasksList.filter(t => t.status === 'completed').length;
    const pending = tasksList.filter(t => t.status !== 'completed').length;
    setStats({ total, completed, pending });
  };

  useEffect(() => {
    if (currentProject) {
      fetchTasks();
    }
  }, [currentProject]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t._id === active.id);
      const newIndex = tasks.findIndex((t) => t._id === over.id);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);
      
      try {
        await api.put('/tasks/reorder', {
          tasks: newTasks.map((task, idx) => ({ id: task._id, order: idx })),
          projectId: currentProject._id
        });
      } catch (error) {
        console.error('Error reordering:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (assignedFilter === 'mine' && task.assignedTo?._id !== user?._id) return false;
    if (assignedFilter === 'others' && task.assignedTo?._id === user?._id) return false;
    return true;
  });

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (!currentProject) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logoSection}>
              <h1 style={styles.logoText}>TaskFlow</h1>
            </div>
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>{getInitials(user?.name)}</div>
                <span style={styles.userName}>{user?.name}</span>
              </div>
              <button onClick={logout} style={styles.logoutBtn}>
                Salir
              </button>
            </div>
          </div>
        </div>
        <div style={styles.content}>
          <ProjectSelector currentProject={currentProject} onProjectChange={setCurrentProject} />
          <div style={styles.emptyState}>
            <h3>Selecciona o crea un proyecto</h3>
            <p>Comienza creando un proyecto para ti o tu equipo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <h1 style={styles.logoText}>TaskFlow</h1>
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>{getInitials(user?.name)}</div>
              <span style={styles.userName}>{user?.name}</span>
            </div>
            <button onClick={logout} style={styles.logoutBtn}>
              Salir
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <ProjectSelector currentProject={currentProject} onProjectChange={setCurrentProject} />

        <div style={styles.statsContainer}>
          <div style={{...styles.statCard, borderTopColor: '#2563eb'}}>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tareas</div>
            </div>
          </div>
          <div style={{...styles.statCard, borderTopColor: '#16a34a'}}>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.completed}</div>
              <div style={styles.statLabel}>Completadas</div>
            </div>
          </div>
          <div style={{...styles.statCard, borderTopColor: '#f59e0b'}}>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.pending}</div>
              <div style={styles.statLabel}>Pendientes</div>
            </div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Estado</span>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Todas las tareas</option>
              <option value="pending">Pendientes</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Asignadas a</span>
            <select 
              value={assignedFilter} 
              onChange={(e) => setAssignedFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Todos</option>
              <option value="mine">Solo a mí</option>
              <option value="others">A otros</option>
            </select>
          </div>
          <div style={styles.taskCount}>
            {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <TaskForm onTaskCreated={fetchTasks} currentProject={currentProject} />

        <div style={styles.tasksSection}>
          <h3 style={styles.sectionTitle}>Mis Tareas</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(t => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={styles.tasksGrid}>
                {filteredTasks.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>¡No hay tareas! Crea una nueva arriba</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onTaskUpdate={fetchTasks} currentProject={currentProject} />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f4f7fb',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '0'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  userName: {
    fontWeight: '500',
    color: '#374151'
  },
  logoutBtn: {
    background: '#fff',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)'
  },
  statInfo: {
    flex: 1
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#111827'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '14px'
  },
  filterBar: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '15px 20px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  filterLabel: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer'
  },
  taskCount: {
    color: '#374151',
    fontSize: '14px',
    background: '#f3f4f6',
    padding: '5px 15px',
    borderRadius: '999px'
  },
  tasksSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    color: '#111827',
    fontSize: '20px',
    marginBottom: '20px',
    fontWeight: '600'
  },
  tasksGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    color: '#4b5563'
  }
};

export default Dashboard;
