// Dependancies Express, logger and DB
const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");

// GET PUT Requests and scraping
const axios = require("axios");
const cheerio = require("cheerio");

// Require models for Handlebars
var db = require("./models")

// Initialize Express and PORT
var app = express();
var PORT = process.env.PORT || 8080;

// Morgan logger
app.use(logger("dev"));

// Serve static route to public
app.use(express.static("public"));

// Parse body JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Connect to Mongo DB
mongoose.connect("mongodb://localhost/scrape", { useNewUrlParser: true });

// Import and serve routes
// var routes = require("./controllers/article_controller.js")

// app.use(routes);

//ROUTES

// GET homepage
app.get("/", function(req, res) {
  res.render("index");
})

// GET Home /clear
app.get("/home", function(req, res) {
    // Clear Article collection
    db.Article.deleteMany({})
    .then(function(dbArticle) {
      // res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
    res.redirect("/");
})

// GET scrape with Axios
app.get("/scrape", function(req, res) {
  
  // Clear Article collection
  db.Article.deleteMany({})
    .then(function(dbArticle) {
      // res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });

  // First, we grab the body of the html with axios
  axios.get("https://www.w3.org/blog/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("a").text();
      result.link = $(this).find("a").attr("href");
      result.paragraph = $(this).find("p").text();      
      
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
      // console.log(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    // Refresh page to display articles
    res.redirect("/");
  });
});

// GET all Articles
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// GET specific Article
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// POST to save/update Articles
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {
        note: dbNote._id }, {new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start server
app.listen(PORT, function() {
  console.log("http://localhost:" + PORT)
})