const ApiConfig = (() => {
  const { protocol, hostname } = window.location;
  const port = 5000;

  // Only include port if we're not on localhost or 0.0.0.0
  // const portPart = ["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname) ? `:${port}` : '';
  const portPart = `:${port}`;

  return {
    serverUrl: `${protocol}//${hostname}${portPart}`,
  };
})();
export const fromServer = (url) => ApiConfig.serverUrl + url;
export default ApiConfig;
