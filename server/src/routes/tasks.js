const express = require('express');
const router = express.Router({ mergeParams: true });
const { check } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const requireProjectRole = require('../middleware/projectRole');
const taskController = require('../controllers/taskController');

// All task routes require auth and project membership
router.use(auth);
router.use(requireProjectRole(['admin', 'member']));

router.get('/', taskController.getTasks);

router.get('/dashboard', taskController.getProjectDashboard);

router.post('/', [
  check('title', 'Title is required').not().isEmpty()
], validate, taskController.createTask);

router.put('/:taskId', validate, taskController.updateTask);

router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
