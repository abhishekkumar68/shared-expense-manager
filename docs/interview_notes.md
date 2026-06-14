# Interview Preparation Notes

This document provides justifications for the architectural decisions to help prepare for the live technical interview.

## Milestone 1 Decisions

### Why MySQL?
- **Data Integrity**: An expense sharing app requires transactional integrity (ACID properties). A relational database prevents orphaned records and maintains strict schema rules, which is critical for financial data.
- **Relational Complexity**: Users belong to Groups, Users have Expenses, Expenses belong to Groups. SQL handles these multi-way joins more cleanly and efficiently than NoSQL.

### Why Sequelize?
- **Security & Safety**: It automatically parameterizes queries, effectively preventing SQL injection attacks.
- **Maintainability**: It allows us to define our schema as JavaScript models rather than writing raw SQL files, which makes the codebase easier to read and maintain for Node developers.
- **Associations**: It has built-in methods for handling associations (One-to-Many, Many-to-Many) which we will need for Users, Groups, and Expenses.

### Why React with Vite (Not CRA)?
- **Performance**: Vite uses native ES modules, leading to lightning-fast server start times and Hot Module Replacement (HMR).
- **Modern Standards**: CRA is largely deprecated in the React ecosystem. Vite is the modern standard for simple SPAs.

### Why not Redux?
- **Simplicity**: The app's state isn't complex enough to warrant the boilerplate of Redux. We can manage local state with `useState` and global user state (if necessary) with React Context, keeping the implementation simple and easy to explain.

---

## Milestone 2 Decisions — Database Schema Design

### Why a separate GroupMembers table (instead of a simple array on Group)?
- **Relational integrity**: In SQL, a Many-to-Many relationship between Users and Groups requires a junction table. Storing an array of user IDs in a column is an anti-pattern in relational databases — it breaks normalization, cannot be indexed, and makes joins impossible.
- **Membership history**: The `join_date` and `leave_date` columns on `GroupMembers` allow us to track when each user was active in a group. This is critical for determining which expenses a user should be included in (e.g., expenses added after a member left should not include them in the split).
- **`leave_date` is nullable**: A `NULL` value for `leave_date` means the member is still active. This is a standard convention — it avoids the need for a separate `is_active` boolean and makes date-range queries simpler.

### Why a separate ExpenseSplit table (instead of just dividing equally)?
- **Flexibility**: Not all expenses are split equally. For example, a hotel room might cost more for the person who got the suite. The `ExpenseSplit` table stores the exact amount each user owes for a given expense.
- **Auditability**: Each user's share is explicitly recorded. This makes balance calculations straightforward — just SUM the splits per user — rather than needing complex logic to infer shares.
- **Normalization**: Storing individual split amounts avoids repeating the splitting logic everywhere in the codebase. The data is the single source of truth.

### Why a separate Settlement table (not combined with Expense)?
- **Different business concept**: An Expense is a shared cost ("I paid 3000 for the hotel, split 3 ways"). A Settlement is a direct transfer ("Bob pays Alice 250 to clear his debt"). Mixing them in one table would require type flags and nullable columns, violating the Single Responsibility Principle.
- **Clean balance calculation**: To compute balances you need: (what each user owes from splits) minus (what each user paid as payer) minus (settlements made). Having settlements in their own table keeps these queries clean.

### Why DECIMAL(10,2) for monetary amounts?
- **Precision**: Floating point types (`FLOAT`, `DOUBLE`) cause rounding errors with currency (e.g., 0.1 + 0.2 ≠ 0.3 in IEEE 754). `DECIMAL(10,2)` stores exact values up to 10 digits with 2 decimal places, which is the industry standard for financial data.

### Why DATEONLY for expense and settlement dates?
- **Simplicity**: We only need the calendar date of an expense or settlement, not the exact time. `DATEONLY` stores `YYYY-MM-DD` without timezone complexity.

### Why `created_by` on Group?
- Tracks ownership. Knowing who created a group is useful for permission checks (e.g., only the creator can delete a group) and audit trails.

### Why `paid_by` and `paid_to` on Settlement?
- A settlement is always directional: User A pays User B. Two foreign keys make the direction explicit and queryable in both directions (settlements I made vs. settlements I received).

### Why `timestamps: true` on all models?
- Sequelize automatically adds `createdAt` and `updatedAt` columns. These are essential for debugging, sorting, and audit trails — with zero extra code.


### Why define associations in a central index.js?
- Sequelize requires both sides of an association to be loaded before they can be linked. A central `models/index.js` file imports all models and defines all associations in one place. This avoids circular dependency issues that would occur if models tried to import each other directly.

---

## Milestone 3 Decisions — Core API Design

### Why separate controllers and routes?
- **Single Responsibility Principle**: Routes define *what URL maps to what function*. Controllers contain *the business logic*. This separation keeps each file small, testable, and easy to explain.
- **Scalability**: As the app grows, you can add middleware (like auth) at the route level without touching business logic.

### Why does createGroup auto-add the creator as a member?
- A group with no members is useless. The creator should always be the first member. This prevents orphan groups and avoids requiring a separate API call after group creation.

### Why use Sequelize transactions in createExpense?
- Creating an expense involves two database operations: inserting the expense row and inserting multiple split rows. If the splits fail (e.g., invalid user_id), we must roll back the expense too. A transaction ensures **atomicity** — either everything succeeds or nothing is saved. This is critical for financial data integrity.

### Why validate that split amounts sum to the expense total?
- If splits don't add up, the balance calculation will be wrong. Catching this at the API layer prevents bad data from entering the database. This is a **data integrity check** — the earlier you catch bad data, the cheaper it is to fix.

### Why does removeMember set leave_date instead of deleting the row?
- **Audit trail**: Deleting the row destroys the history. Setting `leave_date` is a soft-delete pattern — we know who was in the group, when they joined, and when they left. This is essential for determining which expenses should include a particular member.
- **Rejoining**: A user who left can rejoin later, creating a new membership record with a new `join_date`.

### Why check for duplicate active membership before adding a member?
- Without this check, the same user could be added twice with `leave_date = null`, creating ambiguous membership records. The validation query `WHERE user_id = X AND group_id = Y AND leave_date IS NULL` ensures one active membership per user per group.

### Why validate paid_by ≠ paid_to on settlements?
- A settlement where someone pays themselves is logically meaningless and would corrupt balance calculations. This is a simple business rule validation that prevents nonsensical data.

### Why use explicit split deletion in deleteExpense (instead of CASCADE)?
- While Sequelize supports `onDelete: 'CASCADE'`, we delete splits explicitly in the controller for **clarity and predictability**. In an interview, it's easier to point to explicit code than to explain implicit ORM behavior. Explicit is better than implicit.

### Why order expenses and settlements by date DESC?
- The most recent transactions are the most relevant. Sorting by `date DESC` puts them at the top of the response, which is what users expect.
