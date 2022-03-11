
var globUser = "";
function setGloblUser() {
  $.ajax({
    url: '/get/user',
    method: 'GET',
    success: function (result) {
      console.log(result);
      console.log("session 2: " + sessionStorage.getItem('user'));
      // console.log("cookies user: " + document.cookies.login.username) // maybe cookie but on server it's cookies
      console.log("hit");
      console.log(result + "req res");
      globUser += result;
      window.globUser = result;
    }
  });
}

// --------------------------------------------------------------------------------------
function userLogin() {
  let user = $("#loginUser").val();
  let pass = $("#loginPassword").val();
  // $.get(
  //     '/account/login/' + user + '/' + encodeURIComponent(pass),
  //     (data, status) => {
  //         alert(data)
  //         if (data == 'SUCCESS') {
  //             window.location = 'home.html';
  //         }
  //     }
  // );

  // var formData = $('form').serialize();
  $.ajax({
    url: '/account/login/' + user + '/' + encodeURIComponent(pass),
    method: 'GET',
    // data: /*formData + */'&param=' + user /*param_value*/,
    success: function (result) {
      // // to test if we can access username from cookies here, currently says undefined
      // alert("Successfully logged in!");
      // sessionStorage.setItem('user', result);
      // // console.log( "session: " + sessionStorage.getItem('user') );
      // console.log("cookies user 2: " + result); // result is right only on index.html, empty for home.html // document.cookies is empty str (found stuff online on this)
      // // window.location = 'home.html';
      // // window.location = 'home.html' + '/' + user; // looks for home.html/abc page
      // window.location = 'home.html';
      // // window.location.href = 'home.html' + '/' + user; // same as non-href version
      // console.log("cookies user 3: " + result); // same as for 2 (loads but for index.html)
      // console.log("session: " + sessionStorage.getItem('user')); // ^
      // setGloblUser();

      if (result != 'There was an issue logging in please try again') {
        // to test if we can access username from cookies here, currently says undefined
        alert("Successfully logged in!");
        sessionStorage.setItem('user', result);
        // console.log( "session: " + sessionStorage.getItem('user') );
        console.log("cookies user 2: " + result); // result is right only on index.html, empty for home.html // document.cookies is empty str (found stuff online on this)
        // window.location = 'home.html';
        // window.location = 'home.html' + '/' + user; // looks for home.html/abc page
        window.location = 'home.html';
        // window.location.href = 'home.html' + '/' + user; // same as non-href version
        console.log("cookies user 3: " + result); // same as for 2 (loads but for index.html)
        console.log("session: " + sessionStorage.getItem('user')); // ^
        setGloblUser();
      } else {
        alert("Unsuccessfully logged in, please try again!");
      }

      // if (result == 'SUCCESS') {
      //   alert("Successfully logged in!");
      //   console.log("cookies user 2: " + document.cookies.login.username);
      //   window.location = 'home.html';
      //   // setGloblUser();
      // } else {
      //   alert("Unsuccessfully logged in, please try again!");
      // }
    }
  });
}

// --------------------------------------------------------------------------------------
function createFlashCard() {

  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    return false
  }
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log(httpRequest.responseText);
        // getFlashCards();
        alert("Created a new Card!");
      }
      else {
        alert("Failed to create a card...");
      }
    }
  }
  $(document).ready(function() {
    let term = document.getElementById('term').value;
    let ans = document.getElementById('answer').value;
    let option = document.getElementById('flashSetsOptions').value; // not sure about correct way to access the option selected (Aleks)

    newCard = {'term': term, 'desc': ans}

    term.textContent = "";
    ans.textContent = "";
    option.textContent = "";
    var cardData = JSON.stringify(newCard); 
    var url = '/app/create/' + option + '/card'; 
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-type', 'application/json');
    httpRequest.send(cardData);
  });
}
// --------------------------------------------------------------------------------------
// Doesnt seem to have any bugs that I personally see - James
// Made a new account, alerted me with User Created! Please login with your credentials
// and successfully logged in
function createNewUser() {
  let newAccount = $("#newUser").val();
  let newAccPasswd = $("#newPassword").val();
  //console.log(newAccount); testing purposes
  //console.log(newAccPasswd); testing purposes

  $.ajax({
    url: 'account/create/' + newAccount + '/' + newAccPasswd + '/',
    method: 'GET',
    success: function (result) {
      if (result == "Username already taken") {
        alert("User has already been taken! Please choose another");
      } 
      if (result == "Account created!") {
        user = result;
        alert("User created! Please login with your credentials");
      } 
      else {
        alert("Error Occured! Please try again");
      }
    }
  });
}
// --------------------------------------------------------------------------------------
// (James) -- NEEDS TESTING -- CREATES A NEW SET IN THE DB
// myQuestions, Progress, and Cards fields of Set schema are NOT initialized in this code..
function createNewSet() {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    return false
  }
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200 && httpRequest.responseText === "SAVED") {
        console.log(httpRequest.responseText);
        alert("Created a new Set!");
        getUserSetsDisplaySets();
        RightSideDisplaySetsForUser();
        toggleSetCreation();
      } else if (httpRequest.responseText === "DUPLICATE") {
        alert("Cannot make sets with duplicate names, try again!");
        return;
      }
      else {
        alert("Error, could not create set");
      }
    }
  }
  $(document).ready(function() {
    let SetName = document.getElementById('name').value;
    let SetDesc = document.getElementById('description').value;

    newObject = {'name': SetName, 'desc': SetDesc}

    SetName.textContent = "";
    SetDesc.textContent = "";
    var dataString = JSON.stringify(newObject);
    // console.log("code.js line 272 " + dataString);
    // console.log("Username: " + sessionStorage.getItem('user'))   
    var url = '/app/create/' + sessionStorage.getItem('user') + '/set';
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-type', 'application/json');
    httpRequest.send(dataString);
  });
}

// -------------------------------------------------------------------------------------
function RightSideDisplaySetsForUser() {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) { return false; }

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        $(".displaySets").empty();
        resStr = "";
        nameDesc = "";
        response = JSON.parse(httpRequest.responseText);
        if (response.length == 0) {
          resStr = "<div class='flashSets'><p class='noSets'> No sets! create a set now! <br> go to Flashcard Sets!</p></div>"
          $(".displaySets").append(resStr);
        }
        for (var i in response) {
          let data = response[i];
          if (data.desc == ""){
            data.desc = "No Description"
          }
          resStr = "<div class='flashSets'> <h2> " + data.name + "</h2><p> " + data.desc + "</p></div>"
          $(".displaySets").append(resStr);
        }
        
      }
      else { 
        alert('Failed to get user sets!'); 
      }
    }
  }
  let url = '/app/get/' + sessionStorage.getItem('user') + '/sets'
  httpRequest.open('GET', url)
  httpRequest.send()
}
// -------------------------------------------------------------------------------------

function getUserSetsDropdown(htmlElement) {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) { return false; }

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        resStr = "";
        response = JSON.parse(httpRequest.responseText);
        for (var i in response) {
          let data = response[i];
          resStr = "<option value='" + data.name + "'>" + data.name + "</option>"
          $("#" + htmlElement).append(resStr);
        }
      }
      else { 
        alert('Failed to get user sets!'); 
      }
    }
  }
  let url = '/app/get/' + sessionStorage.getItem('user') + '/sets'
  httpRequest.open('GET', url)
  httpRequest.send()
}

// --------------------------------------------------------------------------------------
// James
// give the sets in the html some sort of onclick functionality? 
// possibly let the user access them when they are clicked on in the sidebar?
function getUserSetsDisplaySets() {
  var x = "";
  var httpRequest = new XMLHttpRequest();
  // hasReloaded = 0;
  if (!httpRequest) { return false; }
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        $(".setRightSideDisplay").empty();
        response = JSON.parse(httpRequest.responseText);
        resStr = "";
        collapseContentDiv = "";
        var count = 0;
        for (var i in response) { // iterate over mySets
          var data = response[i];
          count++;
          resStr = "<div><button type='button' class='collapsible'>" + data.name + ": " + data.desc + "</button><div class='collapsibleContent' id='setCount" + count +"'></div></div>"
          $(".setRightSideDisplay").append(resStr); 
          getCardsFromSet(data.name, count);
        }
        collapsibleSets() 
      } 
      else {
        alert('Failed to get user sets!'); }
    }
  }

  let url = '/app/get/' + sessionStorage.getItem('user') + '/sets'; 
  httpRequest.open('GET', url)
  httpRequest.send()
};

// --------------------------------------------------------------------------------------
// (James) Grabs all the cards from the setName parameter's cards array
// setName is the name of a set
function getCardsFromSet(setName, count) { // extra 2, 3, asdsgdgf, asdadsa, sgdfhgd Sets in db not in my own Sets (18-5 so 13)
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) { return false; }
  
  id = 0;
  id2 = "a" + id;
  runFlag = 0;
  cardInfoArr = [];
  cardInfoMap = {};
  idArr = [];
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        response = JSON.parse(httpRequest.responseText)
  
        if (response.length != 0) {
          for (var i in response) { // each card 
            // added onclick to test (maybe put text in button and have flashcard be button?)      
            // "<p>" + response[i].term + ": " + response[i].def + "</p>"  
            // <button onclick="flipCard()">response[i].term</button>
            // id2+="b";
            console.log("id: "+id);
            console.log("id2: "+id2);
            msg = "hi";
            console.log("term: "+response[i].term);
            console.log("def: "+response[i].def);
            cardInfoArr.push(id);
            cardInfoArr.push(response[i].def);
            cardInfoMap[id] = response[i].def;
            console.log("arr: "+cardInfoArr);
            console.log("map: "+cardInfoMap);

            // + id + ", " + response[i].def +

            // maybe use count for id
            // example: resStr += '<h2 onclick="getItemsForList(\'' + r.name + '\')" style="cursor:pointer;color:' + r.color + ';">' + r.name + '</h2><br/>'
            // collapseContentDiv = "<p><button id=" + id + " onclick='flipCard('" + id + response[i].def + "')'>" + response[i].term + "</button></p>"
            // collapseContentDiv = '<p><button onclick="flipCard(\'' + cardInfoMap + '\')"' + ';">' + response[i].term + '</button></p>'
            
            // trying to make another button that is hidden and overlapped but holds the def, so when we click the initial term it displays the definition and when we click the def btn it shows the term
            // basically, when we click one button it needs to hide itself and unhide the other
            // collapseContentDiv = '<p><button id=' + id + ' onclick="flipCard(\'' + id + "','" + id2 + '\')"' + ';">' + response[i].term + '</button> <button class="hiddenDefinition" id=' + id2 + '> hiddenOverlap </button> </p>'
            // collapseContentDiv = '<p><button id=' + id + ' onclick="flipCard(\'' + id + "','" + id2 + '\')"' + ';">' + response[i].term + '</button> <button class="hiddenDefinition" id=' + id2 + ' onclick="flipCard(\'' + id + "','" + id2 + '\')"' + ';"> hiddenOverlap </button> </p>'
            // collapseContentDiv = '<p><button id=' + id + ' class = "termCard" onclick="flipCard(\'' + id + "','" + id2 + "','" + runFlag + '\')"' + ';">' + response[i].term + '</button> <button class="hiddenDefinition" id=' + id2 + ' onclick="flipCard(\'' + id + "','" + id2 + '\')"' + ';">' + response[i].def + ' </button> </p>'
            collapseContentDiv = '<p><button id=' + id + ' class = "termCard" onclick="flipCard(\'' + id + "','" + id2 + "','" + runFlag + '\')"' + ';">' + "Term: " + response[i].term + '</button> <button class="hiddenDefinition" id=' + id2 + ' onclick="flipCard(\'' + id + "','" + id2 + '\')"' + ';">' + "Definition: " + response[i].def + ' </button> </p>'
            // document.getElementById(id2).style.display = "block"; // errors since id2 is null...

            var setCount = "#setCount" + count
            $(setCount).append(collapseContentDiv)
            id++;
            id2+="b";
          }
        }
        else {
          collapseContentDiv = "<p> No cards in this set </p>"
          var setCount = "#setCount" + count
          $(setCount).append(collapseContentDiv)
        }
      }
      else {
        alert("failed to grab the cards from " + setName)
      }
      
    }
  }

  let url = '/app/' + setName + '/items';
  httpRequest.open('GET',url)
  httpRequest.send();
};

function flipCard(termId, defId, runFlag) { // was: id, def (but issue with passing into dynamic html), then cardInfoMap/Arr, then card
  // console.log("id: " + id);
  // console.log("def: " + def);

  // console.log("id: " + i);
  // console.log("def: " + cardInfoMap[i]);

  // console.log("term check 2: "+card.term);
  // console.log("def check 2: "+card.def);

  // below basic test works for 1 arg (hides def on click of term)
  // console.log("defId: " + defId);
  // defBtn = document.getElementById(defId);
  // defBtn.style.display = "none";

  console.log("termId: " + termId);
  console.log("defId: " + defId);

  termBtn = document.getElementById(termId);
  defBtn = document.getElementById(defId);

  if (termBtn.style.display === "block" || runFlag == 0) {
    console.log("make term disappear")
    termBtn.style.display = "none";
  } else {
    console.log("make term appear")
    termBtn.style.display = "block";
  }

  if (defBtn.style.display === "none" || runFlag == 0) {
    console.log("make def appear")
    defBtn.style.display = "block";
  } else {
    console.log("make def disappear")
    defBtn.style.display = "none";
  }
}

function searchUsers() {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) { return false; }

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        $(".displaySets").empty();
        resStr = "";
        nameDesc = "";
        response = JSON.parse(httpRequest.responseText);
        if (response.length == 0) {
          resStr = "<div class='flashSets'><p class='noSets'> No sets! create a set now! <br> go to Flashcard Sets!</p></div>"
          $(".displaySets").append(resStr);
        }
        for (var i in response) {
          let data = response[i];
          if (data.desc == ""){
            data.desc = "No Description"
          }
          resStr = "<div class='flashSets'> <h2> " + data.name + "</h2><p> " + data.desc + "</p></div>"
          $(".displaySets").append(resStr);
        }
        
      }
      else { 
        alert('Failed to get user sets!'); 
      }
    }
  }
  $(document).ready(function() {
    console.log("username searched for 3: " + document.getElementById("searchUsers").value);
    var userSearch = document.getElementById("searchUsers").value
    // let url = '/app/get/' + sessionStorage.getItem('user') + '/sets'; 
    // console.log("username searched for 2: " + document.getElementById("searchUsers").val);
    let url = '/app/find/' + userSearch + '/sets'; // correct username from search
    httpRequest.open('GET', url)
    httpRequest.send()
  });
}

// --------------------------------------------------------------------------------------
// James
// function for updating user bio in db
function updateUserBio() {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) { return false; }

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log(httpRequest.responseText);
        alert("Bio updated!");
        fetchUserBio("userBio");
      } else {
        alert('Failed to update user bio!'); 
      }
    } 
  };

  $(document).ready(function() {
    var input = document.getElementById('userBioInputArea').value; 
    var username = sessionStorage.getItem('user'); 

    newObject = { "username": username, "bio": input}
    var dataString = JSON.stringify(newObject);
    console.log(dataString);

    // Calling helper method using AJAX
    let url = '/app/update/bio/';
    httpRequest.open('POST', url, true);
    // Set body content type and send JSON object
    httpRequest.setRequestHeader('Content-type', 'application/json');
    httpRequest.send(dataString);
  });
}

// --------------------------------------------------------------------------------------
function fetchUserBio(htmlElement) {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) {return false;}
  
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        newBio.textContent = httpRequest.responseText; // was +=
      } else {
        alert('failed to fetch user bio!'); 
      }
    } 
  }
  $(document).ready(function() {
    newBio = document.getElementById(htmlElement);
    var url = '/app/fetch/' + sessionStorage.getItem('user') + '/bio';
    console.log(url + " clientFetchPrint");
    httpRequest.open('GET', url);
    httpRequest.send();
  });
}
// --------------------------------------------------------------------------------------
function toggleSetCreation() {
  var createButton = document.getElementById("hidden");
  var delButton = document.getElementById("hidden2");

  if (createButton.style.display === "none") {
    if (delButton.style.display != "none") {
      delButton.style.display = "none";
    }
    createButton.style.display = "block";
  } else {
    createButton.style.display = "none";
  }
}
// --------------------------------------------------------------------------------------
function toggleDelSet() {
  var delButton = document.getElementById("hidden2");

  if (delButton.style.display === "none") {
    
    delButton.style.display = "block";
  } else {
    delButton.style.display = "none";
  }
}


// --------------------------------------------------------------------------------------
// displays the set creation form in userSets.html
function displaySetCreation() {
  if (document.getElementById("hidden2").style.display != "none") {
    document.getElementById("hidden2").style.display = "none";
  }
  document.getElementById("hidden").style.display = "block";
}
// --------------------------------------------------------------------------------------
// hides an element in userSets.html, is called when the close button 
// on the form is clicked
function hideForm(elementID) {
  document.getElementById(elementID).style.display = "none";
};
// --------------------------------------------------------------------------------------
// took the code in the <script> tags in the pages and created a small function to redirect
// to editUserPage.html
function redirectToUser() {
  location.href = "editUserPage.html";
}
// --------------------------------------------------------------------------------------
// changes the display of the delete set form from non to block
function deleteSetForm() {
  if (document.getElementById("hidden").style.display != "none") {
    hideForm("hidden");
  }
  document.getElementById("hidden2").style.display = "block";
}
// --------------------------------------------------------------------------------------

function deleteSet() {
  var deleteThisSet = document.getElementById("deleteSets").value;

  $.ajax({
    url: '/app/delete/' + sessionStorage.getItem('user') + '/' + deleteThisSet,
    method: 'GET',
    success: function (result) {
      if (result == "DELETED") {
        alert("Set was deleted!");
        getUserSetsDisplaySets();
        RightSideDisplaySetsForUser();
        toggleDelSet();
      } 
      else {
        console.log(result);
        alert("Error Occured! Please try again");
      }
    }
  });
}

function collapsibleSets() {
  var coll = document.getElementsByClassName("collapsible");
  console.log("doc: "+coll.length);
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        console.log("off state: " + content.style.display)
        content.style.display = "block";
      }
    });
  }
}
