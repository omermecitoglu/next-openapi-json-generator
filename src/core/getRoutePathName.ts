import path from "node:path";

export default function getRoutePathName(filePath: string, rootPath: string): string {
  const dirName = path.dirname(filePath);
  const relativePath = path.relative(rootPath, dirName)
    .replaceAll("[", "{")
    .replaceAll("]", "}")
    .replaceAll("\\", "/");

  const segments = relativePath
    .split("/")
    .filter(segment => !(/^\([^)]*\)$/).test(segment));

  return `/${segments.join("/")}`;
}
