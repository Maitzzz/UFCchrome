/**

 */
/**
 var nodeUrl = 'http://ufc.mait.fenomen.ee';
 var apiUrl = 'http://ufc.mait.fenomen.ee';
 */

var development = false;

if (development)  {
  var nodeUrl = 'http://ufc.mait.fenomen.ee';
  var apiUrl = 'http://ufc.mait.fenomen.ee';
} else {
  var apiUrl = 'http://ufc.fenomen.ee';
  var nodeUrl = 'http://192.168.1.2';
}

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
        $('.message', '#view_register').text('Registreerimine ebaõnnestus!').fadeIn();

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
  chrome.storage.local.set({mute: false});
  var senderId = "874260943469";
  chrome.gcm.register([senderId], registerCallback);
}

/**
 * view register window
 */
function view_register() {
  $('#view_spin').hide();
  $('#header-wrapper').hide();
  $('.view').fadeOut();

  $('#view_register').fadeIn();
}

/**
 * Show create game view
 */
function view_play() {
  $('#header-wrapper').show();

  $('#view_spin').hide();
  $('.view').fadeOut();
  chrome.storage.local.get('email', function (data) {
    $('.name', '#view_play').text(data.email);
  });
  $('#view_play').fadeIn();
}

/**
 * view timer
 * view yes/no button
 */
function view_timer() {
  $('#header-wrapper').show();

  $('#view_spin').hide();
  $('.view').hide();
  time_left(function (err, ret3) {
    if (err) {
      console.log('tile left error');
    }
    countdown('timer', ret3.minutes, ret3.seconds);
  });

  $('#view_timer').fadeIn();
}

/**
 * view timer
 * view yes/no button
 */
function view_spin() {
  $('#header-wrapper').show();

  $('.view').hide();

  $('#view_spin').show();
}

/**
 * view current game participants
 */
function view_game(data) {
  $('#header-wrapper').show();

  $('#view_spin').hide();
  $('.view').fadeOut();

  $('.team_1_1', '#view_game').text(data[0][0]);
  $('.team_1_2', '#view_game').text(data[0][1]);
  $('.team_2_1', '#view_game').text(data[1][0]);
  $('.team_2_2', '#view_game').text(data[1][1]);

  $('#view_game').fadeIn();
}

function view_score() {
  view_spin();
  $('#header-wrapper').show();

  getScore(function (err, ret3) {
    if (err) {
      console.log('tile left error');
    }
    var rows = document.getElementById("score-body").getElementsByTagName("tr").length;
    if (ret3 && rows == 1) {
      var array = ret3.result.reverse();
      var table = document.getElementById("score-body");
      var arrayLength = array.length;
      for (var i = 0; i < arrayLength; i++) {
        var row = table.insertRow(i+1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = array[i].position;
        cell2.innerHTML = array[i].player;
        cell3.innerHTML = array[i].score;      }
    }
    $('.view').hide();
    $('#score-wrapper').fadeIn(300);
  });
}

function view_message(message) {
  $('#header-wrapper').show();

  $('#view_spin').hide();
  $('.view').hide();
  $('.message', '#view_message').text(message);
  $('#view_message').fadeIn();
}

/**
 * View if user participates in game
 */
function view_participating() {
  $('#header-wrapper').show();

  $('#view_spin').hide();
  $('.view').fadeOut();
  time_left(function (err, ret3) {
    if (err) {
      console.log('tile left error');
    }
    countdown('ptimer', ret3.minutes, ret3.seconds);
  });
  $('#view_participating').fadeIn();
}

function view_error() {
  $('#header-wrapper').show();

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
    url: nodeUrl + ':3000/iam-in',
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
    action_mute();
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
    action_mute();
    chrome.storage.local.get('email', function (data) {
      action_iam_in(data.email, true);
    });
  });

  $('.team_1 .win').click(function () {
    $.get(apiUrl + '/ajax/match/current/team/red/thumbs-up');
    view();
  });

  $('.team_2 .win').click(function () {
    $.get(apiUrl + '/ajax/match/current/team/blue/thumbs-up');
    view();
  });

  $('.header-menu .score').click(function () {
    view_score();
  });

  $('.header-menu .game').click(function () {
    view();
  });

   $('.navbar .volume').click(function () {
     action_mute();
     if($('.navbar .volume i').hasClass('glyphicon-volume-up')) {
       $('.navbar .volume i').removeClass('glyphicon-volume-up').addClass('glyphicon-volume-off');
       chrome.storage.local.set({mute: true});
     } else {
       $('.navbar .volume i').removeClass('glyphicon-volume-off').addClass('glyphicon-volume-up');
       chrome.storage.local.set({mute: false});
     }
   });

  chrome.storage.local.get('mute', function (data) {
    if(data.mute) {
      $('.navbar .volume i').removeClass('glyphicon-volume-up').addClass('glyphicon-volume-off');
    }    else {
      $('.navbar .volume i').removeClass('glyphicon-volume-off').addClass('glyphicon-volume-off');
    }
  });

  $('.navbar .notification').click(function () {
    if($('.navbar .notification i').hasClass('glyphicon-ok')) {
      notificationsofIcon(false);
      $('.navbar .notification i').removeClass('glyphicon-ok').addClass('glyphicon-remove');
      chrome.storage.local.set({notifications: true});
    } else {
      notificationsofIcon(true);
      $('.navbar .notification i').removeClass('glyphicon-remove').addClass('glyphicon-ok');
      chrome.storage.local.set({notifications: false});
    }
  });

  chrome.storage.local.get('notifications', function (data) {
    if(data.notifications) {
      notificationsofIcon(false);
      $('.navbar .notification i').removeClass('glyphicon-ok').addClass('glyphicon-remove');
    }    else {
      notificationsofIcon(true);
      $('.navbar .notification i').removeClass('glyphicon-remove').addClass('glyphicon-ok');
    }
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

  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/get-players',
    dataType: 'json',
    contentType: "application/json",
    success: function (response) {
      stateCallback(false, response);
    },
    error: function () {
      stateCallback(true);
    }
  });

}

function timer_on(callback) {

  jQuery.ajax({
    type: 'POST',
    url: nodeUrl + ':3000/timer-running',
    dataType: 'json',
    contentType: "application/json",
    success: function (response) {
      callback(false, response);
    },
    error: function (data, i, o) {
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
      url: nodeUrl + ':3000/participating',
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
    url: nodeUrl + ':3000/iam-out',
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
    url: apiUrl + '/api/get-players',
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
        if(ret3 != 'false') {
          $('.count-nr','.count').text(ret3);
          createBadge(ret3);
        }
      }
    });

    msLeft = endTime - (+new Date);
    if (msLeft < 100) {
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
    url: nodeUrl + ':3000/time-left',
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
  chrome.browserAction.setBadgeBackgroundColor({color:[0, 255, 0, 255]});
  chrome.browserAction.setBadgeText({text:message});
}

function getCount(callback) {
  jQuery.ajax({
    type: 'POST',
    url: nodeUrl + ':3000/get-count',
    success: function (response) {
      console.log(response);
      callback(false, response);
    },
    error: function () {
      callback(true);
    }
  });
}

function getScore(callback) {
  jQuery.ajax({
    type: 'POST',
    url: apiUrl + '/api/get-score',
    success: function (response) {
      callback(false, response);
    },
    error: function () {
      callback(true);
    }
  });
}

function action_mute() {
  var otherWindows = chrome.extension.getBackgroundPage();
  otherWindows.mute();
}

function notificationsofIcon(state) {
  if(state) {
    var path = '../images/ic_launcher.png'
  } else {
    path = '../images/ic_launcher_gray.png'
  }
  chrome.browserAction.setIcon({
    path: path
  });
}