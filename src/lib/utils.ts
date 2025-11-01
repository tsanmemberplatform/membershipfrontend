/**
 * Common utility functions for the application
 */

/**
 * Formats a date to a readable string
 * @param date - Date object or string to format
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param str - String to truncate
 * @param num - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export const truncate = (str: string, num: number): string => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};

/**
 * Checks if a value is empty
 * @param value - Value to check
 * @returns Boolean indicating if the value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Conditionally joins class names together
 * @param classes - Array of class names or objects with boolean values
 * @returns Combined class string
 */
export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export default {
  formatDate,
  truncate,
  isEmpty,
  cn,
};
