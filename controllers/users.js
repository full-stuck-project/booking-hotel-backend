const { connection } = require("../db/db");
const { promisify } = require("util");

const query = promisify(connection.query).bind(connection);

const userController = {
  addUser: async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password, role } = req.body;

      // Check if email already exists
      const checkQuery = "SELECT * FROM users WHERE email = ?";
      const checkValues = [email];
      const results = await query(checkQuery, checkValues);

      if (results.length > 0) {
        return res.status(409).send("Email already exists");
      }

      const roleQuery = "SELECT id FROM roles WHERE id = ?";
      const roleResults = await query(roleQuery, [role]);

      if (roleResults.length === 0) {
        return res.status(400).send("Invalid role");
      }

      const insertQuery =
        "INSERT INTO users (role_id, first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
      const insertValues = [role, firstName, lastName, email, phone, password];
      await query(insertQuery, insertValues);

      res.status(201).send("User added successfully");
    } catch (err) {
      console.error("Error processing request:", err.stack);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = {
  userController,
};
