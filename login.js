function getAuthorizationFromResponse(muluToken, xhr) {
  var tokenAux = xhr.getResponseHeader('Authorization');

  if (tokenAux) {
    muluToken.token = tokenAux.replace('Bearer ', '');
  }

  return muluToken;
}

function login() {
  var loginXHR = new XMLHttpRequest();
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  if (! email || ! password) {
    return;
  }

  loginXHR.open('POST', BACKEND_URL + '/mulu_users/login', true);
  loginXHR.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  loginXHR.onload = function () {
    var response = JSON.parse(this.responseText);

      if (response.success === false) {
          var alert  = document.getElementById('alert');
          alert.innerHTML = '';
          alert.innerHTML += response.message;
      } else {
          if (response.data.token) {
              localStorage.setItem('muluToken', JSON.stringify(response.data));
          }
          getProfile();
      }
  };

  loginXHR.send('email=' + email + '&password=' + password);
}

function getProfile() {
  var profileXHR = new XMLHttpRequest();
  var muluToken = JSON.parse(localStorage.getItem('muluToken'));

  profileXHR.open('GET', BACKEND_URL + '/mulu_users/profile', true);
  profileXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
  profileXHR.setRequestHeader('Content-type', 'application/json');

  profileXHR.onload = function () {
    var response = JSON.parse(this.responseText);
    var tokenAux = getAuthorizationFromResponse(muluToken, profileXHR);

    localStorage.setItem('muluToken', JSON.stringify(tokenAux));
    localStorage.setItem('muluUser', JSON.stringify(response.data));

    location.replace('popup.html');
  };

  profileXHR.send();
}

window.onload = function() {
  var linkLogin = document.getElementById('link-login');

  if (linkLogin) {
    linkLogin.addEventListener('click', function () {
      login();
    });
  }
};
