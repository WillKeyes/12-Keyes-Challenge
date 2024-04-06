require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedDatabase() {
  // Database configuration
  const config = {
    host: 'localhost',
  user: 'root',
  database: 'employee_tracker',
  password: 'password'
  };

  // Establish a database connection
  const connection = await mysql.createConnection(config);

  // Departments
  const departments = [
    ['Engineering'],
    ['Finance'],
    ['Sales'],
    ['Marketing'],
  ];

  // Roles
  const roles = [
    ['Software Engineer', 60000, 1],
    ['Sales Representative', 50000, 3],
    ['Accountant', 55000, 2],
    ['Marketing Manager', 65000, 4],
  ];

  // Employees
  const employees = [
    ['John', 'Doe', 1, null],
    ['Jane', 'Smith', 2, null],
    ['Emily', 'Jones', 3, 1],
    ['Michael', 'Brown', 4, 2],
  ];

  try {
    // Seed departments
    await Promise.all(
      departments.map(async (dept) => {
        await connection.query('INSERT INTO department (name) VALUES (?)', dept);
      })
    );

    // Seed roles
    await Promise.all(
      roles.map(async (role) => {
        await connection.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', role);
      })
    );

    // Seed employees
    await Promise.all(
      employees.map(async (emp) => {
        await connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', emp);
      })
    );

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

seedDatabase();
