export const TIMESTAMP_TOKEN_PATTERN = /\b(\d{1,2}):([0-5]\d)\b/g;

export function parseTimestampToSeconds(value) {
  const match = String(value || "").match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return null;
  const minutes = Number.parseInt(match[1], 10);
  const seconds = Number.parseInt(match[2], 10);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
  return minutes * 60 + seconds;
}

export function seekVideoElementToTimestamp(videoElementId, seconds) {
  const videoElement = document.getElementById(videoElementId);
  if (!videoElement) return false;
  if (!Number.isFinite(seconds) || seconds < 0) return false;

  const safeDuration = Number.isFinite(videoElement.duration) ? videoElement.duration : null;
  const capped = safeDuration ? Math.min(seconds, Math.max(safeDuration - 0.1, 0)) : seconds;
  videoElement.currentTime = Math.max(0, capped);
  return true;
}
