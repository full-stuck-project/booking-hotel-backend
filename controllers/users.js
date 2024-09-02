const {connection} = require("../db/db");
const { promisify } = require("util");

const query = promisify(connection.query).bind(connection);

const userController = {
  addUser: async (req, res) => {
    try {
      const { username, password, email } = req.body;

      const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
      const checkValues = [username, email];
      const results = await query(checkQuery, checkValues);

      if (results.length > 0) {
        return res.status(409).send("Username or email already exists");
      }

      const insertQuery =
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
      const insertValues = [username, password, email];
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
