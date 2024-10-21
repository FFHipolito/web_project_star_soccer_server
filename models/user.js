const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: (props) => `${props.value} E-mail inválido!`,
    },
  },
  phone: {
    type: Number,
    required: true,
    minlength: 10,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      const err = new Error("Senha ou e-mail incorreto");
      err.statusCode = 400;
      if (!user) {
        return Promise.reject(err);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(err);
        }

        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
