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

//login
app.post("/login", (req, res) => {
  // const userID = generateRandomString();
  if (!emailLookup(req.body.email)) {
    res.status(403);
    return res.send("Email does not exist.");
  }

  for (const id in users) {
    if (req.body.password === users[id].password) {
      res.cookie("user_id", users[id].id);
      return res.redirect("/urls");
    }
  }
  res.status(403);
  return res.send("Password does not match record.");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "Default User",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "Default User",
  },
};

// urlDatabase[shortURL] = {
//   longURL: req.body.longURL,
//   userID: users[req.cookies.user_id],
// };

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
    user: users[req.cookies.user_id],
  };
  if (users[req.cookies.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//index
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

//single url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id],
  };

  if (!urlDatabase[req.params.shortURL]) {
    res.send("Not a valid URL!");
  }
  res.render("urls_show", templateVars);
});

//use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls", (req, res) => {
  if (!users[req.cookies.user_id]) {
    return res.send("Not a user, please login.");
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.cookies.user_id],
  };
  // urlDatabase[shortURL] = req.body.longURL;
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
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]){
    return res.send("id does not exist.");
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
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
      console.log("matching email: " + users[id].email);
      console.log(`matching email: ${users[id].email}`);

      return true;
    }
  }
  return false;
}

//register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };

  res.render("urls_register", templateVars);
});
//registration handler
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("Empty email or password!");
  }
  if (emailLookup(req.body.email)) {
    res.send("Email already exists.");
  }
  // console.log(userID);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };
  // console.log(users);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_login", templateVars);
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
