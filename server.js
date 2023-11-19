/**************************************************************************************************
 * WEB322 – Assignment 5*
 *
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Preet D. Patel     Student ID: 123845224      Date: 10/31/2023
 *
 * Published URL: https://legos-bti325.cyclic.app/
 *
 **************************************************************************************************/


const legoData = require("./modules/legoSets");
const express = require("express");
const app = express();

const {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  getAllThemes,
  addSet,
  editSet,
  deleteSet,
} = legoData;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    getSetsByTheme(theme)
      .then((data) => res.render("sets", { sets: data }))
      .catch((err) => res.status(404).render("404", { err: err }));
  } else {
    getAllSets()
      .then((data) => res.render("sets", { sets: data }))
      .catch((err) => res.status(404).render("404"));
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  const num = req.params.setNum;

  getSetByNum(num)
    .then((data) => res.render("set", { set: data }))
    .catch((err) => res.status(404).render("404", { err: err }));
});

app.get("/lego/editSet/:setNum", async (req, res) => {
  const num = req.params.setNum;
  try {
    const themes = await getAllThemes();
    getSetByNum(num)
      .then((set) => res.render("editSet", { themes: themes, set: set }))
      .catch((err) => res.status(404).render("404", { err: err }));
  } catch (err) {
    res.status(404).render("404", { err: err });
  }
});
app.post("/lego/editSet", (req, res) => {
  editSet(req.body.set_num, req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/lego/addSet", (req, res) => {
  getAllThemes()
    .then((themes) => res.render("addSet", { themes: themes }))
    .catch((err) => res.status(404).render("404", { err: err }));
});
app.post("/lego/addSet", (req, res) => {
  addSet(req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/lego/deleteSet/:setNum", (req, res) => {
  deleteSet(req.params.setNum)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.use((req, res) => {
  res.status(404).render("404", {
    err: "I'm sorry, we're unable to find what you're looking for.",
  });
});

initialize()
  .then(() => {
    app.listen(8080, () => console.log("App is running on the port 8080."));
  })
  .catch((err) => console.log(err));

