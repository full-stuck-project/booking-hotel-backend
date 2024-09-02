const express = require("express");
const port = 7777;
const app = express();
const { userRouter } = require("./routes/index.js");

// Middleware to parse JSON bodies
app.use(express.json());

// Use the routes from routes.js
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
