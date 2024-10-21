require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { NODE_ENV, JWT_SECRET } = process.env;

function getUsers(req, res) {
  return User.find({})
    .then((users) => {
      if (!users) {
        const err = new Error("Ocorreu um erro ao buscar usuários");
        err.status = 500;
        throw err;
      }
      res.send({ data: users });
    })
    .catch(next);
}

function getUserById(req, res) {
  const { userId } = req.params;
  return User.findById(userId)
    .orFail(() => {
      const err = new Error("Usuário não encontrado");
      err.status = 404;
      throw err;
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
}

function getUserInfo(req, res, next) {
  const { user } = req;
  return User.findById(user._id)
    .orFail(() => {
      const err = new Error("Usuário não encontrado");
      err.statusCode = 404;
      throw err;
    })
    .then((userData) => {
      res.send({ data: userData });
    })
    .catch(next);
}

function createUser(req, res, next) {
  const { name, email, phone, password } = req.body;
  try {
    if (!email || !password) {
      const err = new Error("Dados inválidos...");
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    next(error);
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        name,
        email,
        phone,
        password: hash,
      });
    })
    .then((user) => {
      return res.status(201).send({
        data: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    })
    .catch(next);
}

function updateUserProfile(req, res, next) {
  const { name, email, phone, password } = req.body;
  const userId = req.user._id;
  const userUpdated = {};

  if (name) {
    userUpdated.name = name;
  }
  if (email) {
    userUpdated.email = email;
  }
  if (phone) {
    userUpdated.phone = phone;
  }
  if (password) {
    userUpdated.password = password;
  }

  if (!name && !email && !phone && !password) {
    return res.status(400).send({ error: "Dados inválidos..." });
  }

  return User.findByIdAndUpdate(userId, userUpdated, {
    new: true,
  })
    .orFail(() => {
      const err = new Error("Usuário não encontrado");
      err.status = 404;
      throw err;
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
}

function login(req, res, next) {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      const err = new Error("Dados inválidos...");
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    next(error);
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === "production" ? JWT_SECRET : "super-strong-secret",
        {
          expiresIn: "7d",
        }
      );
      if (!token) {
        const err = new Error("Token inválido...");
        err.statusCode = 401;
        throw err;
      }
      res.send({ token });
    })
    .catch(next);
}

module.exports = {
  getUsers,
  getUserById,
  getUserInfo,
  createUser,
  updateUserProfile,
  login,
};
