const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { userRouter } = require("./routes/index.js");

// Middleware
app.use(express.json());
app.use(cors());



// Routes from
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
