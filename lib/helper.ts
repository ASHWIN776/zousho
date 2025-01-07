export const formatTitle = (title: string) => {
  return title.length > 40 ? title.substring(0, 40) + "..." : title;
}