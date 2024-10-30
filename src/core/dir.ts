import { constants } from "fs";
import fs from "fs/promises";
import path from "node:path";
import { Minimatch } from "minimatch";

export async function directoryExists(dirPath: string) {
  try {
    await fs.access(dirPath, constants.F_OK);
    return true;
  } catch {
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

export function filterDirectoryItems(rootPath: string, items: string[], include: string[], exclude: string[]) {
  const includedPatterns = include.map(pattern => new Minimatch(pattern));
  const excludedPatterns = exclude.map(pattern => new Minimatch(pattern));

  return items.filter(item => {
    const relativePath = path.relative(rootPath, item);
    const isIncluded = includedPatterns.some(pattern => pattern.match(relativePath));
    const isExcluded = excludedPatterns.some(pattern => pattern.match(relativePath));
    return (isIncluded || !include.length) && !isExcluded;
  });
}
