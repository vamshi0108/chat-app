const socket = io();
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#message");
const $messageFormButton = document.querySelector("#message-form");
const $sendLocation = document.querySelector("#send-location");
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const $messages = document.querySelector("#messages");
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    userName: message.userName,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("messageLocation", (location) => {
  const html = Mustache.render($locationTemplate, {
    userName: location.userName,
    location: location.text,
    createdAt: moment(message.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  //const message = document.querySelector("#message");
  //const message = e.target.elements.message.value;
  socket.emit("sendMessage", $messageFormInput.value, () => {
    console.log("Message delivered");
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
  });
});

$sendLocation.addEventListener("click", (e) => {
  e.preventDefault();
  $sendLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        console.log("Location delivered");
        $sendLocation.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
      }
    );
  });
});

socket.emit("join", { userName, room }, (error) => {
  alert(error);
  location.href = "/";
});
