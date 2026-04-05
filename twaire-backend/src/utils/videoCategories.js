export const VIDEO_CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "music", label: "Music" },
  { value: "gaming", label: "Gaming" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
  { value: "news", label: "News" },
  { value: "travel", label: "Travel" },
  { value: "comedy", label: "Comedy" },
];

export const DEFAULT_VIDEO_CATEGORY = "general";

const VIDEO_CATEGORY_VALUES = new Set(VIDEO_CATEGORY_OPTIONS.map((option) => option.value));

export function sanitizeVideoCategory(category) {
  if (typeof category !== "string") return DEFAULT_VIDEO_CATEGORY;
  const normalized = category.trim().toLowerCase();
  return VIDEO_CATEGORY_VALUES.has(normalized) ? normalized : DEFAULT_VIDEO_CATEGORY;
}

export function isVideoCategory(category) {
  if (typeof category !== "string") return false;
  return VIDEO_CATEGORY_VALUES.has(category.trim().toLowerCase());
}
