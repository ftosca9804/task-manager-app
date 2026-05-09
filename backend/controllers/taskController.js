const Task = require('../models/Task');
const Project = require('../models/Project');

// Verificar acceso al proyecto
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.members.some(m => m.user.toString() === userId);
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }
    
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('order');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, projectId, assignedTo } = req.body;
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }
    
    const task = await Task.create({
      title,
      description,
      priority,
      project: projectId,
      createdBy: req.user.id,
      assignedTo: assignedTo || req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    const hasAccess = await checkProjectAccess(task.project, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    const hasAccess = await checkProjectAccess(task.project, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorderTasks = async (req, res) => {
  try {
    const { tasks, projectId } = req.body;
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso' });
    }
    
    for (const task of tasks) {
      await Task.findOneAndUpdate(
        { _id: task.id, project: projectId },
        { order: task.order }
      );
    }
    res.json({ message: 'Orden actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
