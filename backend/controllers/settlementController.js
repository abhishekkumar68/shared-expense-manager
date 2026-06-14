const { Settlement, Group, User } = require('../models');

// POST /api/settlements — Create a settlement
const createSettlement = async (req, res) => {
  try {
    const { group_id, paid_by, paid_to, amount, date } = req.body;

    // Validation
    if (!group_id || !paid_by || !paid_to || !amount || !date) {
      return res.status(400).json({ error: 'group_id, paid_by, paid_to, amount, and date are required' });
    }

    if (paid_by === paid_to) {
      return res.status(400).json({ error: 'paid_by and paid_to cannot be the same user' });
    }

    // Verify group exists
    const group = await Group.findByPk(group_id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify both users exist
    const payer = await User.findByPk(paid_by);
    if (!payer) {
      return res.status(404).json({ error: 'Payer not found' });
    }

    const receiver = await User.findByPk(paid_to);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const settlement = await Settlement.create({ group_id, paid_by, paid_to, amount, date });

    // Fetch with associations
    const result = await Settlement.findByPk(settlement.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('createSettlement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/settlements/group/:groupId — Get all settlements for a group
const getSettlementsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const settlements = await Settlement.findAll({
      where: { group_id: groupId },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
      ],
      order: [['date', 'DESC']],
    });

    res.json(settlements);
  } catch (error) {
    console.error('getSettlementsByGroup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/settlements/:id — Get a single settlement
const getSettlementById = async (req, res) => {
  try {
    const settlement = await Settlement.findByPk(req.params.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    res.json(settlement);
  } catch (error) {
    console.error('getSettlementById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/settlements/:id — Update a settlement
const updateSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findByPk(req.params.id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    const { paid_by, paid_to, amount, date } = req.body;

    if (!paid_by || !paid_to || !amount || !date) {
      return res.status(400).json({ error: 'paid_by, paid_to, amount, and date are required' });
    }

    if (paid_by === paid_to) {
      return res.status(400).json({ error: 'paid_by and paid_to cannot be the same user' });
    }

    await settlement.update({ paid_by, paid_to, amount, date });

    const result = await Settlement.findByPk(settlement.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error('updateSettlement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/settlements/:id — Delete a settlement
const deleteSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findByPk(req.params.id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    await settlement.destroy();
    res.json({ message: 'Settlement deleted successfully' });
  } catch (error) {
    console.error('deleteSettlement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createSettlement,
  getSettlementsByGroup,
  getSettlementById,
  updateSettlement,
  deleteSettlement,
};
