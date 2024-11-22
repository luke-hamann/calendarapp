// deno-lint-ignore-file

window.onload = () => {
  Notification.requestPermission();
  const eventSource = new EventSource("/notifications/");
  eventSource.onmessage = (event) => {
    console.log(event.data);
    new Notification(event.data);
  };
};
