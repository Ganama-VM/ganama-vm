const socket = io("http://localhost:3002", {
  path: "/webhooks/ganama-services/voice-io",
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;

function setIsEnabled(text) {
  document.getElementById("msg").innerHTML = text;
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.volume = 1;
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.speak(msg);
}

socket.on("message", (message) => {
  console.log(message.message);
  speak(message.message);
});

async function sendMessageToAgent(message) {
  console.log(message);
  socket.emit("message", { message });
}

recognition.addEventListener("result", (event) => {
  const message = event.results[event.resultIndex][0].transcript;
  sendMessageToAgent(message);
});

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");

startButton.addEventListener("click", () => {
  recognition.start();
  setIsEnabled("Speech Enabled");
});

stopButton.addEventListener("click", () => {
  recognition.stop();
  setIsEnabled("Speech Paused");
});
