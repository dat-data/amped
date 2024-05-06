export function convertToSeconds(time: string): number {
  const [days, hours, minutes, seconds] = time.split(":").map(Number);
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}
