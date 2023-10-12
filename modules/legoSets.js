/**************************************************************************************************
 * WEB322 – Assignment 3*
 *
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Preet D. Patel     Student ID: 123845224      Date: 09/25/2023
 *
 **************************************************************************************************/

const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    try {
      setData.forEach((element) => {
        element.theme = themeData.find(
          (theme) => theme.id === element.theme_id
        ).name;
        sets.push(element);
      });
      resolve(sets);
    } catch (error) {
      reject("Failed to load Sets!");
    }
  });
};

const getAllSets = async () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(sets);
    } catch (error) {
      reject("Faild to get Sets!");
    }
  });
};

const getSetByNum = (setNum) => {
  return new Promise((resolve, reject) => {
    try {
      const set = sets.find((set) => set.set_num === setNum);
      // console.log(set);
      if (set) {
        resolve(set);
      } else {
        reject("Unable to find requested set.");
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getSetsByTheme = (theme) => {
  return new Promise((resolve, reject) => {
    try {
      if (theme === "" || theme === " ") {
        reject(`Unable to fine requested set.`);
      } else {
        const setsTheme = sets.filter((set) =>
          set.theme.toLowerCase().includes(theme.toLowerCase())
        );
        if (setsTheme.length) {
          // console.log(setsTheme.length)
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

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
