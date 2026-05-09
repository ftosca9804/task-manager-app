const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));

app.get('/', (req, res) => {
  res.json({ message: 'API de Task Manager funcionando 🚀' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado correctamente'))
  .catch(err => console.error('❌ Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
