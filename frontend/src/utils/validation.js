const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isBlank = value => String(value ?? '').trim().length === 0;

export const isValidEmail = value => EMAIL_REGEX.test(String(value ?? '').trim());

export const isValidPassword = value => {
  const password = String(value ?? '');
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

export const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const isValidISODate = value => {
  if (isBlank(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

export const compareISODate = (left, right) => {
  if (!isValidISODate(left) || !isValidISODate(right)) return NaN;
  const leftDate = new Date(`${left}T00:00:00`).getTime();
  const rightDate = new Date(`${right}T00:00:00`).getTime();
  if (leftDate === rightDate) return 0;
  return leftDate > rightDate ? 1 : -1;
};

export const todayISO = () => new Date().toISOString().split('T')[0];