const express = require('express');
const router = express.Router();
const {
  addMember,
  getMembers,
  removeMember,
} = require('../controllers/memberController');

// Member routes are nested under /api/groups/:groupId/members
router.post('/:groupId/members', addMember);
router.get('/:groupId/members', getMembers);
router.put('/:groupId/members/:userId/leave', removeMember);

module.exports = router;
