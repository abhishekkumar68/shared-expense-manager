const sequelize = require('../config/db');

const User = require('./User');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Expense = require('./Expense');
const ExpenseSplit = require('./ExpenseSplit');
const Settlement = require('./Settlement');

// ===== ASSOCIATIONS =====

// --- User <-> Group (creator) ---
// A User can create many Groups. A Group has one creator.
User.hasMany(Group, { foreignKey: 'created_by', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// --- User <-> Group (membership via GroupMember) ---
// A User can be a member of many Groups. A Group has many members.
User.hasMany(GroupMember, { foreignKey: 'user_id', as: 'memberships' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'members' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

// --- Expense ---
// An Expense belongs to a Group and has a payer (User).
Group.hasMany(Expense, { foreignKey: 'group_id', as: 'expenses' });
Expense.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

User.hasMany(Expense, { foreignKey: 'paid_by', as: 'paidExpenses' });
Expense.belongsTo(User, { foreignKey: 'paid_by', as: 'payer' });

// --- ExpenseSplit ---
// An Expense is split among multiple Users.
Expense.hasMany(ExpenseSplit, { foreignKey: 'expense_id', as: 'splits' });
ExpenseSplit.belongsTo(Expense, { foreignKey: 'expense_id', as: 'expense' });

User.hasMany(ExpenseSplit, { foreignKey: 'user_id', as: 'expenseSplits' });
ExpenseSplit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Settlement ---
// A Settlement belongs to a Group and involves two Users (payer and receiver).
Group.hasMany(Settlement, { foreignKey: 'group_id', as: 'settlements' });
Settlement.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

User.hasMany(Settlement, { foreignKey: 'paid_by', as: 'settlementsMade' });
Settlement.belongsTo(User, { foreignKey: 'paid_by', as: 'payer' });

User.hasMany(Settlement, { foreignKey: 'paid_to', as: 'settlementsReceived' });
Settlement.belongsTo(User, { foreignKey: 'paid_to', as: 'receiver' });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
};
