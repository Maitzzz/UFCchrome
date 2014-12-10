var apiUrl = 'http://ufcdev.mait.fenomen.ee';

function registerCallback(chrome_token) {
  if (chrome.runtime.lastError) {
    return;
  }

  chrome.storage.local.set({registered: true});

  register(chrome_token);
}

function register(chrome_token) {
  var email = $('#register .email').val();

  // Save user E-mail
  chrome.storage.local.set({email: email});

  var data = {
    'email': email,
    'chrome_token': chrome_token
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/register',
    data: JSON.stringify(data),
    success: function(response) {
      console.log(response);

      if (response && response.result) {
        view_play();
      }
      else {
        action_message('Registreerimine ebaõnnetus!');
      }
    }
  });
}

function playCallback(chrome_token) {
  if (chrome.runtime.lastError) {
    return;
  }

  play(chrome_token);
}

function play(chrome_token) {
  var data = {
    'chrome_token': chrome_token
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/play',
    data: JSON.stringify(data),
    success: function(response) {
      console.log(response);

      if (response && response.result) {
        //view_timer();

        chrome.notifications.create("", {
          title: message.data.title,
          iconUrl: 'ic_launcher.png',
          type: 'basic',
          message: message.data.message,
          buttons: [{
            title: "Mängin"

          }, {
            title: "Ei mängi"

          }]
        }, function (id) {
          myNotificationID = id;
        });
      }
      else {
        action_message('Mängu loomine ebaõnnestus');
      }
    }
  });
}

function view_register() {
  $('.view').hide();

  $('#register').show();
}

function action_register() {
  var senderId = "874260943469";

  chrome.gcm.register([senderId], registerCallback);
}

function view_play() {
  $('.view').hide();

  $('#play').show();
}

function action_play() {
  var senderId = "874260943469";

  chrome.gcm.register([senderId], playCallback);
}

function view_iam_in() {
  $('.view').hide();

  $('#participate').show();
}

function action_iam_in() {

}

function action_message(message) {
  view_message();

  $('#message').html(message);
}

function view_message() {
  $('.view').hide();

  $('#message').show();
}

function action_timer() {
  view_timer();
}

function view_timer() {
  $('.view').hide();

  $('#timer').show();
}

$(document).ready(function () {
  $('#register button.register').click(function () {
    action_register();
  });

  $('#play button.play').click(function () {
    action_play();
  });

  $('#participate button.iam-in').click(function () {
    action_iam_in();
  });
});
