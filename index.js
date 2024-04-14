// Require NPM packages
require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create the connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'employee_tracker',
  password: 'password'
});

function start() {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add A Department',
      'Add A Role',
      'Add An Employee',
      'Exit'
    ]
  }).then(answer => {
    switch (answer.action) {
      case 'View All Departments':
        viewDepartments();
        break;
      case 'View All Roles':
        viewAllRoles();
        break;
      case 'View All Employees':
        viewAllEmployees();
        break;
      case 'Add A Department':
        addDepartment();
        break;
      case 'Add A Role':
        addRole();
        break;
      case 'Add An Employee':
        addEmployee();
        break;
      case 'Exit':
        console.log('Exiting application...');
        connection.end();
        process.exit(); 
        break;
      default:
        console.log('Invalid action!');
        start(); 
    }
  }).catch(err => {
    console.error('An error occurred:', err);
    start(); 
  });
}

// Start the application once connected to the database
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database.');
  start();
});

// Function to display all departments
function viewDepartments() {
  connection.promise().query('SELECT * FROM department')
    .then(([rows]) => {
      console.table(rows);
      start(); 
    })
    .catch(console.log);
}

// Function to display all roles
function viewAllRoles() {
  connection.promise().query('SELECT * FROM role')
    .then(([rows]) => {
      console.table(rows);
      start(); 
    })
    .catch(console.log);
}

// Function to display all employees
function viewAllEmployees() {
  connection.promise().query('SELECT * FROM employee')
    .then(([rows]) => {
      console.table(rows);
      start(); // Go back to start
    })
    .catch(console.log);
}

// Function to add a new department
function addDepartment() {
  inquirer.prompt({
    name: 'departmentName',
    type: 'input',
    message: 'What is the name of the department?'
  }).then(answer => {
    connection.promise().query('INSERT INTO department (name) VALUES (?)', [answer.departmentName])
      .then(() => {
        console.log('Department added!');
        start(); // Go back to start
      })
      .catch(console.log);
  });
}

// Function to add a new role
function addRole() {
  // Fetch departments to select from
  connection.promise().query('SELECT * FROM department')
    .then(([departments]) => {
      // Map department data to be used in inquirer choices
      const departmentChoices = departments.map(department => ({
        name: department.name,
        value: department.id
      }));
      
      inquirer.prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the title of the role?'
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What is the salary of the role?',
          // Ensure that the user input is a number
          validate: input => {
            if (isNaN(input)) {
              return 'Please enter a valid number for the salary.';
            }
            return true;
          }
        },
        {
          name: 'departmentId',
          type: 'list',
          message: 'Which department does the role belong to?',
          choices: departmentChoices
        }
      ]).then(answers => {
        connection.promise().query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
          [answers.title, parseFloat(answers.salary), answers.departmentId])
          .then(() => {
            console.log('Role added!');
            start(); // Go back to start
          })
          .catch(console.log);
      });
    })
    .catch(console.log);
}


// Function to add a new employee
function addEmployee() {
  // Fetch roles to select from
  connection.promise().query('SELECT * FROM role')
    .then(([roles]) => {
      // Map role data to be used in inquirer choices
      const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
      }));

      // Ask for employee details
      return inquirer.prompt([
        {
          name: 'firstName',
          type: 'input',
          message: 'What is the employee\'s first name?'
        },
        {
          name: 'lastName',
          type: 'input',
          message: 'What is the employee\'s last name?'
        },
        {
          name: 'roleId',
          type: 'list',
          message: 'What is the employee\'s role?',
          choices: roleChoices
        }
      ]);
    })
    .then(answers => {
      // Use the answers to insert a new employee into the database
      return connection.promise().query(
        'INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)',
        [answers.firstName, answers.lastName, answers.roleId]
      );
    })
    .then(() => {
      console.log('Employee added!');
      start(); // Go back to start
    })
    .catch(console.log); // Catch any errors that occur during the process
}

// Make sure to call addEmployee() somewhere in your code to execute this function.
