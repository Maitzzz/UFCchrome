window.addEventListener("load", function () {
  chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
});

/** LIVE SEIS
 * var nodeUrl = 'http://ufc.mait.fenomen.ee';
 * @type {string}
 */


/** ARENDUS SEIS
  var nodeUrl = 'http://192.168.1.2';
 */

var nodeUrl = 'http://ufc.mait.fenomen.ee';
var status;

// Returns a new notification ID used in the notification.
function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString();
}

function messageReceived(message) {

  switch (message.data.type) {
    case 'fail':
      message_popup(message);
      createBadge('');
      break;

    case 'call':
      invitation_popup(message);
      status = true;
      badgeLoop();

      break;

    case 'match':
      message_popup(message);
      createBadge('');
      break;

    case 'end':
      createBadge('');
      status = false;
      break;
  }
}

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(messageReceived);

function notificationBtnClick(notID, iBtn) {
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

  //set answeret TRUE
  chrome.storage.local.set({participating: true});
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
