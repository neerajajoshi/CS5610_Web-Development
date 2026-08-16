/**
 * Formats a Date object into a local date string (YYYY-MM-DD)
 * using the server's local timezone.
 * @param {Date} dateObj
 * @returns {string} YYYY-MM-DD
 */
function getLocalDateString(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj)) {
    return "";
  }
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object into a local year-month string (YYYY-MM)
 * using the server's local timezone.
 * @param {Date} dateObj
 * @returns {string} YYYY-MM
 */
function getLocalYearMonthString(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj)) {
    return "";
  }
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Generates all billing months (year, month index, monthName, dueDate)
 * between a start date and an end date in local timezone.
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Array}
 */
function getMonthsRange(startDate, endDate) {
  const months = [];
  if (!startDate || !endDate) return months;
  
  const start = new Date(startDate);
  start.setDate(1);
  const end = new Date(endDate);
  end.setDate(1);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  while (start <= end) {
    const y = start.getFullYear();
    const m = start.getMonth(); // 0-indexed
    const monthName = `${monthNames[m]} ${y}`;
    const dueDate = `${y}-${String(m + 1).padStart(2, '0')}-05`;
    months.push({ monthName, dueDate, year: y, month: m });
    start.setMonth(start.getMonth() + 1);
  }
  return months;
}

/**
 * Calculates the prorated amount (max 100) based on remaining days in the joining month.
 * If target month/year is subsequent to the enrollment month/year, returns 100.
 * @param {Date} enrollmentDate 
 * @param {number} year 
 * @param {number} month (0-indexed)
 * @returns {number}
 */
function getProratedAmount(enrollmentDate, year, month) {
  const enrollYear = enrollmentDate.getFullYear();
  const enrollMonth = enrollmentDate.getMonth();

  if (enrollYear === year && enrollMonth === month) {
    const totalDays = new Date(year, month + 1, 0).getDate(); // last day of month
    const joinDay = enrollmentDate.getDate();
    const remainingDays = totalDays - joinDay + 1;
    return Math.round((remainingDays / totalDays) * 100);
  }
  
  return 100;
}

module.exports = {
  getLocalDateString,
  getLocalYearMonthString,
  getMonthsRange,
  getProratedAmount,
};
