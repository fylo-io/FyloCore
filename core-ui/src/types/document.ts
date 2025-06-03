import { DocumentStatus, SourceType } from "@/const";

export interface SourceDocument {
  type: SourceType;
  title: string;
  status: DocumentStatus;
  content: string;
  authors?: string[];
  publicationYear?: number;
  references?: Reference[];
  chunks?: TextChunk[];
}

export interface DocumentContent {
  id: string;
  created_at: Date;
  title: string;
  content: string;
  source_type?: string;
  doi?: string;
  publication_year?: number;
  publication_date?: Date;
  type?: string;
  is_oa?: boolean;
  oa_status?: string;
  authors?: string[];
  pdf_url?: string;
}

export interface Reference {
  ref_id: string;
  title: string;
  authors: string[];
  year: string;
  doi?: string | null;
  url?: string | null;
}

export interface TextChunk {
  id: string;
  content: string;
  section_title: string;
  section_number: string;
  position: number;
}
