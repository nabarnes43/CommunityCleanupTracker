/**
 * Formats a YYYY-MM-DD date string for display, avoiding UTC timezone shift.
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
};
