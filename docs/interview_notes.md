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
