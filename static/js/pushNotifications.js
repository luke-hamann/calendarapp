const hasPermission = () => (Notification.permission == "granted");
const isWebPushEnabled = () => (localStorage.getItem("webpush") != null);

// Start listening for notifications
const eventSource = new EventSource("/notifications/");
eventSource.onmessage = (event) => {
  console.log(event.data);

  if (hasPermission() && isWebPushEnabled()) {
    console.log("Pushing...");
    new Notification(event.data);
  }
};

const button = document.querySelector("#web-push-toggle");

const disableWebPush = () => {
  button.innerText = "Push OFF";
  localStorage.removeItem("webpush");
};

const enableWebPush = () => {
  Notification.requestPermission()
    .then((permission) => {
      if (permission == "granted") {
        button.innerText = "Push ON";
        localStorage.setItem("webpush", "");
      } else {
        disableWebPush();
      }
    });
};

if (isWebPushEnabled()) enableWebPush();

button.addEventListener('click', () => {
  console.log("Toggle...");
  if (isWebPushEnabled()) disableWebPush();
  else enableWebPush();
});
