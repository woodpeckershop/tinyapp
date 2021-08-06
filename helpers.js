//function: get user by email
function getUserByEmail(email, database) {
  const users = Object.values(database);

  for (const user of users) {
    if (email === user.email) {
      return user;
    }
  }
}

//function: generate 6 digit string
function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

//function: returns the user specific url
function getUrlsForUser(id, database) {
  const urls = {};

  const keys = Object.keys(database);
  for (const key of keys) {
    const urlObj = database[key];
    if (urlObj.userID === id) {
      urls[key] = urlObj;
    }
  }
  return urls;
}

//default databases
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


module.exports = { getUserByEmail, generateRandomString, getUrlsForUser, urlDatabase, userDatabase }