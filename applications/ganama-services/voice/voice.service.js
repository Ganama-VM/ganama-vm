const ganamaVmHost = `${process.env.VM_HOST ?? "ganama-vm"}:${
  process.env.VM_PORT ?? "3002"
}`;

const serviceUniqueId = "ganama-services.voice";

let sockets = [];

async function getSettings() {
  const settingsEndpoint = `http://${ganamaVmHost}/api/settings/${serviceUniqueId}`;
  const response = await fetch(settingsEndpoint);
  return response.json();
}

async function sendMessage(message) {
  const settings = await getSettings();
  const endpoint = `http://${ganamaVmHost}/api/messages/${settings.TEAM}/${settings.AGENT}/0`;

  fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ messages: [message] }),
    headers: {
      "X-Topic": endpoint,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      response.text().then(console.log);
    })
    .catch(console.error);
}

export function speakToUser(message, _identity) {
  for (const socket of sockets) {
    socket.emit("message", { message });
  }
}

export function addSocket(socket) {
  sockets.push(socket);
  socket.on("message", (msg) => sendMessage(msg.message));
  socket.on("disconnect", () => removeSocket(socket));
}

function removeSocket(socket) {
  sockets = sockets.filter((s) => s.id !== socket.id);
}
