const socket = io();
function onUnlockClicked() {
  let token = document.getElementById("mac").value;
  socket.emit("unlock-req", sessionId);
}

socket.on("unlock-res", data => {
  let { time, message } = data;
  const element = document.getElementById("status");
  element.innerText = message;
});
