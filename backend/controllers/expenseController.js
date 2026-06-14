const { Expense, ExpenseSplit, Group, User, sequelize } = require('../models');

// POST /api/expenses — Create an expense with splits
const createExpense = async (req, res) => {
  // Use a transaction so that if splits fail, the expense is also rolled back
  const t = await sequelize.transaction();

  try {
    const { group_id, paid_by, description, amount, date, splits } = req.body;

    // Validation
    if (!group_id || !paid_by || !description || !amount || !date || !splits) {
      await t.rollback();
      return res.status(400).json({ error: 'group_id, paid_by, description, amount, date, and splits are required' });
    }

    if (!Array.isArray(splits) || splits.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'splits must be a non-empty array' });
    }

    // Verify group exists
    const group = await Group.findByPk(group_id);
    if (!group) {
      await t.rollback();
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify payer exists
    const payer = await User.findByPk(paid_by);
    if (!payer) {
      await t.rollback();
      return res.status(404).json({ error: 'Payer not found' });
    }

    // Validate that split amounts sum to the total expense amount
    const splitTotal = splits.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    if (Math.abs(splitTotal - parseFloat(amount)) > 0.01) {
      await t.rollback();
      return res.status(400).json({
        error: `Split amounts (${splitTotal}) do not match expense amount (${amount})`,
      });
    }

    // Create the expense
    const expense = await Expense.create(
      { group_id, paid_by, description, amount, date },
      { transaction: t }
    );

    // Create the splits
    const splitRecords = splits.map((s) => ({
      expense_id: expense.id,
      user_id: s.user_id,
      amount: s.amount,
    }));
    await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });

    await t.commit();

    // Fetch the created expense with its splits to return
    const result = await Expense.findByPk(expense.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    console.error('createExpense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/expenses/group/:groupId — Get all expenses for a group
const getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const expenses = await Expense.findAll({
      where: { group_id: groupId },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['date', 'DESC']],
    });

    res.json(expenses);
  } catch (error) {
    console.error('getExpensesByGroup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/expenses/:id — Get a single expense with splits
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('getExpenseById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/expenses/:id — Update an expense and its splits
const updateExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: 'Expense not found' });
    }

    const { description, amount, date, paid_by, splits } = req.body;

    if (!description || !amount || !date || !paid_by) {
      await t.rollback();
      return res.status(400).json({ error: 'description, amount, date, and paid_by are required' });
    }

    // Validate splits if provided
    if (splits) {
      const splitTotal = splits.reduce((sum, s) => sum + parseFloat(s.amount), 0);
      if (Math.abs(splitTotal - parseFloat(amount)) > 0.01) {
        await t.rollback();
        return res.status(400).json({
          error: `Split amounts (${splitTotal}) do not match expense amount (${amount})`,
        });
      }

      // Delete old splits and create new ones
      await ExpenseSplit.destroy({ where: { expense_id: expense.id }, transaction: t });
      const splitRecords = splits.map((s) => ({
        expense_id: expense.id,
        user_id: s.user_id,
        amount: s.amount,
      }));
      await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });
    }

    await expense.update({ description, amount, date, paid_by }, { transaction: t });
    await t.commit();

    // Fetch updated expense
    const result = await Expense.findByPk(expense.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    res.json(result);
  } catch (error) {
    await t.rollback();
    console.error('updateExpense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/expenses/:id — Delete an expense and its splits
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Splits are deleted automatically if onDelete: 'CASCADE' is set,
    // but we delete explicitly for clarity
    await ExpenseSplit.destroy({ where: { expense_id: expense.id } });
    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('deleteExpense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createExpense,
  getExpensesByGroup,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
