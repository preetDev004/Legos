/**************************************************************************************************
 * WEB322 – Assignment 6*
 *
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Preet D. Patel     Student ID: 123845224      Date: 12/04/2023
 *
 * Published URL: https://legos-bti325.cyclic.app/
 *
 **************************************************************************************************/

const mongoose = require("mongoose");
require("dotenv").config();
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});

let User;

const initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", (err) => {
      // "on" will be executed every time the specified event occurs.
      reject(err);
    });

    db.once("open", () => {
      // "once" will be executed only once for specified event.
      User = db.models.User || db.model("users", userSchema);
      resolve();
    });
  });
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;
          let newUser = new User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code == 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
        })
        .catch((err) => {
          reject("There was an error encrypting the password"); // Show any errors that occurred during the process
        });
    }
  });
};

const checkUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (!users) {
          reject("Unable to find user: " + userData.userName);
        } else {
          
          bcrypt.compare(userData.password, users[0].password).then((result) => {
            if (result === true) {
              if (users[0].loginHistory.length == 8) {
                users[0].loginHistory.pop();
              }
              users[0].loginHistory.unshift({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });

              User.updateOne(
                { userName: userData.userName },
                { $set: { loginHistory: users[0].loginHistory } }
              )
                .exec()
                .then(() => {
                  resolve(users[0]);
                })
                .catch((err) => {
                  reject("There was an error verifying the user: " + err);
                });
            } else {
              reject("Incorrect Password for user: " + userData.userName);
            }
          });
        }
      })
      .catch((err) => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
