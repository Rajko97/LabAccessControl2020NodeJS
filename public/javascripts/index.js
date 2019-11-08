const socket = io();
const sessionId = "123";

function onUnlockClicked() {
  socket.emit("unlock-req", sessionId);
}

socket.on("unlock-res", data => {
  let { time, message } = data;
  const element = document.getElementById("status");
  element.innerText = message;
});
