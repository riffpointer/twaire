export function apiMessage(method, path, message) {
  const now = new Date().toISOString();
  console.log(`(${now}) [${method.toUpperCase()} ${path}] ${message}`);
}

export function apiError(method, path, message) {
  const now = new Date().toISOString();
  console.error(`Error: (${now}) [${method.toUpperCase()} ${path}] ${message}`);
}