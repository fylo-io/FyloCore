import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

export const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Database Tables with knowledge_ prefix and snake_case
export const COMMENT_TABLE = 'knowledge_comment';
export const DOCUMENT_TABLE = 'knowledge_document';
export const EDGE_TABLE = 'knowledge_edge';
export const GRAPH_TABLE = 'knowledge_graph';
export const NODE_TABLE = 'knowledge_node';
export const NOTE_TABLE = 'knowledge_note';
export const SHARE_TABLE = 'knowledge_share';
export const USER_TABLE = 'knowledge_user';

// Storage Buckets
export const AVATAR_BUCKET = 'knowledge_avatars';
export const DOCUMENT_BUCKET = 'knowledge_documents';
export const DOWNLOAD_BUCKET = 'knowledge_downloads';

/**
 * Initialize database tables and indexes
 */
export const initializeDatabase = async(): Promise<void> => {
  console.log('🚀 Initializing database tables...');
  
  try {
    const sql = `
      -- Create knowledge_user table
      CREATE TABLE IF NOT EXISTS ${USER_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        type TEXT CHECK (type IN ('free', 'premium')),
        verified BOOLEAN DEFAULT false,
        profile_color TEXT,
        avatar_url TEXT
      );

      -- Create knowledge_graph table
      CREATE TABLE IF NOT EXISTS ${GRAPH_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        title TEXT,
        description TEXT,
        creator_id UUID REFERENCES ${USER_TABLE}(id) ON DELETE CASCADE,
        type TEXT CHECK (type IN ('PUBLIC', 'PRIVATE')) DEFAULT 'PRIVATE',
        source_graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE SET NULL,
        contributors JSONB DEFAULT '[]'::jsonb,
        node_count INTEGER DEFAULT 0,
        edge_count INTEGER DEFAULT 0
      );

      -- Create knowledge_document table
      CREATE TABLE IF NOT EXISTS ${DOCUMENT_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        title TEXT,
        content TEXT,
        source_type TEXT,
        doi TEXT,
        publication_year INTEGER,
        publication_date DATE,
        type TEXT,
        is_oa BOOLEAN,
        oa_status TEXT,
        authors TEXT[],
        pdf_url TEXT,
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        user_id UUID REFERENCES ${USER_TABLE}(id) ON DELETE CASCADE
      );

      -- Create knowledge_node table
      CREATE TABLE IF NOT EXISTS ${NODE_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        type TEXT,
        position JSONB,
        data JSONB,
        measured JSONB,
        selected BOOLEAN DEFAULT FALSE,
        dragging BOOLEAN DEFAULT FALSE,
        hidden BOOLEAN DEFAULT FALSE,
        embeddings VECTOR,
        citations JSONB,
        locked_by UUID REFERENCES ${USER_TABLE}(id) ON DELETE SET NULL
      );

      -- Create knowledge_edge table
      CREATE TABLE IF NOT EXISTS ${EDGE_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        type TEXT,
        source UUID REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        target UUID REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        data JSONB
      );

      -- Drop existing comment and note tables to fix schema issues
      DROP TABLE IF EXISTS ${COMMENT_TABLE} CASCADE;
      DROP TABLE IF EXISTS ${NOTE_TABLE} CASCADE;

      -- Create knowledge_comment table
      CREATE TABLE ${COMMENT_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        node_id UUID REFERENCES ${NODE_TABLE}(id) ON DELETE SET NULL,
        edge_id UUID REFERENCES ${EDGE_TABLE}(id) ON DELETE SET NULL,
        author TEXT NOT NULL,
        color TEXT,
        text TEXT NOT NULL,
        CHECK ((node_id IS NOT NULL AND edge_id IS NULL) OR (node_id IS NULL AND edge_id IS NOT NULL))
      );

      -- Create knowledge_note table
      CREATE TABLE ${NOTE_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        author TEXT NOT NULL,
        node_id UUID REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        text TEXT NOT NULL
      );

      -- Create knowledge_share table
      CREATE TABLE IF NOT EXISTS ${SHARE_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        user_id UUID REFERENCES ${USER_TABLE}(id) ON DELETE CASCADE,
        permission TEXT CHECK (permission IN ('read', 'write', 'admin')) DEFAULT 'read',
        UNIQUE(graph_id, user_id)
      );

      -- Create indexes for better performance
      
      -- Graph table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_graph_creator_id ON ${GRAPH_TABLE}(creator_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_graph_type ON ${GRAPH_TABLE}(type);
      
      -- Node table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_node_graph_id ON ${NODE_TABLE}(graph_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_node_type ON ${NODE_TABLE}(type);
      
      -- Edge table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_edge_graph_id ON ${EDGE_TABLE}(graph_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_edge_source ON ${EDGE_TABLE}(source);
      CREATE INDEX IF NOT EXISTS idx_knowledge_edge_target ON ${EDGE_TABLE}(target);
      
      -- Comment table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_comment_graph_id ON ${COMMENT_TABLE}(graph_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_comment_node_id ON ${COMMENT_TABLE}(node_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_comment_edge_id ON ${COMMENT_TABLE}(edge_id);
      
      -- Note table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_note_node_id ON ${NOTE_TABLE}(node_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_note_author ON ${NOTE_TABLE}(author);
      
      -- Share table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_share_graph_id ON ${SHARE_TABLE}(graph_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_share_user_id ON ${SHARE_TABLE}(user_id);
      
      -- User table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_user_email ON ${USER_TABLE}(email);
      CREATE INDEX IF NOT EXISTS idx_knowledge_user_type ON ${USER_TABLE}(type);
      
      -- Document table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_document_doi ON ${DOCUMENT_TABLE}(doi);
      CREATE INDEX IF NOT EXISTS idx_knowledge_document_type ON ${DOCUMENT_TABLE}(type);
      CREATE INDEX IF NOT EXISTS idx_knowledge_document_publication_year ON ${DOCUMENT_TABLE}(publication_year);
    `;

    const { error } = await supabaseClient.rpc('run_sql', { sql });
    
    if (error) {
      console.error('❌ Error creating database tables:', error);
      throw error;
    }

    console.log('✅ Database tables and indexes created successfully');

    // Create storage buckets
    console.log('📁 Creating storage buckets...');
    
    await createStorageBuckets();
    
    console.log('✅ Storage buckets created successfully');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
}

/**
 * Create storage buckets for the application
 */
async function createStorageBuckets(): Promise<void> {
  const buckets = [
    {
      name: AVATAR_BUCKET,
      options: {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      }
    },
    {
      name: DOCUMENT_BUCKET,
      options: {
        public: false,
        allowedMimeTypes: ['application/pdf', 'text/plain', 'application/json'],
        fileSizeLimit: 52428800, // 50MB
      }
    },
    {
      name: DOWNLOAD_BUCKET,
      options: {
        public: false,
        allowedMimeTypes: ['application/json', 'text/csv', 'application/zip'],
        fileSizeLimit: 104857600, // 100MB
      }
    }
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabaseClient.storage.listBuckets();
      
      if (listError) {
        console.warn(`⚠️ Could not list buckets: ${listError.message}`);
        continue;
      }

      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (!bucketExists) {
        const { error: createError } = await supabaseClient.storage.createBucket(
          bucket.name,
          bucket.options
        );
        
        if (createError) {
          console.warn(`⚠️ Could not create bucket ${bucket.name}: ${createError.message}`);
        } else {
          console.log(`✅ Created bucket: ${bucket.name}`);
        }
      } else {
        console.log(`📁 Bucket already exists: ${bucket.name}`);
      }
    } catch (error) {
      console.warn(`⚠️ Error handling bucket ${bucket.name}:`, error);
    }
  }
}
