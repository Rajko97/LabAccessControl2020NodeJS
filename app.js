const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const constants = require("./controller/constants");
const expressValidator = require("express-validator");
const admin = require("firebase-admin");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const timeRouter = require("./routes/time")

const serviceAccount = require('./labaccesscontrol2020-firebase-adminsdk-2dcy7-1288e8beff.json');

var app = express();

mongoose.connect(constants.mongodbUrlDB + constants.mongodbName, {
  useNewUrlParser: true
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://labaccesscontrol2020.firebaseio.com"
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressValidator());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/time", timeRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
