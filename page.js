window.addEventListener("load", function () {
  chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
});

var apiUrl = 'http://ufc.mait.fenomen.ee';

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

      break;

    case 'match':
      message_popup(message);
      console.log(1);
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
      url: apiUrl + ':3000/iam-in',
      dataType:'json',
      contentType: "application/json",
      data: JSON.stringify(j),
      success: function(response) {
        console.log(response);

        if (response && response.result) {
          view_iam_in();
        }
        else {
          action_message('Mängija lisamine ebaõnnestus!');
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


//todo ???ZZz
/*window.init = function() {*/

function outDated() {

  chrome.notifications.create("", {
    title: 'Time out!',
    iconUrl: 'ic_launcher.png',
    type: 'basic',
    message: 'Time out!'
  }, function (id) {
    myNotificationID = id;
  });
}

/*chrome.browserAction.onClicked.addListener(function () {

  timer_on(function(err, ret) {
    if (err) {
      return console.log('errro');
    }

    if(ret) {
      chrome.windows.create({
        'url': 'popup.html',
        'type': 'popup'
      }, function (window) {
      });
    } else {
      chrome.browserAction.setPopup({ popup: 'popup.html'});
    }

  });
});*/
