# Architecture and Engineering Decisions

This file tracks the major technical decisions made during the development of this placement assignment.

## Backend Framework: Node.js with Express
Selected for its simplicity, widespread industry usage, and easy REST API creation.

## Frontend Framework: React (Vite)
Chosen for component-based architecture. Vite is used over Create React App because of significantly faster build and hot-module-replacement times.

## Database: MySQL
A relational database ensures data integrity, which is essential for financial/expense-tracking applications.

## ORM: Sequelize
Sequelize provides a robust abstraction over raw SQL queries, making schema definition, migrations, and relationship management easier while maintaining security against SQL injection.
