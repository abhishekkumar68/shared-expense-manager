const { Group, GroupMember, User } = require('../models');

// POST /api/groups — Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, created_by } = req.body;

    // Validation
    if (!name || !created_by) {
      return res.status(400).json({ error: 'name and created_by are required' });
    }

    // Verify the creator exists
    const user = await User.findByPk(created_by);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const group = await Group.create({ name, description, created_by });

    // Automatically add the creator as a member
    await GroupMember.create({
      user_id: created_by,
      group_id: group.id,
      join_date: new Date(),
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('createGroup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/groups — Get all groups
const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.json(groups);
  } catch (error) {
    console.error('getAllGroups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/groups/:id — Get a single group with its members
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: GroupMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('getGroupById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/groups/:id — Update a group
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    await group.update({ name, description });
    res.json(group);
  } catch (error) {
    console.error('updateGroup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/groups/:id — Delete a group
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.destroy();
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('deleteGroup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createGroup, getAllGroups, getGroupById, updateGroup, deleteGroup };
