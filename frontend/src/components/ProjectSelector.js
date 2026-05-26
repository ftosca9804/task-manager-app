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
      if (currentProject) {
        const updatedCurrentProject = response.data.find(project => project._id === currentProject._id);
        if (updatedCurrentProject) {
          onProjectChange(updatedCurrentProject);
        }
      } else if (response.data.length > 0) {
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
      const response = await api.post('/projects/add-member', {
        projectId,
        email,
        role: 'member'
      });
      const updatedProject = response.data.project;
      setProjects(projects.map(project => (
        project._id === updatedProject._id ? updatedProject : project
      )));
      onProjectChange(updatedProject);
      alert('Invitación enviada');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al invitar usuario');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
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
            <summary style={styles.summary}>Miembros del equipo</summary>
            <div style={styles.membersList}>
              {currentProject.members?.map(member => (
                <div key={getMemberId(member)} style={styles.member}>
                  <span>{getMemberName(member)}</span>
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
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)'
  },
  header: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  select: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px'
  },
  addBtn: {
    padding: '10px 20px',
    background: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  form: {
    marginTop: '15px',
    padding: '15px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  formButtons: {
    display: 'flex',
    gap: '10px'
  },
  submitBtn: {
    padding: '8px 16px',
    background: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  projectInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e7eb'
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
    color: '#111827',
    fontWeight: '500'
  },
  membersList: {
    marginTop: '10px',
    padding: '10px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  member: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  roleBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    background: '#e5e7eb',
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
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  inviteBtn: {
    padding: '8px 16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default ProjectSelector;
