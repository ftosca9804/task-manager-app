const Project = require('../models/Project');
const Task = require('../models/Task');

// Crear proyecto
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener proyectos del usuario
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.id
    }).populate('owner', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agregar miembro a proyecto
exports.addMember = async (req, res) => {
  try {
    const { projectId, email, role } = req.body;
    const User = require('../models/User');
    
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    // Verificar que quien agrega es admin
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    project.members.push({ user: userToAdd._id, role });
    await project.save();
    
    res.json({ message: 'Miembro agregado', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
