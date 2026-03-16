-- JonahandJulian Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  assigned_to text not null default 'both' check (assigned_to in ('jonah', 'julian', 'both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to text not null default 'both' check (assigned_to in ('jonah', 'julian', 'both')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notes table
create table notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  content text not null default '',
  created_by text not null check (created_by in ('jonah', 'julian')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index tasks_project_id_idx on tasks(project_id);
create index tasks_status_idx on tasks(status);
create index tasks_assigned_to_idx on tasks(assigned_to);
create index notes_project_id_idx on notes(project_id);

-- Row Level Security (disabled for simplicity since this is a private 2-person app)
-- If you want to add RLS later, you can enable it per table:
-- alter table projects enable row level security;
-- alter table tasks enable row level security;
-- alter table notes enable row level security;
