const ganamaVmHost = `${process.env.VM_HOST ?? "ganama-vm"}:${
  process.env.VM_PORT ?? "3002"
}`;

const topicToMessages = new Map();

function addMessageToTopic(topic, labelledMessage) {
  if (topicToMessages.has(topic)) {
    topicToMessages.get(topic).push(labelledMessage);
  } else {
    topicToMessages.set(topic, [labelledMessage]);
  }
}

function getTopicHistory(topic) {
  if (topicToMessages.has(topic)) {
    return topicToMessages.get(topic);
  } else {
    return [];
  }
}

function getInterAgentHistory(topic) {
  return getTopicHistory(topic).filter((message) => {
    return (
      `${message.fromTeam}${message.fromAgent}` !==
      `${message.toTeam}${message.toAgent}`
    );
  });
}

async function sendMessage(
  topic,
  sameAgent,
  message,
  team,
  agent,
  layerNumber,
  fromIdentity
) {
  const labelledMessage = {
    fromTeam: fromIdentity.team,
    fromAgent: fromIdentity.agent,
    fromLayerNumber: fromIdentity.layerNumber,
    toTeam: team,
    toAgent: agent,
    toLayerNumber: layerNumber,
    text: message,
  };

  addMessageToTopic(topic, labelledMessage);

  const history = sameAgent
    ? getTopicHistory(topic)
    : getInterAgentHistory(topic);

  const endpoint = `http://${ganamaVmHost}/api/messages/${team.toLowerCase()}/${agent.toLowerCase()}/${layerNumber}`;

  // TODO: Could be a queue??
  const conversation = history.map((h) => h.text);
  fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ messages: conversation }),
    headers: {
      "X-Team": fromIdentity.team,
      "X-Agent": fromIdentity.agent,
      "X-LayerNumber": fromIdentity.layerNumber,
      "X-Topic": topic,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("Message to ", team, " ", agent, " ", layerNumber);
      response.text().then(response => console.log("LLM Response:", response));
    })
    .catch(console.error);

  return "MESSAGE_RECEIVED";
}

export async function messageOtherAgent(
  topic,
  message,
  team,
  agent,
  fromIdentity
) {
  message = `New message from ${fromIdentity.agent} in ${fromIdentity.team} team:\n\n${message}`;
  return sendMessage(topic, false, message, team, agent, 0, fromIdentity);
}

export async function messageLayerBelow(topic, message, identity) {
  const targetLayer = identity.layerNumber + 1;
  message = `New message from layer ${identity.layerNumber} to layer ${targetLayer}:\n\n${message}`;
  return sendMessage(
    topic,
    true,
    message,
    identity.team,
    identity.agent,
    targetLayer,
    identity
  );
}

export async function messageLayerAbove(topic, message, identity) {
  const targetLayer = identity.layerNumber - 1;
  message = `New message from layer ${identity.layerNumber} to layer ${targetLayer}:\n\n${message}`;
  return sendMessage(
    topic,
    true,
    message,
    identity.team,
    identity.agent,
    targetLayer,
    identity
  );
}
