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

require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Theme = sequelize.define(
  "Theme",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

// create association
Set.belongsTo(Theme, { foreignKey: "theme_id" });

// let sets = [];

const initialize = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync().then(() => resolve());
    } catch (error) {
      reject("Failed to load Sets!");
    }
  });
};

const getAllSets = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sets = await Set.findAll({ include: [Theme] });
      resolve(sets);
    } catch (error) {
      reject("Faild to get Sets!");
    }
  });
};

const getSetByNum = async (setNum) => {
  return new Promise(async (resolve, reject) => {
    try {
      const set = await Set.findAll({
        where: { set_num: setNum },
        include: [Theme],
      });

      if (set.length) {
        resolve(set[0]);
      } else {
        reject("Unable to find requested set.");
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getSetsByTheme = async (theme) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (theme === "" || theme === " ") {
        reject(`Unable to fine requested set.`);
      } else {
        const setsTheme = await Set.findAll({
          include: [Theme],
          where: { "$Theme.name$": { [Sequelize.Op.iLike]: `%${theme}%` } },
        });
        if (setsTheme.length) {
          resolve(setsTheme);
        } else {
          reject("Unable to find requested set.");
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllThemes = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const themes = await Theme.findAll();
      resolve(themes);
    } catch (error) {
      reject(error);
    }
  });
};
const addSet = async (setData) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.create(setData);
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
};

const editSet = async (set_num, setData) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.update(setData, { where: { set_num: set_num } });
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
};

const deleteSet = async (set_num) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.destroy({
        where: {
          set_num: set_num,
        },
      });
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
};

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  getAllThemes,
  addSet,
  editSet,
  deleteSet,
};

// Steps Done:

// use neon tech to create new postgres DB
// connect the db with pg admin
// install sequelize
// connect to db with sequelize object and new keyword
// create models with define
// connect models with foreign key
// add data with bulkinsert 
