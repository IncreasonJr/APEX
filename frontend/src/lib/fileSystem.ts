const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
}

export async function fetchFileTree(path: string): Promise<FileNode[]> {
  const url = `${API_BASE}/file/tree?path=${encodeURIComponent(path)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to fetch file tree for path: ${path}`);
  }
  return response.json();
}

export async function fetchFileContent(path: string): Promise<{ content: string; path: string }> {
  const url = `${API_BASE}/file/read`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to read file: ${path}`);
  }
  return response.json();
}
