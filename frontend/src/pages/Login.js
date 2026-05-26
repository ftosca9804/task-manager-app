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
        <h1 style={styles.title}>Task Manager</h1>
        <p style={styles.subtitle}>Organiza tus tareas de manera eficiente</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
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
    background: '#f4f7fb',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 20px 45px rgba(15,23,42,0.08)',
    width: '100%',
    maxWidth: '450px',
    transition: 'transform 0.3s ease',
    animation: 'fadeIn 0.5s ease-out'
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: '800',
    color: '#111827',
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
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
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
    color: '#111827',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Login;
