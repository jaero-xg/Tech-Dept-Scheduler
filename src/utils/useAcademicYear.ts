export function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); 
 
  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;
 
  return `A.Y. ${startYear}–${endYear}`;
}