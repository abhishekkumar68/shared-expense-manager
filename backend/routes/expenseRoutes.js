const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpensesByGroup,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

router.post('/', createExpense);
router.get('/group/:groupId', getExpensesByGroup);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
