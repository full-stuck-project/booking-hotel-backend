const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getMailTemplateWithLink, mail } = require("./mail");
const { getResetToken } = require("./encrypt");
const { UserController } = require("../controllers/users");
const updateResetToken = UserController.updateResetToken;
const getUserByToken = UserController.getUserToken;
const deleteToken = UserController.getUserToken;
const util = require('util');
const { jwtDecode } = require("jwt-decode");




module.exports = {
  generateAccessToken: function (user) {
    return jwt.sign(
      {
        username: user.username,
        email: user.email,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "10s",
      }
    );
  },
  generateRefreshToken: function (user) {
    return jwt.sign(
      {
        username: user.username,
        email: user.email,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "1d",
      }
    );
  },
  login: async (req, res) => {
    try {
      let email = req.body.email;
      let password = req.body.password;

      let user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ err: `email ${email} not found` });
      }

      let match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ err: "Invalid password" });
      }

      let accessToken = module.exports.generateAccessToken(user);
      let refreshToken = module.exports.generateRefreshToken(user);

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { refreshToken },
        { new: true }
      );

      res.status(200).json({
        userId: user.id,
        username: user.username,
        auth: true,
        accessToken,
        refreshToken,
        msg: "Congratulations! You've logged in!",
      });
    } catch (err) {
      console.log(`Error: \n${err.message}`);
      res.status(500).json({ err: err.message });
    }
  },
  logout: async function (req, res) {
    const refreshToken = req.body.token;
    const id = req.body.id;
    console.log(refreshToken);
    console.log(id);
    // send err if there is no token or it is invalid
    if (!refreshToken) {
      res.json({ auth: false, message: `no token 1` });
    }
    let tokenExist = await getUserByToken(refreshToken, id);
    console.log(tokenExist);
    if (!tokenExist.message) {
      return res.json({ auth: false, message: `no token 2` });
    }

    deleteToken(id);

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ auth: false, message: "User not found" });
    }

    // Generate new tokens
    let newAccessToken = module.exports.generateAccessToken(user);
    let newRefreshToken = module.exports.generateRefreshToken(user);

    // Optionally save the new refresh token
    await User.findByIdAndUpdate(id, { refreshToken: newRefreshToken });

    // Send new tokens to the client
    res.status(200).json({
      auth: true,
      message: "Logged out and new tokens issued",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  },
  forgotPassword: async function (req, res) {
    // 1. get email - check that the user exists
    // 2. create resetToken and put it into DB
    // 3. create email with link and send
    let email = req.body.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: `Email ${email} does not exist` });
    }

    let resetToken = getResetToken();

    let result = await updateResetToken(user.id, resetToken);
    console.log(resetToken);
    console.log(user.id);
    console.log(result);

    if (!result.status) {
      return res.status(500).json({ message: result.message });
    }

    let message = getMailTemplateWithLink(
      "We have recieved your request to reset your password. Please reset your password using the link below",
      `http://localhost:5173/login/reset-password?id=${user.id}&token=${resetToken}`,
      "Reset Password"
    );

    try {
      let result = mail(email, "Reset Olympics Password Link", message);
      res.json({
        message: "Reset password link email has been sent successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  resetPassword: async function (req, res) {
    const { newpassword, resetToken, userId } = req.body;

    if (!resetToken || !userId || !newpassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the resetToken matches and hasn't expired
      if (user.resetToken !== resetToken) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const currDateTime = new Date();
      if (currDateTime > user.resetTokenExpiresAt) {
        return res.status(401).json({ message: "The reset link has expired" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newpassword, 10);

      // Update the user's password and clear the reset token
      user.password = hashedPassword;
      user.resetToken = undefined; // Clear the reset token
      user.resetTokenExpiresAt = undefined; // Clear the token expiry

      await user.save();

      // Optionally, send an email confirming the password change
      // let message = "Your password has been successfully changed.";
      // mail(user.email, "Password Changed Successfully", message);

      res.json({ message: "The password was changed successfully" });
    } catch (err) {
      console.error(`Error: \n${err.message}`);
      res.status(500).json({ message: err.message });
    }
  },
  refresh: async function (req, res) {
    const email = req.body.email;
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      console.log(`\n*** NO REFRESH TOKEN ***\n`);
      return res
        .status(401)
        .json({ auth: false, message: `You're not authenticated, no token` });
    }

    console.log(`\n********\nemail: ${email} \nrefreshToken: ${refreshToken}`);

    const user = await User.findOne({ refreshToken, email });
    console.log(`user:\n`, user);

    if (!user) {
      console.log(`\n*** NO USER ***\n`);
      return res
        .status(401)
        .json({ auth: false, message: `Refresh token was not found` });
    }

    try {
      const jwtVerify = util.promisify(jwt.verify);
      const decodedUser = await jwtVerify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      console.log(`Decoded user:\n`, decodedUser);

      let newAccessToken = module.exports.generateAccessToken(user);
      let newRefreshToken = module.exports.generateRefreshToken(user);
      console.log(`newAccessToken decoded: \n`, jwtDecode(newAccessToken));

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          { refreshToken: newRefreshToken },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("User update failed");
        }
        res.send({
          auth: true,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (updateError) {
        console.error(`\n*** USER UPDATE FAILED ***\n`, updateError);
        return res
          .status(500)
          .json({ auth: false, message: `Failed to update user` });
      }
    } catch (err) {
      console.error(err);
      console.error(err.message);
      console.log(`\n*** TOKEN NOT VERIFIED ***\n`);
      return res
        .status(403)
        .json({ auth: false, message: `Your session has been expired` });
    }
  },
  verify: (req, res, next) => {
    console.log(`REQUEST HEADER:\n`, req.headers);

    let authPart = req.headers.authorization || req.headers.Authorization;

    if (!authPart || !authPart.startsWith("Bearer "))
      return res
        .status(401)
        .json({ auth: false, msg: `You're not authorized` });

    let token = authPart.split(" ")[1];

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({
            auth: false,
            msg: `The token has been expired`,
            err: err.message,
          });

      req.user = user;
      next();
    });
  },
};
