export function apiMessage(method, path, message) {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA").replace(/-/g, "/"); // YYYY/MM/DD
  const time = now.toLocaleTimeString("en-US", { hour12: true });   // 12-hour format

  console.log(`[${date} @ ${time}] [${method.toUpperCase()} ${path}] ${message}`);
}

export function apiError(method, path, message) {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA").replace(/-/g, "/"); // YYYY/MM/DD
  const time = now.toLocaleTimeString("en-US", { hour12: true });   // 12-hour format

  console.error(`Error: [${date} @ ${time}] [${method.toUpperCase()} ${path}] ${message}`);
}
