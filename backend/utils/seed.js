/**
 * Seed script: Populates the database with sample data for testing.
 * Run with: node utils/seed.js
 *
 * This script:
 * 1. Syncs all models (creates tables if they don't exist, drops existing data with force:true)
 * 2. Creates sample users, groups, memberships, expenses, splits, and settlements.
 */

const { sequelize, User, Group, GroupMember, Expense, ExpenseSplit, Settlement } = require('../models');

const seed = async () => {
  try {
    // force:true drops existing tables and recreates them — only for development!
    await sequelize.sync({ force: true });
    console.log('All tables created successfully.');

    // --- Users ---
    const user1 = await User.create({ name: 'Alice', email: 'alice@example.com', password: 'hashed_pw_1' });
    const user2 = await User.create({ name: 'Bob', email: 'bob@example.com', password: 'hashed_pw_2' });
    const user3 = await User.create({ name: 'Charlie', email: 'charlie@example.com', password: 'hashed_pw_3' });
    console.log('Users created.');

    // --- Groups ---
    const group1 = await Group.create({ name: 'Goa Trip', description: 'Vacation expenses', created_by: user1.id });
    const group2 = await Group.create({ name: 'Roommates', description: 'Monthly shared bills', created_by: user2.id });
    console.log('Groups created.');

    // --- Group Members ---
    await GroupMember.create({ user_id: user1.id, group_id: group1.id, join_date: new Date('2025-01-01') });
    await GroupMember.create({ user_id: user2.id, group_id: group1.id, join_date: new Date('2025-01-01') });
    await GroupMember.create({ user_id: user3.id, group_id: group1.id, join_date: new Date('2025-01-05'), leave_date: new Date('2025-01-10') });
    await GroupMember.create({ user_id: user2.id, group_id: group2.id, join_date: new Date('2025-02-01') });
    await GroupMember.create({ user_id: user3.id, group_id: group2.id, join_date: new Date('2025-02-01') });
    console.log('Group members created.');

    // --- Expenses ---
    const expense1 = await Expense.create({
      group_id: group1.id,
      paid_by: user1.id,
      description: 'Hotel booking',
      amount: 3000.00,
      date: '2025-01-05',
    });
    const expense2 = await Expense.create({
      group_id: group1.id,
      paid_by: user2.id,
      description: 'Dinner',
      amount: 1500.00,
      date: '2025-01-06',
    });
    console.log('Expenses created.');

    // --- Expense Splits ---
    // Hotel: 3000 split among Alice, Bob, Charlie (1000 each)
    await ExpenseSplit.create({ expense_id: expense1.id, user_id: user1.id, amount: 1000.00 });
    await ExpenseSplit.create({ expense_id: expense1.id, user_id: user2.id, amount: 1000.00 });
    await ExpenseSplit.create({ expense_id: expense1.id, user_id: user3.id, amount: 1000.00 });

    // Dinner: 1500 split between Alice and Bob (750 each)
    await ExpenseSplit.create({ expense_id: expense2.id, user_id: user1.id, amount: 750.00 });
    await ExpenseSplit.create({ expense_id: expense2.id, user_id: user2.id, amount: 750.00 });
    console.log('Expense splits created.');

    // --- Settlements ---
    await Settlement.create({
      group_id: group1.id,
      paid_by: user2.id,    // Bob pays Alice
      paid_to: user1.id,
      amount: 250.00,
      date: '2025-01-15',
    });
    console.log('Settlements created.');

    console.log('\n--- Seed completed successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
