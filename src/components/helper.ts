// This function is used in the template files to normalize method names for JavaScript/TypeScript.
// It removes dots and applies camelCase formatting.
export function normalizeMethodNameJavascript(name: string): string {
  // backward compatibility only change on dot inside in name.
  if (!name.includes('.')) return name;

  const parts = name.split(/[._]/);
  return parts
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

// This function is used in the template files to normalize method names for Rust.
// It replace dots with underscores and applies snake_case formatting.
export function normalizeMethodNameRust(name: string): string {
  // backward compatibility only change on dot inside in name.
  if (!name.includes('.')) return name;

  name = name.replace(/\./g, '_');
  name = name.toLowerCase();
  name = name.replace(/__+/g, '_'); // replace multiple underscores with a single underscore
  while (name.startsWith('_')) {
    name = name.slice(1); // remove leading underscore
  }
  while (name.endsWith('_')) {
    name = name.slice(0, -1); // remove trailing underscore
  }

  return name;
}

// Extract parameter names from a parameter string into an array
export function extractParameterNames(paramStr: string): string[] {
  if (!paramStr || paramStr.trim() === '') {
    return [];
  }

  return paramStr
    .split(',')
    .map((param) => param.trim())
    .map((param) => param.split(':')[0].trim())
    .filter((name) => name.length > 0);
}
