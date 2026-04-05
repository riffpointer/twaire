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

export function getVideoCategoryLabel(category) {
  const match = VIDEO_CATEGORY_OPTIONS.find((option) => option.value === category);
  return match ? match.label : VIDEO_CATEGORY_OPTIONS[0].label;
}

export function isVideoCategory(category) {
  return VIDEO_CATEGORY_OPTIONS.some((option) => option.value === category);
}
