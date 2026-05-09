import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProjectSelector({ currentProject, onProjectChange }) {
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0 && !currentProject) {
        onProjectChange(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc
      });
      setProjects([...projects, response.data]);
      onProjectChange(response.data);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const inviteMember = async (email, projectId) => {
    try {
      await api.post('/projects/add-member', {
        projectId,
        email,
        role: 'member'
      });
      alert('Invitación enviada');
    } catch (error) {
      alert('Error al invitar usuario');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📁</span>
        <select
          value={currentProject?._id || ''}
          onChange={(e) => {
            const project = projects.find(p => p._id === e.target.value);
            onProjectChange(project);
          }}
          style={styles.select}
        >
          <option value="">Seleccionar proyecto</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        <button onClick={() => setShowNewProject(!showNewProject)} style={styles.addBtn}>
          + Nuevo
        </button>
      </div>

      {showNewProject && (
        <form onSubmit={createProject} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            style={styles.input}
          />
          <div style={styles.formButtons}>
            <button type="submit" style={styles.submitBtn}>Crear</button>
            <button type="button" onClick={() => setShowNewProject(false)} style={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {currentProject && (
        <div style={styles.projectInfo}>
          <div style={styles.projectName}>{currentProject.name}</div>
          {currentProject.description && (
            <div style={styles.projectDesc}>{currentProject.description}</div>
          )}
          <details style={styles.details}>
            <summary style={styles.summary}>👥 Miembros del equipo</summary>
            <div style={styles.membersList}>
              {currentProject.members?.map(member => (
                <div key={member.user._id} style={styles.member}>
                  <span>👤 {member.user.name}</span>
                  <span style={styles.roleBadge}>{member.role}</span>
                </div>
              ))}
              <div style={styles.inviteSection}>
                <input
                  type="email"
                  placeholder="Email para invitar"
                  id="inviteEmail"
                  style={styles.inviteInput}
                />
                <button
                  onClick={() => {
                    const email = document.getElementById('inviteEmail').value;
                    if (email) inviteMember(email, currentProject._id);
                  }}
                  style={styles.inviteBtn}
                >
                  Invitar
                </button>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  icon: {
    fontSize: '24px'
  },
  select: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '16px'
  },
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #48bb78, #38a169)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer'
  },
  form: {
    marginTop: '15px',
    padding: '15px',
    background: '#f7fafc',
    borderRadius: '10px'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  formButtons: {
    display: 'flex',
    gap: '10px'
  },
  submitBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#cbd5e0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  projectInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e2e8f0'
  },
  projectName: {
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '5px'
  },
  projectDesc: {
    color: '#718096',
    fontSize: '14px',
    marginBottom: '10px'
  },
  details: {
    marginTop: '10px'
  },
  summary: {
    cursor: 'pointer',
    color: '#667eea',
    fontWeight: '500'
  },
  membersList: {
    marginTop: '10px',
    padding: '10px',
    background: '#f7fafc',
    borderRadius: '8px'
  },
  member: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  roleBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    background: '#e2e8f0',
    borderRadius: '20px'
  },
  inviteSection: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px'
  },
  inviteInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  inviteBtn: {
    padding: '8px 16px',
    background: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default ProjectSelector;
