import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

export const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Database Tables
export const COMMENT_TABLE = 'Comment';
export const DOCUMENT_TABLE = 'Document';
export const EDGE_TABLE = 'Edge';
export const GRAPH_TABLE = 'Graph';
export const NODE_TABLE = 'Node';
export const NOTE_TABLE = 'Note';
export const SHARE_TABLE = 'Share';
export const USER_TABLE = 'User';

// Storage Buckets
export const AVATAR_BUCKET = 'AVATARS';
export const DOCUMENT_BUCKET = 'DOCUMENTS';
export const DOWNLOAD_BUCKET = 'downloads';
