import { FileSystemResource } from "./contents";

export function parsePath(path: string): FileSystemResource {
  const parts = path.split('/', 1)
  return {
    bucket: parts.length >= 1 ? parts[0] : '',
    path: parts.length > 1 ? parts[1] : '/'
  }
}