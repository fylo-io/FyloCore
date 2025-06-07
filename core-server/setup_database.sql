-- FyloCore Database Schema Setup
-- Create all tables for the FyloCore application

-- Create knowledge_user table
CREATE TABLE IF NOT EXISTS knowledge_user (
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
CREATE TABLE IF NOT EXISTS knowledge_graph (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  description TEXT,
  creator_id UUID REFERENCES knowledge_user(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('PUBLIC', 'PRIVATE')) DEFAULT 'PRIVATE',
  source_graph_id UUID REFERENCES knowledge_graph(id) ON DELETE SET NULL,
  contributors JSONB DEFAULT '[]'::jsonb,
  node_count INTEGER DEFAULT 0,
  edge_count INTEGER DEFAULT 0
);

-- Create knowledge_document table
CREATE TABLE IF NOT EXISTS knowledge_document (
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
  graph_id UUID REFERENCES knowledge_graph(id) ON DELETE CASCADE,
  user_id UUID REFERENCES knowledge_user(id) ON DELETE CASCADE
);

-- Create knowledge_node table
CREATE TABLE IF NOT EXISTS knowledge_node (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  graph_id UUID REFERENCES knowledge_graph(id) ON DELETE CASCADE,
  type TEXT,
  position JSONB,
  data JSONB,
  measured JSONB,
  selected BOOLEAN DEFAULT FALSE,
  dragging BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE,
  embeddings TEXT,
  citations JSONB,
  locked_by UUID REFERENCES knowledge_user(id) ON DELETE SET NULL
);

-- Create knowledge_edge table
CREATE TABLE IF NOT EXISTS knowledge_edge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  graph_id UUID REFERENCES knowledge_graph(id) ON DELETE CASCADE,
  type TEXT,
  source UUID REFERENCES knowledge_node(id) ON DELETE CASCADE,
  target UUID REFERENCES knowledge_node(id) ON DELETE CASCADE,
  data JSONB
);

-- Create knowledge_comment table
CREATE TABLE IF NOT EXISTS knowledge_comment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT,
  author UUID REFERENCES knowledge_user(id) ON DELETE CASCADE,
  graph_id UUID REFERENCES knowledge_graph(id) ON DELETE CASCADE,
  node_id UUID REFERENCES knowledge_node(id) ON DELETE CASCADE,
  edge_id UUID REFERENCES knowledge_edge(id) ON DELETE CASCADE,
  position JSONB,
  parent_id UUID REFERENCES knowledge_comment(id) ON DELETE CASCADE,
  metadata JSONB
);

-- Create knowledge_note table
CREATE TABLE IF NOT EXISTS knowledge_note (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT,
  author UUID REFERENCES knowledge_user(id) ON DELETE CASCADE,
  node_id UUID REFERENCES knowledge_node(id) ON DELETE CASCADE
);

-- Create knowledge_share table
CREATE TABLE IF NOT EXISTS knowledge_share (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  graph_id UUID REFERENCES knowledge_graph(id) ON DELETE CASCADE,
  user_id UUID REFERENCES knowledge_user(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('read', 'write', 'admin'))
);

-- Create indexes for performance
-- Graph table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_graph_creator_id ON knowledge_graph(creator_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_graph_type ON knowledge_graph(type);

-- Document table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_document_graph_id ON knowledge_document(graph_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_document_user_id ON knowledge_document(user_id);

-- Node table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_node_graph_id ON knowledge_node(graph_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_node_type ON knowledge_node(type);

-- Edge table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_edge_graph_id ON knowledge_edge(graph_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_edge_source ON knowledge_edge(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_edge_target ON knowledge_edge(target);

-- Comment table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_comment_graph_id ON knowledge_comment(graph_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_comment_node_id ON knowledge_comment(node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_comment_edge_id ON knowledge_comment(edge_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_comment_author ON knowledge_comment(author);

-- Note table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_note_author ON knowledge_note(author);
CREATE INDEX IF NOT EXISTS idx_knowledge_note_node_id ON knowledge_note(node_id);

-- Share table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_share_graph_id ON knowledge_share(graph_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_share_user_id ON knowledge_share(user_id);

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_user_email ON knowledge_user(email);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_name ON knowledge_user(name);
