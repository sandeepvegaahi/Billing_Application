// utils/academicYear.js
const normalizeAcademicYear = (value) => {
  if (!value) return null;

  const str = String(value).trim();
  const match = str.match(/(20\d{2})\s*[-–\/]\s*(20\d{2})/);

  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2]);

  if (end !== start + 1) return null;

  return `${start}-${end}`;
};

module.exports = { normalizeAcademicYear };
