export interface SavedPath {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  questionIds: number[];
  subfolders: SavedPath[];
  parentId?: string;
  tags: string[];
  qbankId: string;
}

export interface SavedPathExport {
  savedPath: SavedPath;
  questions: any[];
  media: string[];
  audio: string[];
  scores: any[];
  hierarchy: SavedPath[];
}