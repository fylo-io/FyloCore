import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs-extra';
import * as path from 'path';

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fylocore',
  user: process.env.DB_USER || 'fylocore',
  password: process.env.DB_PASSWORD || 'fylocore_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create PostgreSQL connection pool
export const pool = new Pool(dbConfig);

// Database Tables with knowledge_ prefix and snake_case
export const COMMENT_TABLE = 'knowledge_comment';
export const DOCUMENT_TABLE = 'knowledge_document';
export const EDGE_TABLE = 'knowledge_edge';
export const GRAPH_TABLE = 'knowledge_graph';
export const NODE_TABLE = 'knowledge_node';
export const NOTE_TABLE = 'knowledge_note';
export const SHARE_TABLE = 'knowledge_share';
export const USER_TABLE = 'knowledge_user';

// Local Storage Directories
export const STORAGE_BASE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '..', '..', 'storage');
export const AVATAR_DIR = path.join(STORAGE_BASE_DIR, 'avatars');
export const DOCUMENT_DIR = path.join(STORAGE_BASE_DIR, 'documents');
export const DOWNLOAD_DIR = path.join(STORAGE_BASE_DIR, 'downloads');

/**
 * PostgreSQL client that mimics Supabase API structure
 */
class PostgresClient {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a query builder for a table
   */
  from(table: string) {
    return new PostgresQueryBuilder(this.pool, table);
  }

  /**
   * Execute a raw SQL query (replaces Supabase rpc function)
   */
  async rpc(functionName: string, params: { sql: string }) {
    if (functionName === 'run_sql') {
      try {
        await this.pool.query(params.sql);
        return { data: null, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
    return { data: null, error: new Error('Function not supported') };
  }

  /**
   * Storage API replacement
   */
  get storage() {
    return new LocalStorageAPI();
  }
}

/**
 * Query builder that mimics Supabase query structure
 */
class PostgresQueryBuilder {
  private pool: Pool;
  private table: string;
  private whereConditions: string[] = [];
  private orderByClause = '';
  private limitClause = '';
  private selectFields = '*';

  constructor(pool: Pool, table: string) {
    this.pool = pool;
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push(`${column} = $${this.whereConditions.length + 1}`);
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push(`${column} != $${this.whereConditions.length + 1}`);
    return this;
  }

  in(column: string, values: any[]) {
    const placeholders = values.map((_, i) => `$${this.whereConditions.length + i + 1}`).join(', ');
    this.whereConditions.push(`${column} IN (${placeholders})`);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    const direction = options.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitClause = `LIMIT ${count}`;
    return this;
  }

  private buildSelectQuery(values: any[]) {
    const whereClause = this.whereConditions.length > 0 
      ? `WHERE ${this.whereConditions.join(' AND ')}`
      : '';
    
    return `SELECT ${this.selectFields} FROM ${this.table} ${whereClause} ${this.orderByClause} ${this.limitClause}`.trim();
  }

  private buildInsertQuery(data: any) {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    return `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
  }

  private buildUpdateQuery(data: any, values: any[]) {
    const columns = Object.keys(data);
    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    const whereClause = this.whereConditions.length > 0 
      ? `WHERE ${this.whereConditions.join(' AND ')}`
      : '';
    
    return `UPDATE ${this.table} SET ${setClauses.join(', ')} ${whereClause} RETURNING *`;
  }

  private buildDeleteQuery(values: any[]) {
    const whereClause = this.whereConditions.length > 0 
      ? `WHERE ${this.whereConditions.join(' AND ')}`
      : '';
    
    return `DELETE FROM ${this.table} ${whereClause}`;
  }

  private getWhereValues(originalData?: any): any[] {
    // Extract values for WHERE conditions - this is a simplified version
    // In a real implementation, you'd need to track the values used in eq(), in(), etc.
    return [];
  }

  async insert(data: any | any[]) {
    try {
      if (Array.isArray(data)) {
        // Handle bulk insert
        const results = [];
        for (const item of data) {
          const query = this.buildInsertQuery(item);
          const values = Object.values(item);
          const result = await this.pool.query(query, values);
          results.push(result.rows[0]);
        }
        return { data: results, error: null };
      } else {
        const query = this.buildInsertQuery(data);
        const values = Object.values(data);
        const result = await this.pool.query(query, values);
        return { data: result.rows, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  async update(data: any) {
    try {
      const whereValues = this.getWhereValues();
      const query = this.buildUpdateQuery(data, whereValues);
      const values = [...Object.values(data), ...whereValues];
      const result = await this.pool.query(query, values);
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete() {
    try {
      const whereValues = this.getWhereValues();
      const query = this.buildDeleteQuery(whereValues);
      await this.pool.query(query, whereValues);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Execute the query and return results
  async then(resolve: (result: any) => void, reject?: (error: any) => void) {
    try {
      const whereValues = this.getWhereValues();
      const query = this.buildSelectQuery(whereValues);
      const result = await this.pool.query(query, whereValues);
      
      const response = { data: result.rows, error: null };
      resolve(response);
    } catch (error) {
      const response = { data: null, error };
      if (reject) {
        reject(response);
      } else {
        resolve(response);
      }
    }
  }
}

/**
 * Local file storage API that replaces Supabase Storage
 */
class LocalStorageAPI {
  
  async createBucket(name: string, options: any) {
    try {
      const bucketPath = path.join(STORAGE_BASE_DIR, name);
      await fs.ensureDir(bucketPath);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async listBuckets() {
    try {
      await fs.ensureDir(STORAGE_BASE_DIR);
      const buckets = await fs.readdir(STORAGE_BASE_DIR);
      const bucketData = buckets.map(name => ({ name }));
      return { data: bucketData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  from(bucketName: string) {
    return new LocalStorageBucket(bucketName);
  }
}

/**
 * Local storage bucket operations
 */
class LocalStorageBucket {
  private bucketName: string;
  private bucketPath: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
    this.bucketPath = path.join(STORAGE_BASE_DIR, bucketName);
  }

  async upload(filePath: string, file: Buffer | string, options?: any) {
    try {
      await fs.ensureDir(this.bucketPath);
      const fullPath = path.join(this.bucketPath, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, file);
      
      return { 
        data: { 
          path: filePath,
          fullPath 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  async download(filePath: string) {
    try {
      const fullPath = path.join(this.bucketPath, filePath);
      const file = await fs.readFile(fullPath);
      return { data: file, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async remove(filePaths: string[]) {
    try {
      for (const filePath of filePaths) {
        const fullPath = path.join(this.bucketPath, filePath);
        await fs.remove(fullPath);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async list(folderPath: string = '') {
    try {
      const fullPath = path.join(this.bucketPath, folderPath);
      const files = await fs.readdir(fullPath);
      const fileData = files.map(name => ({ name }));
      return { data: fileData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Create and export the client instance
export const postgresClient = new PostgresClient(pool);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

/**
 * Initialize database tables and storage directories
 */
export const initializeDatabase = async(): Promise<void> => {
  console.log('🚀 Initializing PostgreSQL database and storage...');
  
  try {
    // Create storage directories
    await fs.ensureDir(AVATAR_DIR);
    await fs.ensureDir(DOCUMENT_DIR);
    await fs.ensureDir(DOWNLOAD_DIR);
    console.log('📁 Storage directories created successfully');

    const sql = `
      -- Drop existing tables to fix schema issues
      DROP TABLE IF EXISTS ${COMMENT_TABLE} CASCADE;
      DROP TABLE IF EXISTS ${NOTE_TABLE} CASCADE;
      DROP TABLE IF EXISTS ${EDGE_TABLE} CASCADE;
      
      -- Create knowledge_user table
      CREATE TABLE IF NOT EXISTS ${USER_TABLE} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        type TEXT CHECK (type IN ('ADMIN', 'USER', 'GOOGLE')),
        verified BOOLEAN DEFAULT false,
        profile_color TEXT,
        avatar_url TEXT
      );

      -- Create knowledge_graph table
      CREATE TABLE IF NOT EXISTS ${GRAPH_TABLE} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        type TEXT,
        position JSONB,
        data JSONB,
        measured JSONB,
        selected BOOLEAN DEFAULT FALSE,
        dragging BOOLEAN DEFAULT FALSE,
        hidden BOOLEAN DEFAULT FALSE,
        embeddings TEXT,
        citations JSONB,
        locked_by UUID REFERENCES ${USER_TABLE}(id) ON DELETE SET NULL
      );

      -- Create knowledge_edge table
      CREATE TABLE ${EDGE_TABLE} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        type TEXT,
        source UUID REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        target UUID REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        data JSONB
      );

      -- Create knowledge_comment table
      CREATE TABLE ${COMMENT_TABLE} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID NOT NULL REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        node_id UUID REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        edge_id UUID REFERENCES ${EDGE_TABLE}(id) ON DELETE CASCADE,
        author TEXT NOT NULL,
        color TEXT NOT NULL,
        text TEXT NOT NULL
      );

      -- Create knowledge_note table
      CREATE TABLE ${NOTE_TABLE} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        author TEXT NOT NULL,
        node_id UUID NOT NULL REFERENCES ${NODE_TABLE}(id) ON DELETE CASCADE,
        text TEXT NOT NULL
      );

      -- Create knowledge_share table
      CREATE TABLE IF NOT EXISTS ${SHARE_TABLE} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        graph_id UUID REFERENCES ${GRAPH_TABLE}(id) ON DELETE CASCADE,
        user_id UUID REFERENCES ${USER_TABLE}(id) ON DELETE CASCADE,
        permission_level TEXT CHECK (permission_level IN ('read', 'write', 'admin'))
      );

      -- Create indexes for performance
      -- Graph table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_graph_creator_id ON ${GRAPH_TABLE}(creator_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_graph_type ON ${GRAPH_TABLE}(type);
      
      -- Document table indexes
      CREATE INDEX IF NOT EXISTS idx_knowledge_document_graph_id ON ${DOCUMENT_TABLE}(graph_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_document_user_id ON ${DOCUMENT_TABLE}(user_id);
      
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

    const { error } = await postgresClient.rpc('run_sql', { sql });
    
    if (error) {
      console.error('❌ Error creating database tables:', error);
      throw error;
    }

    console.log('✅ Database tables and indexes created successfully');
    console.log('✅ PostgreSQL database initialization complete');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};
