-- Function for updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name VARCHAR(100) NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password_hash TEXT NOT NULL,
   created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name VARCHAR(200) NOT NULL,
   description TEXT,
   owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
   created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_members (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   role VARCHAR(20) CHECK (role IN ('admin','member')) DEFAULT 'member',
   joined_at TIMESTAMP DEFAULT now(),
   UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
   title VARCHAR(300) NOT NULL,
   description TEXT,
   status VARCHAR(20) CHECK (status IN ('todo','in_progress','done')) DEFAULT 'todo',
   priority VARCHAR(20) CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
   assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
   created_by UUID REFERENCES users(id) ON DELETE SET NULL,
   due_date DATE,
   created_at TIMESTAMP DEFAULT now(),
   updated_at TIMESTAMP DEFAULT now()
);

DROP TRIGGER IF EXISTS update_tasks_modtime ON tasks;
CREATE TRIGGER update_tasks_modtime
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
