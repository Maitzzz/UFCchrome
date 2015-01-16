/** LIVE SEIS
  var nodeUrl = 'http://ufc.mait.fenomen.ee';
 * @type {string}
 */

/** ARENDUS SEIS
  var nodeUrl = 'http://192.168.1.2';

 */

var development = false;

if (development)  {
  var nodeUrl = 'http://ufc.mait.fenomen.ee';
} else {
  var nodeUrl = 'http://192.168.1.2';
}

var status;

document.write('<audio id="player" src="http://ufc.fenomen.ee/sites/default/files/sound.mp3" loop="true"></audio>');

window.addEventListener("load", function () {
  chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
});

function messageReceived(message) {

  chrome.storage.local.get('notifications', function (data) {
    if(data.notifications){
      return;
    }

    switch (message.data.type) {
    case 'fail':
      message_popup(message);
      createBadge('');
      break;f

    case 'call':
      invitation_popup(message);
      status = true;
      badgeLoop();
      chrome.storage.local.get('mute', function (data) {
        if(!data.mute){
          document.getElementById('player').play();
          var volume =  document.getElementById('player');
          volume.volume = 0.3;
        }
      });
      break;

    case 'match':
        message_popup(message);
        createBadge('');
        mute();
      break;

    case 'end':
      mute();
      createBadge('');
      status = false;
      break;

  }
  });
}

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(messageReceived);

function notificationBtnClick(notID, iBtn) {
  document.getElementById('player').pause();
  if (iBtn == 0) {
    eventResponse(0);
  }
}

function eventResponse(answer) {
  chrome.storage.local.get("email", function (result) {
    var email = result["email"];

    var j = {
      'email': email,
      'answer': true
    };

    jQuery.ajax({
      type: 'POST',
      url: nodeUrl + ':3000/iam-in',
      dataType:'json',
      contentType: "application/json",
      data: JSON.stringify(j),
      success: function(response) {
        console.log(response);
        if (response && response.result) {

        }
      }
    });
  });
}

function invitation_popup(message) {
  chrome.notifications.create("", {
    title: message.data.title,
    iconUrl: '../images/ic_launcher.png',
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

function message_popup(message) {
  chrome.notifications.create("", {
    title: message.data.title,
    iconUrl: '../images/ic_launcher.png',
    type: 'basic',
    message: message.data.message
  }, function (id) {
    myNotificationID = id;
  });
}

function outDated() {

  chrome.notifications.create("", {
    title: 'Time out!',
    iconUrl: '../images/ic_launcher.png',
    type: 'basic',
    message: 'Time out!'
  }, function (id) {
    myNotificationID = id;
  });
}

function createBadge(message) {
  chrome.browserAction.setBadgeBackgroundColor({color:[0, 255, 0, 255]});
  chrome.browserAction.setBadgeText({text:message});
}

function badgeLoop() {
  var loop = setInterval(function () {
      getCount(function (err, ret3) {
        if (err) {
          console.log('tile left error');
        }
        if (ret3 && ret3 != 'false') {
          createBadge(ret3);
        }else {
          window.clearTimeout(loop);
          createBadge('');
        }
      });
  }, 5000);
}

function getCount(callback) {
  var data = {
    'test': 'test'
  };

  jQuery.ajax({
    type: 'POST',
    url: nodeUrl + ':3000/get-count',
    data: data,
    success: function (response) {
      callback(false, response);
    },
    error: function () {
      callback(true);
    }
  });
}

$(document).ready(function () {
    badgeLoop();
});

function mute() {
  document.getElementById('player').pause();
}