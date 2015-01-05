var apiUrl = 'http://ufc.mait.fenomen.ee';

function registerCallback(chrome_token) {
  if (chrome.runtime.lastError) {
    return;
  }
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
    success: function (response) {
      console.log(response);

      if (response && response.result) {
       view();
      }
      else {
        $('.message', '#view_register').text('Registreerimine ebaõnnestus!');
      }
    }
  });
}

function play(email, type) {
  var data = {
    'email': email
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/play',
    data: data,
    success: function (response) {
      console.log(response);

      if (response && response.result) {
        if(type) {
          view();
        }
      }
      else {
        view_message('Mängu loomine ebaõnnestus');
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
  $('.view').hide();

  $('#view_register').show();
}

/**
 * Show create game view
 */
function view_play() {
  $('.view').hide();
  chrome.storage.local.get('email', function (data) {
    $('.name', '#view_play').text(data.email);
  });
  $('#view_play').show();
}

/**
 * view timer
 * view yes/no button
 */
function view_timer() {
  $('.view').hide();
  time_left(function (err, ret3) {
    if (err) {
      console.log('tile left error');
    }
    countdown('timer', ret3.minutes, ret3.seconds);
  });

  $('#view_timer').show();
}

/**
 * view timer
 * view yes/no button
 */
function view_spin() {
  $('.view').hide();

  $('#view_spin').show();
}

/**
 * view current game participants
 */
function view_game(data) {
  $('.view').hide();

  $('.team_1_1', '#view_game').text(data[0][0]);
  $('.team_1_2', '#view_game').text(data[0][1]);
  $('.team_2_1', '#view_game').text(data[1][0]);
  $('.team_2_2', '#view_game').text(data[1][1]);

  $('#view_game').show();
}

function view_message(message) {
  $('.view').hide();

  $('.message', '#view_message').text(message);
  $('#view_message').show();
}

/**
 * View if user participates in game
 */
function view_participating() {
  $('.view').hide();
  time_left(function (err, ret3) {
    if (err) {
      console.log('tile left error');
    }
    countdown('ptimer', ret3.minutes, ret3.seconds);
  });
  $('#view_participating').show();
}

function view_error() {
  view_message('Ei saa serveriga ühendust')
}

function action_play(email) {
  view_spin();
  action_iam_in(email, false);

  play(email, true);
}

function action_iam_in(email, state) {
  var data = {
    'email': email
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + ':3000/iam-in',
    dataType: 'json',
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      console.log(response);

      if (response) {
        if(state){
         view();
        }
      }
      else {
        action_message('Lisaine ebaõnnestus!');
      }
    }
  });
}

$(document).ready(function () {
  //get state and view
  view();

  $('#view_participating button.iam-out').click(function () {
    chrome.storage.local.get('email', function (data) {
      removePlayer(data.email);
    });
  });

  $('#view_register button.register').click(function () {
    action_register();
  });

  $('#view_play button.play').click(function () {
    chrome.storage.local.get('email', function (data) {
      action_play(data.email);
    });
  });

  $('#view_timer button.iam-in').click(function () {
    chrome.storage.local.get('email', function (data) {
      action_iam_in(data.email, true);
    });
  });
});

function player_registered(stateCallback) {
  chrome.storage.local.get('email', function (data) {
    var email = data.email;

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
      error: function () {
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
    url: apiUrl + '/api/get-players',
    dataType: 'json',
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      stateCallback(false, response);
    },
    error: function () {
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
    error: function (data, i, o) {
      console.log(data);
      console.log(i);
      console.log(o);
      callback(true);
    }
  });
}

function praticipating(callback) {
  chrome.storage.local.get('email', function (data) {
    var email = data.email;
    //var email = "test@tst.ee";

    var data = {
      'email': email
    };

    jQuery.ajax({
      type: 'POST',
      url: apiUrl + ':3000/participating',
      data: data,
      success: function (response) {
        callback(false, response);
      },
      error: function () {
        callback(true);
      }
    });
  });
}

function removePlayer(email) {

  var data = {
    'email': email
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + ':3000/iam-out',
    dataType: 'json',
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      console.log(response);

      if (response) {
        view();
      }
      else {
        action_message('Ebaõnnestus!');
      }
    }
  });
}

function getPlayers(callback) {
  var data = {
    'test': 'test'
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + 'api/get-players',
    dataType: 'json',
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      callback(false, response);
    },
    error: function () {
      callback(true);
    }
  });
}


function countdown(elementName, minutes, seconds) {
  var element, endTime, hours, mins, msLeft, time;

  function twoDigits(n) {
    return (n <= 9 ? "0" + n : n);
  }

  function updateTimer() {
    getCount(function (err, ret3) {
      if (err) {
        console.log('tile left error');
      }
      if (ret3)  {
        $('.count-nr','.count').text(ret3);
      }

    });
    msLeft = endTime - (+new Date);
    if (msLeft < 1000) {
      view_message("Time's UP!");
    } else {
      time = new Date(msLeft);
      hours = time.getUTCHours();
      mins = time.getUTCMinutes();
      element.innerHTML = (hours ? hours + ':' + twoDigits(mins) : mins) + ':' + twoDigits(time.getUTCSeconds());
      setTimeout(updateTimer, time.getUTCMilliseconds() + 500);
    }
  }

  element = document.getElementById(elementName);
  endTime = (+new Date) + 1000 * (60 * minutes + seconds) + 500;

  updateTimer();
}

function time_left(callback) {
  var data = {
    'test': 'test'
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + ':3000/time-left',
    data: data,
    success: function (response) {
      callback(false, response);
    },
    error: function () {
      callback(true);
    }
  });
}

function view() {
  view_spin();
  player_registered(function (err, ret) {
    if (err) {
      console.log('error palyer registered');
      view_error();
      return;
    }
    //registered or not
    if (ret.result) {
      //is game on?
      game_on(function (err, ret1) {
        if (err) {
          return console.log('error game on');
        }
        if (ret1.result) {
          createBadge('');
          view_game(ret1.result);
        } else {
          timer_on(function (err, ret4) {
            createBadge(':)');
            if (err) {
              console.log('error timer on ' + ret4);
              view_error();
              return;
            }
            if (ret4) {
              console.log('Timer on' + ret4);
              praticipating(function (err, ret2) {
                if (err) {
                  console.log('error');
                  view_error();
                  return;
                }
                  if (ret2) {
                    view_participating();
                  } else {
                    view_timer();
                  }
              });
            } else {
              view_play();
              createBadge('');
            }
          });
        }
      });
    } else {
      view_register();
      createBadge('');
    }
  });
}


function createBadge(message) {
  chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255]});
  chrome.browserAction.setBadgeText({text:message});
}

function getCount(callback) {
  var data = {
    'test': 'test'
  };

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + ':3000/get-count',
    data: data,
    success: function (response) {
      console.log(response);
      callback(false, response);
    },
    error: function () {
      callback(true);
    }
  });
}
