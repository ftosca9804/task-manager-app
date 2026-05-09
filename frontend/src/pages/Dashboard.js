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
              <span style={styles.logoIcon}>📋</span>
              <h1 style={styles.logoText}>TaskFlow</h1>
            </div>
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>{getInitials(user?.name)}</div>
                <span style={styles.userName}>{user?.name}</span>
              </div>
              <button onClick={logout} style={styles.logoutBtn}>
                <span>🚪</span> Salir
              </button>
            </div>
          </div>
        </div>
        <div style={styles.content}>
          <ProjectSelector currentProject={currentProject} onProjectChange={setCurrentProject} />
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📁</span>
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
            <span style={styles.logoIcon}>📋</span>
            <h1 style={styles.logoText}>TaskFlow</h1>
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>{getInitials(user?.name)}</div>
              <span style={styles.userName}>{user?.name}</span>
            </div>
            <button onClick={logout} style={styles.logoutBtn}>
              <span>🚪</span> Salir
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <ProjectSelector currentProject={currentProject} onProjectChange={setCurrentProject} />

        <div style={styles.statsContainer}>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea, #764ba2)'}}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tareas</div>
            </div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #48bb78, #38a169)'}}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.completed}</div>
              <div style={styles.statLabel}>Completadas</div>
            </div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ed8936, #dd6b20)'}}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.pending}</div>
              <div style={styles.statLabel}>Pendientes</div>
            </div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>🔍 Filtrar por:</span>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">📋 Todas las tareas</option>
              <option value="pending">⏰ Pendientes</option>
              <option value="in-progress">🔄 En progreso</option>
              <option value="completed">✅ Completadas</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>👥 Asignadas a:</span>
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
                    <span style={styles.emptyIcon}>🎯</span>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '32px'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
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
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  userName: {
    fontWeight: '500',
    color: '#333'
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #f56565, #e53e3e)',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease'
  },
  statIcon: {
    fontSize: '40px'
  },
  statInfo: {
    flex: 1
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white'
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px'
  },
  filterBar: {
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '15px 20px',
    marginBottom: '30px',
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
    color: 'white',
    fontWeight: '500'
  },
  filterSelect: {
    padding: '10px 15px',
    borderRadius: '10px',
    border: 'none',
    background: 'white',
    cursor: 'pointer'
  },
  taskCount: {
    color: 'white',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.2)',
    padding: '5px 15px',
    borderRadius: '20px'
  },
  tasksSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    color: 'white',
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
    padding: '60px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    color: 'white'
  },
  emptyIcon: {
    fontSize: '60px',
    display: 'block',
    marginBottom: '20px'
  }
};

export default Dashboard;
