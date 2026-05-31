export function success(data, message) {
  return { success: true, data, message };
}

export function error(message) {
  return { success: false, error: message };
}
