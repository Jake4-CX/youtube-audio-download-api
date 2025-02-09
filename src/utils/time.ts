
export function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) throw new Error("Invalid ISO 8601 duration format");

  const hours = match[1] ? parseInt(match[1]) * 3600 : 0;
  const minutes = match[2] ? parseInt(match[2]) * 60 : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return hours + minutes + seconds;
}