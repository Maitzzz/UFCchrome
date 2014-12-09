
window.addEventListener("load", function () {
  chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
});

// Returns a new notification ID used in the notification.
function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString();
}

function messageReceived(message) {

  switch (message.data.type) {
    case 'fail':
      message_popup(message);
      break;

    case 'call':
      invitation_popup(message);
      chrome.storage.local.set({participating: false});
      //2 minute timer
      chrome.storage.local.set({popuptime: Date.now() + 120000});

      break;

    case 'match':
      message_popup(message);
      chrome.storage.local.set({participating: false});
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

    var apiUrl = 'http://ufcdev.mait.fenomen.ee';

    var j = {
      "email": email,
      "answer": true
    }

    jQuery.ajax({
      type: "POST",
      url: apiUrl + "/api/response",
      data: JSON.stringify(j),
      success: function (response) {
      }
    });
  });

  //set answeret TRUE
  chrome.storage.local.set({participating: true});
}

function invitation_popup(message) {
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

function message_popup(message) {
  chrome.notifications.create("", {
    title: message.data.title,
    iconUrl: 'ic_launcher.png',
    type: 'basic',
    message: message.data.message
  }, function (id) {
    myNotificationID = id;
  });

}

chrome.notifications.update(id, {priority : 1}, function(wasUpdated) {
  if(wasUpdated) {
    chrome.notifications.update(id, {priority : 2}, function() {});
  } else {
    // Notification was fully closed; either stop updating or create a new one
  }
});