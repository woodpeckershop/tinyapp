//grabing and setting all the needed dependencies
const { getUserByEmail } = require("./helpers.js");

const bcrypt = require("bcrypt");
const express = require("express");
// const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const morgan = require("morgan");
app.use(morgan("dev"));

app.use(
  cookieSession({
    name: "jun21",
    keys: ["no significance", "key2", "more stuff"],
  })
);
// app.use(cookieParser());

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

// let newUrlDb = {};

//   for (const id in urlDatabase) {
//     if (urlDatabase[id].userID === users[[req.session.user_id]) {
//       userUrlDatabase[id] = {
//         longURL: userUrlDatabase[id].longURL,
//         userID: urlDatabase[id].userID,
//       };
//     }
//   }
// }

// res.cookie("user_id", users[id].id);
// urlsForUser(userDatabase[[req.session.user_id]);

app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

//anyone can use a short url to redirect to a website
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("id does not exist.");
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//index
app.get("/urls", (req, res) => {
  newUrlDb = getUrlsForUser(req.session.user_id, userDatabase);
  // console.log("cookie.id", req.session.user_id);
  // console.log("new DB", newUrlDb);
  // // console.log("user DB", userDatabase);
  // console.log("urlDB", urlDatabase);

  const templateVars = {
    urls: newUrlDb,
    user: userDatabase[req.session.user_id],
  };
  if (!req.session.user_id) {
    return res.send("User is not logged in. Please log in.");
  }
  res.render("urls_index", templateVars);
});

//the new url page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }

  const user = userDatabase[userID];
  // if (!user) {
  //   return res.status(400).send("Bad user");
  // }

  res.render("urls_new", { user });
  // const templateVars = {
  //   user: userDatabase[[req.session.user_id],
  // };
  // if (userDatabase[[req.session.user_id]) {
  //   return res.render("urls_new", templateVars);
  // } else {
  //   res.redirect("/login");
  // }
});

//single url page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) {
    return res.status(400).send("User not logged in.");
  }

  const urlObj = urlDatabase[shortURL];
  if (!urlObj) {
    return res.send("Not a valid URL!");
  }

  newUrlDb = getUrlsForUser(userID, userDatabase);
  if (!newUrlDb[shortURL]) {
    return res.status(400).send("User does not own the URL with this ID.");
  }

  const user = userDatabase[userID];
  // if (!user) {
  //   return res.status(400).send("id does not exist");
  // }

  const longURL = urlObj.longURL;
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };

  res.render("urls_register", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

















//posts

//login
app.post("/login", (req, res) => {
   const user = getUserByEmail(req.body.email, userDatabase);

  // const userID = req.session.user_id
  if (!user) {
    res.status(403);
    return res.send("Email does not exist.");
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    // res.cookie("user_id", userDatabase[id].id);
    return res.status(400).send("Wrong password.Please <a href='/login'>try again</a>");
  }

  req.session.user_id = user.id;
  return res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = undefined;
  res.redirect("/urls");
});

//use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
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
    userID: req.session.user_id,
  };

  // newUrlDb = getUrlsForUser([req.session.user_id]);
  // urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("User not logged in.");
  }

  const user = userDatabase[userID];
  if (!user) {
    return res.status(400).send("id does not exist");
  }
  const shortURL = req.params.shortURL;
  newUrlDb = getUrlsForUser(userID, userDatabase);
  if (!newUrlDb[shortURL]) {
    return res.status(400).send("User does not own the URL with this ID.");
  }
  
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//registration handler
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res
      .status(400)
      .send(
        "Empty email or password! Please <a href='/register'>try again</a>"
      );
  }

  if (getUserByEmail(email, userDatabase)) {
    return res
      .status(400)
      .send("Email already exists. Please <a href='/register'>try again</a>");
  }

  const id = generateRandomString();
  const user = { id, email, password: hashedPassword };
  userDatabase[id] = user;

  // res.cookie("user_id", id);
  req.session.user_id = id;
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
