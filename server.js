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

const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const express = require("express");
const clientSessions = require("client-sessions");
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
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: process.env.SE_SECRET, // this should be a long un-guessable string.
    duration: 3 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const ensureLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

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

app.get("/lego/editSet/:setNum", ensureLogin, async (req, res) => {
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

app.post("/lego/editSet", ensureLogin, (req, res) => {
  editSet(req.body.set_num, req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/lego/addSet", ensureLogin, (req, res) => {
  getAllThemes()
    .then((themes) => res.render("addSet", { themes: themes }))
    .catch((err) => res.status(404).render("404", { err: err }));
});

app.post("/lego/addSet", ensureLogin, (req, res) => {
  addSet(req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/lego/deleteSet/:setNum", ensureLogin, (req, res) => {
  deleteSet(req.params.setNum)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/login", (req, res) => {
  if (!req.session.user) {
    res.render("login",{ errorMessage: '', userName: req.body.userName });
  }else{
    res.redirect("/");
  }
});
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});
// app.get("/logout", ensureLogin, (req, res) => {
//   req.session.reset();
//   res.redirect("/");
// });
app.get("/userHistory", ensureLogin, (req, res) => {
  if (req.session.user) {
    const date = new Date(req.session.user.loginHistory[0].dateTime);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      timeZoneName: 'short' 
    };
   console.log(date.toLocaleString('en-CA', options));
    res.render("userHistory");
    
  }
});

app.get("/register", (req, res) => {
  // if (!req.session.user) {
    res.render("register",{errorMessage: '', successMessage: '',  userName: '' });
  // 
  // res.redirect("/");
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        username: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.post("/register", (req, res) => {
  
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", {errorMessage: '', successMessage: "User created",  userName: '' });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
        successMessage: ""
      });
    });
});

app.use((req, res) => {
  res.status(404).render("404", {
    err: "I'm sorry, we're unable to find what you're looking for.",
  });
});

initialize()
  .then(authData.initialize())
  .then(() => {
    app.listen(8080, () => console.log("App is running on the port 8080."));
  })
  .catch((err) => console.log(err));
