const mysql = require('mysql2/promise');


class DbConnection {
  constructor() {
    if (DbConnection.instance) {
      return DbConnection.instance;
    }

    this.connection = null;
    DbConnection.instance = this;
  }

  async connect(config) {
    if (!this.connection) {
      this.connection = await mysql.createConnection(config);
      console.log('Connected to MySQL!');
    }

    return this.connection;
  }

  async query(sql, values) {
    if (!this.connection) {
      throw new Error('Not connected to MySQL. Call connect() first.');
    }

    try {
      const [rows, fields] = await this.connection.execute(sql, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Connection to MySQL closed.');
      this.connection = null;
    }
  }
}

// Example usage:
// const mysqlInterface = new MySQLInterface();

// async function exampleUsage() {
//   const config = {
//     host: 'your-mysql-host',
//     user: 'your-username',
//     password: 'your-password',
//     database: 'your-database',
//   };

//   await mysqlInterface.connect(config);

//   try {
//     const result = await mysqlInterface.query('SELECT * FROM your_table');
//     console.log('Query result:', result);
//   } catch (error) {
//     console.error('Error executing query:', error);
//   } finally {
//     await mysqlInterface.close();
//   }
// }

// Uncomment the line below to run the example
// exampleUsage();
