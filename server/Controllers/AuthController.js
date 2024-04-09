const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const tokenData = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(tokenData, "secret_ecom");
    res.status(201).json({ message: "User signed in successfully", success: true, user: { id: user._id, email: user.email }, token });
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Incorrect password or email' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: 'Incorrect password or email' });
    }
    const tokenData = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(tokenData, "secret_ecom");
    res.status(201).json({ message: "User logged in successfully", success: true, user: { id: user._id, email: user.email }, token });
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};
