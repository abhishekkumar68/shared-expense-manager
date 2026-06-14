const { GroupMember, User, Group } = require('../models');

// POST /api/groups/:groupId/members — Add a member to a group
const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id } = req.body;

    // Validation
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Verify group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already an active member (leave_date is null)
    const existingMember = await GroupMember.findOne({
      where: { user_id, group_id: groupId, leave_date: null },
    });
    if (existingMember) {
      return res.status(400).json({ error: 'User is already an active member of this group' });
    }

    const member = await GroupMember.create({
      user_id,
      group_id: groupId,
      join_date: new Date(),
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('addMember error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/groups/:groupId/members — Get all members of a group
const getMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = await GroupMember.findAll({
      where: { group_id: groupId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    res.json(members);
  } catch (error) {
    console.error('getMembers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/groups/:groupId/members/:userId/leave — Member leaves a group
const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    // Find the active membership record
    const member = await GroupMember.findOne({
      where: { user_id: userId, group_id: groupId, leave_date: null },
    });

    if (!member) {
      return res.status(404).json({ error: 'Active membership not found' });
    }

    // Set leave_date instead of deleting — preserves history
    await member.update({ leave_date: new Date() });

    res.json({ message: 'Member has left the group', member });
  } catch (error) {
    console.error('removeMember error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { addMember, getMembers, removeMember };
