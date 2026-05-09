const express = require('express');
const {
  createProject,
  getUserProjects,
  addMember
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.post('/', createProject);
router.get('/', getUserProjects);
router.post('/add-member', addMember);

module.exports = router;
