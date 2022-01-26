export const getEasterForYear = (year) => {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  const result = { year, month, day };
  return result;
};

export const isEaster = (date) => {
  const year = new Date(date).getFullYear();
  const easter = getEasterForYear(year);
  const easterDate = `${easter.year}-${String(easter.month).padStart(2, '0')}-${String(easter.day).padStart(2, '0')}`;
  const result = date.substr(0, 10) === easterDate;
  return result;
};
