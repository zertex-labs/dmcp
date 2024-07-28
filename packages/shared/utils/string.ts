export const capitalize = (str: string) =>
  !!str[0] ? str[0].toUpperCase() + str.slice(1) : str;

export const uppercase = (str: string) => str.toUpperCase();

export const lowercase = (str: string) => str.toLowerCase();

export const trimmed = (str: string) => str.trim();

export function removeFromString(str: string, substr: string) {
  return str.slice(0, str.indexOf(substr));
}
