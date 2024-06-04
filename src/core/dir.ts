import { constants } from "fs";
import fs from "fs/promises";
import path from "node:path";

export async function directoryExists(dirPath: string) {
  try {
    await fs.access(dirPath, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export async function getDirectoryItems(dirPath: string, targetFileName: string) {
  const collection: string[] = [];
  const files = await fs.readdir(dirPath);
  for (const itemName of files) {
    const itemPath = path.resolve(dirPath, itemName);
    const stats = await fs.stat(itemPath);
    if (stats.isDirectory()) {
      const children = await getDirectoryItems(itemPath, targetFileName);
      collection.push(...children);
    } else if (itemName === targetFileName) {
      collection.push(itemPath);
    }
  }
  return collection;
}
