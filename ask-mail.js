function setLocalStorageTokenFromResponse(muluToken, xhr) {
  var tokenAux = xhr.getResponseHeader('Authorization');

  if (tokenAux) {
    muluToken.token = tokenAux.replace('Bearer ', '');
  }

  localStorage.setItem('muluToken', JSON.stringify(muluToken));
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
}

function askByEmail() {
  var muluUser = JSON.parse(localStorage.getItem('muluUser'));
  var recommendation = JSON.parse(localStorage.getItem('recommendation'));
  var askByEmailXHR = new XMLHttpRequest();
  var muluToken = JSON.parse(localStorage.getItem('muluToken'));
  var friendEmail = document.getElementById('friend-email').value;

  if (! friendEmail || ! validateEmail(friendEmail)) {
    console.log("EMAIL INVALID");

    return;
  }

  recommendation.email = friendEmail;
  recommendation.message = document.getElementById('message').value;

  askByEmailXHR.open('POST', BACKEND_URL + '/travels/recommendations/email', true);
  askByEmailXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
  askByEmailXHR.setRequestHeader('Content-Type', 'application/json');

  askByEmailXHR.onload = function () {
    var response = JSON.parse(this.responseText);
    setLocalStorageTokenFromResponse(muluToken, askByEmailXHR);

    location.replace('success-mail.html');
  };

  askByEmailXHR.send(JSON.stringify(recommendation));
}


window.onload = function() {
  document.getElementById('link-ask-email').addEventListener('click', function () {
    askByEmail();
  });
};
