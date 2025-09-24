import os from "os";

function obtainLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  let localIP = "localhost";

  for (const iface of Object.values(networkInterfaces)) {
    for (const i of iface) {
      if (i.family === "IPv4" && !i.internal) {
        localIP = i.address;
        break;
      }
    }
  }
}

export { obtainLocalIPAddress };