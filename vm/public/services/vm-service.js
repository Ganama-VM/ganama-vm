export const getServices = async () => {
  const response = await fetch("/api/services");
  return response.json();
};

export const getSettingsForService = async (serviceUniqueId) => {
  const response = await fetch(`api/settings/${serviceUniqueId}`);
  return response.json();
};

export const setSettingForService = async (serviceUniqueId, key, value) => {
  const response = await fetch(`api/settings/${serviceUniqueId}/${key}`, {
    method: "POST",
    body: JSON.stringify({
      value,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};
