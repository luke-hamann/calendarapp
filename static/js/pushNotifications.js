const PUSH_ON_LABEL = "Push&nbsp;ON";
const PUSH_OFF_LABEL = "Push&nbsp;OFF";

const hasPermission = () => (Notification.permission == "granted");
const isWebPushEnabled = () => (localStorage.getItem("webpush") != null);

const button = document.querySelector("#web-push-toggle");

const disableWebPush = () => {
  button.innerHTML = PUSH_OFF_LABEL;
  localStorage.removeItem("webpush");
};

const enableWebPush = () => {
  Notification.requestPermission()
    .then((permission) => {
      if (permission == "granted") {
        button.innerHTML = PUSH_ON_LABEL;
        localStorage.setItem("webpush", "");
      } else {
        disableWebPush();
      }
    });
};

button.addEventListener("click", () => {
  if (isWebPushEnabled()) disableWebPush();
  else enableWebPush();
});

if (isWebPushEnabled()) enableWebPush();

const eventSource = new EventSource("/notifications/");

// Start listening for notifications
eventSource.onmessage = (event) => {
  if (hasPermission() && isWebPushEnabled()) {
    new Notification("Coolander", { body: event.data, icon: "/img/icon.png" });
  }
};

window.onbeforeunload = () => {
  eventSource.close();
};
