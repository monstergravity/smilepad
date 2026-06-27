export const emailPatternSource =
  "[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,63}";

const emailPattern = new RegExp(`^${emailPatternSource}$`);

export function isValidEmail(value: string) {
  const email = value.trim();

  return email.length <= 254 && !email.includes('..') && emailPattern.test(email);
}
