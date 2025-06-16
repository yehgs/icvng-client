export const valideURLConvert = (name) => {
  const url = name
    ?.toString()
    .replaceAll(' ', '-')
    .replaceAll(',', '-')
    .replaceAll('&', '-')
    .replaceAll('/', '-') // Fix for forward slashes
    .replaceAll('\\', '-') // Fix for backslashes
    .replaceAll('%', '-') // Fix for percentage signs
    .replaceAll('+', '-') // Fix for plus signs
    .replaceAll('(', '-') // Fix for parentheses
    .replaceAll(')', '-') // Fix for parentheses
    .replaceAll('--', '-') // Replace double hyphens with single
    .toLowerCase();

  return url;
};
