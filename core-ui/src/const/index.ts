export enum DocumentStatus {
  BRONZE = "bronze",
  CLOSED = "closed",
  GOLD = "gold",
  GREEN = "green",
  HYBRID = "hybrid",
  LABEL = "label"
}

export enum SignInStatus {
  NOT_SIGNED = "NOT_SIGNED",
  UNKNOWN = "UNKNOWN"
}

export enum SourceType {
  DOI = "DOI",
  PDF = "PDF",
  TEXT = "Text",
  ZOTERO = "Zotero",
  UNKNOWN = ""
}

export enum ToolType {
  DEFAULT = "",
  IMPORT = "Import",
  NOTE = "Note",
  COMMENT = "Comment"
}

export enum UserType {
  ADMIN = "ADMIN",
  USER = "USER",
  GOOGLE = "GOOGLE"
}

export enum WindowSize {
  DESKTOP = "DESKTOP",
  MOBILE = "MOBILE",
  UNKNOWN = "UNKNOWN"
}

export const MAX_FILE_SIZE_MB = 40;
