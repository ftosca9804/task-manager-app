import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>📋</span>
        </div>
        <h1 style={styles.title}>Task Manager</h1>
        <p style={styles.subtitle}>Organiza tus tareas de manera eficiente</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="📧 Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="🔒 Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : '🚀 Iniciar Sesión'}
          </button>
        </form>
        
        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>o</span>
          <span style={styles.dividerLine}></span>
        </div>
        
        <p style={styles.link}>
          ¿No tienes cuenta? <Link to="/register" style={styles.linkHighlight}>Crea una aquí</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '50px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
    width: '100%',
    maxWidth: '450px',
    transition: 'transform 0.3s ease',
    animation: 'fadeIn 0.5s ease-out'
  },
  iconContainer: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  icon: {
    fontSize: '60px',
    display: 'inline-block',
    animation: 'pulse 2s infinite'
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
    gap: '10px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e0e0e0'
  },
  dividerText: {
    color: '#999',
    fontSize: '14px'
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  },
  linkHighlight: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Login;
