const socket = io();

const userElement = document.getElementById("username");
const passElement = document.getElementById("password");
const macElement = document.getElementById("mac");
const tokenElement = document.getElementById("token");

const loginResElement = document.getElementById("loginResponse");

function onUnlockClicked() {
  socket.emit("unlock-req", tokenElement.value);
}

function onRefreshUsersClicked() {
  socket.emit("getActiveMembers", tokenElement.value);
}

function onCheckInClicked() {
  socket.emit("checkIn", tokenElement.value);
}

function onCheckOutClicked() {
  socket.emit("checkOut", tokenElement.value);
}

socket.on("unlock-res", data => {
  let { time, message } = data;
  const element = document.getElementById("status");
  element.innerText = message;
});

socket.on("checkIn-res", data => {
  const checkStatus = document.getElementById("checkStatus");
  if (data.message == macElement.value || data.message == "AlreadyIn") {
    checkStatus.innerText = "Inside";
  }
  if (
    data.message != "AlreadyIn" &&
    data.message != "InvalidToken" &&
    data.message != "WrongNetwork"
  ) {
    const list = document.getElementById("currentInLabList");
    const listItem = document.createElement("li");
    listItem.setAttribute("id", data.message);
    listItem.appendChild(document.createTextNode(data.message));
    list.appendChild(listItem);
  }
  loginResElement.innerText = JSON.stringify(data, undefined, 2);
});

socket.on("checkOut-res", data => {
  const checkStatus = document.getElementById("checkStatus");
  if (data.message == macElement.value || data.message == "NotFound") {
    checkStatus.innerText = "Outside";
  }
  if (
    data.message != "NotFound" &&
    data.message != "InvalidToken" &&
    data.message != "WrongNetwork"
  ) {
    var item = document.getElementById(data.message);
    if (item) item.parentNode.removeChild(item);
  }
  loginResElement.innerText = JSON.stringify(data, undefined, 2);
});

socket.on("getActiveMembers-res", data => {
  loginResElement.innerText = JSON.stringify(data, undefined, 2);
  const list = document.getElementById("currentInLabList");
  list.innerText = "";
  for (const user of data) {
    const listItem = document.createElement("li");
    listItem.setAttribute("id", user);
    listItem.appendChild(document.createTextNode(user));
    list.appendChild(listItem);
  }
});

function onLoginClicked() {
  const username = userElement.value;
  const password = passElement.value;
  const MACAddress = macElement.value;

  $.ajax({
    type: "POST",
    url: "users/login",
    data: { username: username, password: password, MACAddress: MACAddress },
    success: data => {
      loginResElement.innerText = JSON.stringify(data, undefined, 2);
      tokenElement.value = JSON.parse(JSON.stringify(data)).token;
    },
    error: data => {
      loginResElement.innerText = JSON.stringify(data, undefined, 2);
    }
  });
}
