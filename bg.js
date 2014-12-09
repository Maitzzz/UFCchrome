function register() {
  $('#wrapper').css('disply', 'none');
  $('#status').css('display', 'block');
  var senderId = "874260943469";
  chrome.gcm.register([senderId], registerCallback);
}

function registerCallback(regId) {
  registrationId = regId;
  if (chrome.runtime.lastError) {
    return;
  }
  chrome.storage.local.set({registered: true});
  subscribe();
  console.log(registrationId);
}

function subscribe() {
  var apiUrl = 'http://ufcdev.mait.fenomen.ee';
  var email = $("#email").val();

  // Save user E-mail
  chrome.storage.local.set({email: email});

  var j = {
    "email": email,
    "chrome_token": registrationId
  }

  jQuery.ajax({
    type: "POST",
    url: apiUrl + "/api/subscribe",
    data: JSON.stringify(j),
    success: function (response) {
      if (response) {

      }

    }
  });
}


$(document).ready(function () {
  $("#register").click(function () {
    register();
  });
});

window.onload = function () {
  chrome.storage.local.get(function (result) {
    //    var allKeys = Object.keys(result);
//todo- ei lähe vaja
    var values = result;
  /*  console.log(values);*/
    // Kui on registreeritud
    if (values.registered) {
      //Kui on loosimise aja sees
      if (values.popuptime > Date.now()) {
        //Kui oaLEB MÄNGUS
        if (values.participating) {
          //osaleb loosimises popup

        } else {
          // ei osale mängus
        }
      } else {
        // Registered popup, with links and stuff etc.
      }
    } else {
      // Ei ole registreerunud.
   //   $('body').load('register.html');

    }
  });

};
