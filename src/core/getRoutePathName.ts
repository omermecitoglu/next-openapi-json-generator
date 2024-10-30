import path from "node:path";

export default function getRoutePathName(filePath: string, rootPath: string) {
  const dirName = path.dirname(filePath);
  return "/" + path.relative(rootPath, dirName)
    .replaceAll("[", "{")
    .replaceAll("]", "}")
    .replaceAll("\\", "/");
}
