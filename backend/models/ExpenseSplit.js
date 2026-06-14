const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExpenseSplit = sequelize.define('ExpenseSplit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  expense_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'expenses',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'expense_splits',
  timestamps: true,
});

module.exports = ExpenseSplit;
