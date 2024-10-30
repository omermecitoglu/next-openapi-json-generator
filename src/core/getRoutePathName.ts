export default function getRoutePathName(filePath: string, rootPath: string) {
  return filePath
    .replace(rootPath, "")
    .replaceAll("[", "{")
    .replaceAll("]", "}")
    .replaceAll("\\", "/")
    .replace("/route.ts", "");
}
