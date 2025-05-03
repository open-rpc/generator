export function normalizeMethodName(name: string): string {
  // backward compatibility only change on dot inside in name.
  if (!name.includes('.')) return name;

  const parts = name.split(/[._]/);
  return parts
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}
