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

//function: generate 6 digit string
function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

//function: email lookup
  // function emailLookup(email) {
  //   for (const id in userDatabase) {
  //     if (userDatabase[id].email === email) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

function getUserByEmail(email) {
  const users = Object.values(userDatabase);

  for (const user of users) {
    if (email === user.email) {
      return user;
    }
  }
}

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

const userDatabase = {
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

//function: returns the user specific url
function getUrlsForUser(id) {
  const urls = {};

  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    const urlObj = urlDatabase[key];
    if (urlObj.userID === id) {
      urls[key] = urlObj;
    }
  }

  return urls;
}

//   for (const id in urlDatabase) {
//     if (urlDatabase[id].userID === users[req.cookies.user_id]) {
//       userUrlDatabase[id] = {
//         longURL: userUrlDatabase[id].longURL,
//         userID: urlDatabase[id].userID,
//       };
//     }
//   }
// }

// res.cookie("user_id", users[id].id);
// urlsForUser(userDatabase[req.cookies.user_id]);

//anyone can use a short url to redirect to a website
app.get("/u/:shortURL", (req, res) => {
 
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("id does not exist.");
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//index
app.get("/urls", (req, res) => {
  const newUrlDb = getUrlsForUser(req.cookies.user_id)
  console.log('new DB', newUrlDb)
  console.log('user DB',userDatabase)
  console.log('urlDB', urlDatabase)
  console.log('cookie.id',req.cookies.user_id)
  
  const templateVars = {
    urls: newUrlDb,
    user: userDatabase[req.cookies.user_id],
  };
  if (!req.cookies.user_id) {
    return res.send("User is not logged in. Please log in.");
  }
  res.render("urls_index", templateVars);
});

//the new url page
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(400).send("No user");
  }

  const user = userDatabase[userID];
  if (!user) {
    return res.status(400).send("Bad user");
  }

  res.render("urls_new", { user });
  // const templateVars = {
  //   user: userDatabase[req.cookies.user_id],
  // };
  // if (userDatabase[req.cookies.user_id]) {
  //   return res.render("urls_new", templateVars);
  // } else {
  //   res.redirect("/login");
  // }
});

//single url page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(400).send("User not logged in.");
  }

  const user = userDatabase[userID];
  if (!user) {
    return res.status(400).send("id does not exist");
  }

  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];
  if (!urlObj) {
    return res.send("Not a valid URL!");
  }

  const longURL = urlObj.longURL;
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies.user_id],
  };

  res.render("urls_register", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies.user_id],
  };
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//posts

//login
app.post("/login", (req, res) => {
  // const userID = generateRandomString();
  if (!getUserByEmail(req.body.email)) {
    res.status(403);
    return res.send("Email does not exist.");
  }

  for (const id in userDatabase) {
    if (req.body.password === userDatabase[id].password) {
      res.cookie("user_id", userDatabase[id].id);
      return res.redirect("/urls");
    }
  }
  res.status(403);
  return res.send("Password does not match record.");
});
//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls", (req, res) => {
 
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(400).send("User not logged in.");
  }

  const user = userDatabase[userID];
  if (!user) {
    return res.status(400).send("id does not exist");
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id,
  };
  // urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(400).send("User not logged in.");
  }

  const user = userDatabase[userID];
  if (!user) {
    return res.status(400).send("id does not exist");
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edit a longURL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(400).send("User not logged in.");
  }

  const user = userDatabase[userID];
  if (!user) {
    return res.status(400).send("id does not exist");
  }

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//registration handler
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400);
    return res.send("Empty email or password!");
  }

  if (getUserByEmail(email)) {
    return res.send("Email already exists.");
  }

  const id = generateRandomString();
  userDatabase[id] = { id, email, password };

  // console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
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
