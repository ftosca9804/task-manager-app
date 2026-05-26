const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getUserId = (user) => {
  return user?._id?.toString() || user?.toString();
};

const attachProjectUsers = async (project) => {
  if (!project) return null;

  const projectData = project.toObject ? project.toObject() : project;
  const memberUserIds = projectData.members
    .map(member => getUserId(member.user))
    .filter(Boolean);
  const ownerId = getUserId(projectData.owner);
  const userIds = [...new Set([ownerId, ...memberUserIds].filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('name email')
    .lean();
  const usersById = users.reduce((acc, user) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});

  return {
    ...projectData,
    owner: usersById[ownerId] || projectData.owner,
    members: projectData.members.map(member => {
      const memberUserId = getUserId(member.user);
      const memberUser = usersById[memberUserId];

      return {
        ...member,
        user: memberUser || member.user,
        displayName: memberUser?.name || '',
        displayEmail: memberUser?.email || ''
      };
    })
  };
};

const getProjectWithUsers = async (projectId) => {
  const project = await Project.findById(projectId);
  return attachProjectUsers(project);
};

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

    const populatedProject = await getProjectWithUsers(project._id);
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener proyectos del usuario
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.id
    });
    const projectsWithUsers = await Promise.all(projects.map(attachProjectUsers));
    res.json(projectsWithUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agregar miembro a proyecto
exports.addMember = async (req, res) => {
  try {
    const { projectId, email, role } = req.body;
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

    const isAlreadyMember = project.members.some(
      m => m.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'El usuario ya pertenece al proyecto' });
    }
    
    project.members.push({ user: userToAdd._id, role });
    await project.save();

    const populatedProject = await getProjectWithUsers(project._id);
    
    res.json({ message: 'Miembro agregado', project: populatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
