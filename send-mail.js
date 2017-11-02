function setLocalStorageTokenFromResponse(muluToken, xhr) {
  var tokenAux = xhr.getResponseHeader('Authorization');

  if (tokenAux) {
    muluToken.token = tokenAux.replace('Bearer ', '');
  }

  localStorage.setItem('muluToken', JSON.stringify(muluToken));
}

function getUrlToShare(muluUser, guide) {
  return FRONTEND_URL + 'guides/' + muluUser.slug + '/' + guide.slug;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
}

function sendEmail() {
  var muluUser = JSON.parse(localStorage.getItem('muluUser'));
  var guide = JSON.parse(localStorage.getItem('guide'));
  var emailData = {
    url: getUrlToShare(muluUser, guide),
    id: guide.id
  }
  var sendEmailXHR = new XMLHttpRequest();
  var muluToken = JSON.parse(localStorage.getItem('muluToken'));
  var friendEmail = document.getElementById('friend-email').value;

  if (! friendEmail || ! validateEmail(friendEmail)) {
    console.log("EMAIL INVALID");

    return;
  }

  emailData.email = friendEmail;
  emailData.message = document.getElementById('message').value;

  sendEmailXHR.open('POST', BACKEND_URL + '/travels/email', true);
  sendEmailXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
  sendEmailXHR.setRequestHeader('Content-Type', 'application/json');

  sendEmailXHR.onload = function () {
    var response = JSON.parse(this.responseText);
    setLocalStorageTokenFromResponse(muluToken, sendEmailXHR);

    location.replace('success-mail.html');
  };

  sendEmailXHR.send(JSON.stringify(emailData));
}


window.onload = function() {
  var linkSendEmail = document.getElementById('link-send-email');

  if (linkSendEmail) {
    linkSendEmail.addEventListener('click', function () {
      sendEmail();
    });
  }
};
