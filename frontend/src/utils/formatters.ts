// Utility formatters for date, percentage, and text

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return timeString;
  }
};

export const formatAccuracy = (val: number): string => {
  return `${Math.round(val)}%`;
};

export const formatDurationMs = (ms: number): string => {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
};
