function getAuthorizationFromResponse(muluToken, xhr) {
  var tokenAux = xhr.getResponseHeader('Authorization');

  if (tokenAux) {
    muluToken.token = tokenAux.replace('Bearer ', '');
  }

  return muluToken;
}

function register() {
  var registerXHR = new XMLHttpRequest();
  var registerData = {
    first_name: document.getElementById('first-name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    living_in: document.getElementById('living-in').value
  };

  if (! registerData.first_name || ! registerData.email || ! registerData.password) {
    return;
  }

  registerXHR.open('POST', BACKEND_URL + '/mulu_users/register', true);
  registerXHR.setRequestHeader('Content-type', 'application/json');

  registerXHR.onload = function () {
    var response = JSON.parse(this.responseText);

    if (response.success === false) {
        var alert  = document.getElementById('alert');
        alert.innerHTML = '';
        alert.innerHTML += response.message;
    } else {
        localStorage.setItem('muluUser', JSON.stringify(response.data));
        login();
    }

  };

  registerXHR.send(JSON.stringify(registerData));
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

    if (response.data.token) {
      localStorage.setItem('muluToken', JSON.stringify(response.data));
    }

    location.replace('popup.html');
  };

  loginXHR.send('email=' + email + '&password=' + password);
}

window.onload = function() {
  var linkRegister = document.getElementById('link-register');

  if (linkRegister) {
    linkRegister.addEventListener('click', function () {
      register();
    });
  }
};
