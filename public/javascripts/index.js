const socket = io();

const userElement = document.getElementById("username");
const passElement = document.getElementById("password");
const macElement = document.getElementById("mac");
const tokenElement = document.getElementById("token");

const loginResElement = document.getElementById("loginResponse");

function onUnlockClicked() {
  socket.emit("unlock-req", tokenElement.value);
}

socket.on("unlock-res", data => {
  let { time, message } = data;
  const element = document.getElementById("status");
  element.innerText = message;
});

function onLoginClicked() {
  console.log("onLoginC");
  const username = userElement.value;
  const password = passElement.value;
  const MACAddress = macElement.value;

  $.ajax({
    type: "POST",
    url: "users/login",
    data: { username: username, password: password, MACAddress: MACAddress },
    success: data => {
      loginResElement.innerText = JSON.stringify(data, undefined, 2);
    },
    error: data => {
      loginResElement.innerText = JSON.stringify(data, undefined, 2);
    }
  });
}
