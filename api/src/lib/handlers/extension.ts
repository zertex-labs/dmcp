export type Extension = `.${string}`;

export function removeExtensions(og: string, extensions: Extension[]) {
  const found = extensions.find((extension) => og.endsWith(extension));
  if (found) return removeExtension(og, found);
  return og; 
}

function removeExtension(og: string, extension: Extension) {
  return og.substring(0, og.length - extension.length);
}
