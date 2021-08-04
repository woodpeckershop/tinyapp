//grabing and setting all the needed dependencies

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const morgan = require("morgan");
app.use(morgan("dev"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//login cookie
app.post("/login", (req, res) => {
  // const username = req.body.username;
  // res.cookie("username", username);
  // console.log(req);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  const logout = req.body.logout;
  res.clearCookie(user);
  res.redirect("/urls");
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//the new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

//index
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

//Read -a url, redirects to the single url page or post error
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    //  username: req.cookies["username"],
    user: users[req.cookies.user_id],
  };
  // console.log(req.params)
  // console.log(req.params.shortURL)
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Not a valid URL!");
  }
  res.render("urls_show", templateVars);
});

//Add -use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  // console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//Edit a longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

//generate 6 digit string
function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

//function: email lookup 
function emailLookup(email) {
  for (const id in users) {
    if (users[id].email === email) {
      console.log('matching email: ' + users[id].email)
      console.log(`matching email: ${users[id].email}`)

      return true;
    }
  }
  return false;
}

//register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});
//registration handler
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Empty email or password!')
  }
  if(emailLookup(req.body.email)){
    res.send('Email already exists.') 
  }
  console.log(userID);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
