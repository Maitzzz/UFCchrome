var apiUrl = 'http://ufc.mait.fenomen.ee';

function registerCallback(chrome_token) {
  if (chrome.runtime.lastError) {
    return;
  }

  chrome.storage.local.set({registered: true});

  register(chrome_token);
}

function register(chrome_token) {
  var email = $('#view_register .email').val();

  // Save user E-mail
  chrome.storage.local.set({email: email});

  var data = {
    'email': email,
    'chrome_token': chrome_token
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/register',
    data: data,
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
    'token': chrome_token
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/play',
    data: JSON.stringify(data),
    success: function(response) {
      console.log(response);

      if (response && response.result) {

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


function action_register() {
  var senderId = "874260943469";

  chrome.gcm.register([senderId], registerCallback);
}

/**
 * view register window
 */
function view_register() {
  $('#view_game').hide();
  $('#view_play').hide();
  $('#view_timer').hide();

  $('#view_register').show();
}

/**
 * Show create game view
 */
function view_play() {
  $('#view_game').hide();
  $('#view_register').hide();
  $('#view_timer').hide();

  $('#view_play').show();
}


/**
 * view timer
 * view yes/no button
 */
function view_timer() {
  $('#view_game').hide();
  $('#view_play').hide();
  $('#view_register').hide();

  $('#view_timer').show();
}

/**
 * view current game participants
 */
function view_game() {
  $('#view_timer').hide();
  $('#view_play').hide();
  $('#view_register').hide();

  $('#view_game').show();
}

function view_message() {
  $('.view').hide();

  $('#message').show();
}


function action_play() {
  var senderId = "874260943469";

  chrome.gcm.register([senderId], playCallback);
}


function action_iam_in(email) {

  var data = {
    'email': email
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + ':3000/iam-in',
    dataType:'json',
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function(response) {
      console.log(response);

      if (response && response.result) {
        view_iam_in();
      }
      else {
        action_message('Mängu loomine ebaõnnestus!');
      }
    }
  });
}

function action_message(message) {
  view_message();

  $('#message').html(message);
}


$(document).ready(function () {

  player_registered(function (err, ret) {
    if(err) {
      return console.log('error');
    }
    //registered or not
    if(ret.result) {
      //is game on?
      game_on(function (err, ret) {
        if(err) {
          return console.log('error');
        }
        if(ret.result) {
          view_game();
        } else {
          timer_on(function(err, ret) {
            if (err) {
              return console.log('error');
            }
            if(ret) {
              view_timer();
            } else {
              view_play();
            }
          });

        }
      });

      //view_game();
    } else {
      view_register();
    }

  });

  $('#view_register button.register').click(function () {
    action_register();
  });

  $('#view_play button.play').click(function () {
    action_play();
  });

  $('#view_timer button.iam-in').click(function () {
    chrome.storage.local.get('email', function(data) {
      action_iam_in(data.email);
    });

  });
});

function player_registered(stateCallback) {
  chrome.storage.local.get('email', function(data) {
    var email = data.email;
    var data = data;

    var data = {
      'email': email
    };

    jQuery.ajax({
      type: 'POST',
      url: apiUrl + '/api/registered',
      data: data,
      success: function (response) {
        stateCallback(false, response);
      },
      error: function() {
        stateCallback(true);
      }
    });
  });
}

function game_on(stateCallback) {
    var data = {
      'test': 'test'
    };

    jQuery.ajax({
      type: 'POST',
      url: apiUrl + '/api/game',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        stateCallback(false, response);
      },
      error: function() {
        stateCallback(true);
      }
    });

}

function timer_on(callback) {
  var data = {
    'test': 'test'
  };
  jQuery.ajax({
    type: 'POST',
    url: apiUrl + ':3000/timer-running',
    dataType: 'json',
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      callback(false, response);
    },
    error: function() {
      callback(true);
    }
  });
}
