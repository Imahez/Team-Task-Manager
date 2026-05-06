const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const requireProjectRole = require('../middleware/projectRole');
const projectController = require('../controllers/projectController');
const memberController = require('../controllers/memberController');

// All project routes require auth
router.use(auth);

// Project Routes
router.get('/', projectController.getProjects);

router.post('/', [
  check('name', 'Name is required').not().isEmpty()
], validate, projectController.createProject);

router.get('/:id', requireProjectRole(['admin', 'member', 'any']), projectController.getProject);

router.put('/:id', [
  check('name', 'Name is required').optional().not().isEmpty()
], validate, requireProjectRole(['admin']), projectController.updateProject);

router.delete('/:id', requireProjectRole(['admin']), projectController.deleteProject);

// Member Routes
router.post('/:id/members', [
  check('email', 'Valid email is required').isEmail()
], validate, requireProjectRole(['admin']), memberController.addMember);

router.put('/:id/members/:userId', requireProjectRole(['admin']), memberController.updateRole);

router.delete('/:id/members/:userId', requireProjectRole(['admin']), memberController.removeMember);

module.exports = router;
