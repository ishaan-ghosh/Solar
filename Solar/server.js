// server: saves, loads, handles users (logging in, logging out)
// client: display (content, style)

// NOTICE !important
// most images are NOT working for some reason,not even html img src works for some.- James

// - create deleteSet() function in client side js
// - implement /app/delete/:user/:set in server.js -- code.js sends a get request -- server should just delete the entry in db and send something like success!

// - Fix alerts for login 
//   - Should alert user if password is incorrect, or account does not exist

// - Css fixup on set page, add buttons to bar at bottom and make sets full page

// - Add error checking for making duplicate sets

// - Add user id reference to cards sets, and change all 

// optional - figure out how to handle image upload on user end so they
//            can have their own user pictures
// ------ COMPLETED TASKS ---------
// - Set creation -- DONE
// - Fix grabbing user bio from db - DONE
// - fix updating user bio from db - DONE
// - collapsible set html display - DONE
// - add cards into set array - DONE
// - Fixing duplicates on view - DONE
// - add sets into user mySets array - DONE
// - getUserSetsDisplaySets() && getUserSetsDropdown() - DONE
// - Getting sets and updating dropdown for creating flashcards - DONE

// check for correct username in db / try digitalOcean
const mongoose = require('mongoose');
const express = require('express');

const cookieParser = require('cookie-parser');
const parser = require('body-parser');
const crypto = require('crypto');

let app = express()
app.use( parser.text({type: '*/*'}) );
app.set('json spaces', 2);
app.use(cookieParser());

/** SESSION CODE **/

TIMEOUT = 5000
var sessions = {};

function filterSessions() {
  let now = Date.now();
  for (e in sessions) {
    if (sessions[e].time < (now - TIMEOUT)) {
      delete sessions[e];
    }
  }
}

setInterval(filterSessions, 2000);

function putSession(username, sessionKey) {
  if (username in sessions) {
    sessions[username] = {'key': sessionKey, 'time': Date.now()};
    return sessionKey;
  } else {
    let sessionKey = Math.floor(Math.random() * 1000);
    sessions[username] = {'key': sessionKey, 'time': Date.now()};
    return sessionKey;
  }
}

function isValidSession(username, sessionKey) {
  if (username in sessions && sessions[username].key == sessionKey) {
    return true;
  }
  return false;
}

/** END SESSION CODE **/

/** HASHING CODE **/

function getHash(password, salt) {
  var cryptoHash = crypto.createHash('sha512');
  var toHash = password + salt;
  var hash = cryptoHash.update(toHash, 'utf-8').digest('hex');
  return hash;
 
}

function isPasswordCorrect(account, password) {
  var hash = getHash(password, account.salt);
  return account.hash == hash;
}

/** END HASHING CODE **/

const db  = mongoose.connection;
// const mongoDBURL = 'mongodb://127.0.0.1/login';
const uri = 'mongodb+srv://ish:chattydbpassword@chatty.irxu7.mongodb.net/chatty?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true });
db.once('open', _ => {
    console.log('Database connected:', uri)
  })
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var cardSchema = new Schema ({
	term: String,
	def: String
});
var Card = mongoose.model('Card', cardSchema);

var flashCardSet = new Schema ({
    name: String,
    desc: String,
    // myQuestions: Map, -- temporary comment to test set creation
	  // Progress: Number,
    cards: [{type: mongoose.Types.ObjectId, ref: 'Card'}]
    // want to be able to search for specific sets from DB set collection
});
var cardSet = mongoose.model('cardSet', flashCardSet);

var UserSchema = new Schema ({
  username: String,
  salt: String,
  hash: String,
  bio: String,
  img: { data: Buffer, contentType: String },
  mySets: [{type: mongoose.Types.ObjectId, ref: 'cardSet'}]
  // don't need terms here since in set (but we will have a Schema)
  // want to be able to search for terms from specific users
});
var User = mongoose.model('User', UserSchema);

app.get('/testcookies', (req, res)=>{
  res.send(req.cookies);
});

app.use('index.html', authenticate);
app.use(express.static('public_html'))
app.get('/', (req, res) => { res.redirect('home.html'); }); // likely index.html
// app.get('/', (req, res) => { res.send(req.cookies); res.redirect('home.html'); }); // likely index.html


function authenticate(req, res, next) {
  if (Object.keys(req.cookies).length > 0) {
    let u = req.cookies.login.username;
    let key = req.cookies.login.key;
    if (isValidSession(u, key)) {
      putSession(u, key);
      res.cookie("login", {username: u, key:key}, {maxAge: TIMEOUT});
      next();
    } else {
      res.redirect('index.html');
    }
  } else {
    res.redirect('index.html');
  }
}


app.get('/account/create/:username/:password', (req, res) => {
  // Was this, and was working 
  // User.find({username : req.params.username}).exec(function(error, results) {
  User.find({username : req.params.username}).exec(function(error, results) {
    if (!error && results.length == 0) {

      var salt = Math.floor(Math.random() * 1000000000000);
      var hash = getHash(req.params.password, salt);
      var bio = "";

      var user = new User({
          'username':req.params.username, 
          'salt':salt, 
          'hash':hash,
          'bio':bio
        });
      
      user.save(function (err) { 
        if (err) { res.end('ERROR'); }
        else { res.end('Account created!') };
      });
    } else {
      res.end('Username already taken');
    }
  });
});

app.get('/get/user', (req, res) => { // maybe calling too soon
  
  // console.log(req.cookies.login.username); 
  // res.send(req.cookies.login.username);
  res.send("test");
});

app.get('/account/login/:username/:password', (req, res) => {
  res.statusCode = 200;
  User.find({username : req.params.username}).exec(function(error, results) {
    if (results.length == 1) {
      var password = req.params.password;
      var salt = results[0].salt;
      var correct = isPasswordCorrect(results[0], password);
      if ( correct ) {
          // res.redirect('home.html'); // GET err
          var sessionKey = putSession(req.params.username);
          res.cookie("login", {username: req.params.username, key:sessionKey}, {maxAge: TIMEOUT});
          // res.end('SUCCESS');
          res.end(req.params.username); // req.params.username causes undefined
      } else {
        res.end('There was an issue logging in please try again');
      }
    } else {
      res.end('There was an issue logging in please try again');
    }
  });
});

// Functions to create and get flashcard lists

app.get('/app/lists', (req, res) => {
  res.statusCode = 200;
  List.find({})
    .exec(function (err, results) {
    if (err) return handleError(err);
    res.end(JSON.stringify(results));
  });
});

app.get('/app/create/list/:n/:c', (req, res) => {
  res.statusCode = 200;
  var l = new List({ 
    name: req.params.n, 
    color: req.params.c
  });
  l.save(function (err) { if (err) console.log('FAIL'); });
  res.send('SAVED');
});

// Functions to create and get items

// GET so it returns the stringified version of the list to display
app.get('/app/items/:list', (req, res) => {
  res.statusCode = 200;
  List.findOne({name: req.params.list}).populate('items')
    .exec((err, resultList) => {
      if (err) return res.end('FAIL');
      res.end(JSON.stringify(resultList.items));
    });
});

// POST to save a card to the db
app.post('/app/create/item/', (req, res) => {
  res.statusCode = 200;
  requestData = JSON.parse( req.body );
  var i = new Item({ 
    name: requestData.name, 
    stat: requestData.stat,
    difficulty: requestData.difficulty });
  i.save(function (err) { 
    if (err) { return console.log('FAIL'); }
      
    List.findOne({name: requestData.list})
      .exec(function (err, result) {
      if (err) { return res.end('FAIL'); }
      if (!result) { return res.end('FAIL'); }

      result.items.push(i._id);
      result.save( function(err) {
      if (err) { return res.end('FAIL'); }
      res.end('SAVED');
      });
    });
  })
});

// GET request to get all the current sets logged in User's sets to be 
// displayed within the select html within flashcardCreation.html
app.get('/app/get/:user/sets', (req,res) => {
  var user = req.params.user
  User.findOne({username: user}).populate('mySets') // findOne
  .exec((err, resultSets) => {
    if (err) {
      return res.end("failed to get sets for user, err: " + err)
    }
    if (!resultSets) {
      return res.end("failed to get sets for user, resultSets: " + resultSets)
    }
    console.log("mySets" + JSON.stringify(resultSets.mySets));
    res.end(JSON.stringify(resultSets.mySets))
  });
});

app.get('/app/find/:user/sets', (req,res) => {
  var user = req.params.user
  console.log("user: " + user);
  User.findOne({username: user}).populate('mySets') // findOne
  .exec((err, resultSets) => {
    if (err) {
      return res.end("failed to get sets for user, err: " + err)
    }
    if (!resultSets) {
      return res.end("failed to get sets for user, resultSets: " + resultSets)
    }
    console.log("mySets" + JSON.stringify(resultSets.mySets));
    res.end(JSON.stringify(resultSets.mySets))
  });
});

// POST request to update user's bio
app.post('/app/update/bio', (req,res) => {
  res.statusCode = 200;
  requestData = JSON.parse(req.body);
  var ret = "PUSHED";
  var User = mongoose.model('User', UserSchema);
  User.updateOne({username: requestData.username}, {bio: requestData.bio}, function (error, result) {
    if (error) {
        console.error(error);
        ret = error;
    }
  });
  res.end(ret);
  });

// get request to fetch user bio
app.get('/app/fetch/:user/bio', (req,res) => {
  User.findOne({username: req.params.user})
  .exec( function(err,result) {
    if (err) {
      return res.end('failed to fetch bio...'); 
    }
    if (!result) {
      return res.end('failed to fetch bio results...'); 
  }
  console.log(result.bio);
  res.end(result.bio);
    
  });
});


//   /* 
app.get('/app/delete/:user/:set', (req,res) => {
  res.statusCode = 200;
  cardSet.findOneAndRemove({name: req.params.set}, function (error, result) {
    if (error) {
      console.error(error);
      res.send(error)
    } else {
      // Delete set ID from user array
      User.updateOne({username: req.params.user}, { $pullAll: {mySets: [result._id] }}, function (error, result) {
        if (error) {
          console.error(error);
          res.end(error);
        } else {
          res.end("DELETED");
        }
      });
    }
  });
});
//   */

app.post('/app/create/:option/card', (req, res) => {
  reqData = JSON.parse(req.body);
  console.log("option: " + req.params.option);
  var decoded = decodeURIComponent(reqData.desc);
  var option = req.params.option;
  var c = new Card({
    term: reqData.term,
    def: decoded
  });

  console.log("New card JSON: " + JSON.stringify(c));

  c.save(function (err) { 
    if (err) { return console.log('FAIL'); }
  })
  cardSet.findOne({name: option})
  .exec( function (err,result) {
    if (err) {
      console.log("user exec err: " + err) // checking the err
      return res.end('failed to save card to user')
    }
    if (!result) {
      console.log("Result failed in exec: " + result) // checking the result
      return res.end('something went wrong on our end saving the card to ur set!')
    }
    
    console.log("User term: " + result.term);
    console.log("User desc: " + result.desc);
    console.log("User cards: " + result.cards);
    result.cards.push(c._id);
    result.save( function(err) {
      if (err) {
        return res.end('failed! line __ server.js, err: ' + err)
      }
      res.end('SAVED ID TO CARD ARRAY!')
    })
    console.log("Updated Card Array: " + result.cards);
  })
});

/*
app.get('/app/delete/:user/:set', (req,res) => {
  res.statusCode = 200;
  cardSet.findOneAndRemove({name: req.params.set}, function (error, result) {
    if (error) {
      console.error(error);
      res.send(error)
    } else {
      // Delete set ID from user array
      User.updateOne({username: req.params.user}, { $pullAll: {mySets: [result._id] }}, function (error, result) {
        if (error) {
          console.error(error);
          res.end(error);
        } else {
          res.end("DELETED");
        }
      });
    }
  });
});
*/

app.post('/app/create/:user/set', (req,res) => {
  requestData = JSON.parse( req.body );
  console.log("The set's user: " + req.params.user);

  // cardSet.findOne({name: req.params.set}, function (error, result) {
  //   if (error) {
      
  //   } else {
  //     console.log("User tried to create duplicate set");
  //     res.end("DUPLICATE");
  //   }
  // });

  var i = new cardSet({ 
    name: requestData.name, 
    desc: requestData.desc,
    progress: 0,
    cards: []
  });

  console.log("New Set JSON: " + JSON.stringify(i));

  i.save(function (err) { 
    if (err) { return console.log('FAIL'); }
  })
  User.findOne({username: req.params.user})
  .exec( function (err,result) {
    if (err) {
      console.log("user exec err: " + err) // checking the err
      return res.end('FAIL')
    }
    if (!result) {
      console.log("Result failed in exec: " + result) // checking the result
      return res.end('FAIL')
    }
    
    console.log("User Name: " + result.username);
    console.log("User Bio: " + result.bio);
    console.log("User Array: " + result.mySets);
    result.mySets.push(i._id);
    result.save( function(err) {
      if (err) {
        res.end('FAIL');
      }
      res.end('SAVED');
    })
    console.log("Updated User Array: " + result.mySets);
  })
});

app.get('/app/:set/items', (req,res) => {
  cardSet.findOne({name: req.params.set}).populate('cards') // findOne (duplicates cause issues with find)?
  .exec(function (err,result) {
    if (err) {
      console.log("server exec err: " + err)
      return res.end('Failed to get cards from set....')
    }
    if (!result) {
      console.log("Failed result: " + result)
      res.end("Failed to get cards!")
    }
    console.log(result);
    res.end(JSON.stringify(result.cards))
  })
})

app.listen(4000, function () {
  console.log('server running');
});

