const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
