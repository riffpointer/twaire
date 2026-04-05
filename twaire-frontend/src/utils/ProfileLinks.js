export function ensureAbsoluteUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidLinkUrl(value) {
  const absolute = ensureAbsoluteUrl(value);
  if (!absolute) return false;

  try {
    const parsed = new URL(absolute);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function detectLinkPlatform(url) {
  const absolute = ensureAbsoluteUrl(url);
  if (!absolute) return "website";

  try {
    const host = new URL(absolute).hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("github.com")) return "github";
    if (host.includes("x.com") || host.includes("twitter.com")) return "x";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("facebook.com")) return "facebook";
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("twitch.tv")) return "twitch";
    if (host.includes("discord.gg") || host.includes("discord.com")) return "discord";
    return "website";
  } catch {
    return "website";
  }
}
