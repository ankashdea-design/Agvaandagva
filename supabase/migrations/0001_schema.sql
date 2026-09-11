-- ============================================================
-- KinderCare MN — core schema
-- ============================================================

create extension if not exists "uuid-ossp";

create type user_role as enum ('admin', 'teacher', 'parent');
create type meal_status as enum ('poor', 'medium', 'good');
create type mood_status as enum ('sad', 'neutral', 'happy');
create type attendance_status as enum ('present', 'absent', 'sick', 'excused');

-- ------------------------------------------------------------
-- profiles: 1:1 with auth.users, carries role + display name
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- kindergartens
-- ------------------------------------------------------------
create table kindergartens (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  admin_id uuid references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- classes
-- ------------------------------------------------------------
create table classes (
  id uuid primary key default uuid_generate_v4(),
  kindergarten_id uuid not null references kindergartens(id) on delete cascade,
  name text not null,
  age_group text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- teachers (profile extension)
-- ------------------------------------------------------------
create table teachers (
  id uuid primary key references profiles(id) on delete cascade,
  kindergarten_id uuid not null references kindergartens(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table teacher_classes (
  teacher_id uuid not null references teachers(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  primary key (teacher_id, class_id)
);

-- ------------------------------------------------------------
-- parents (profile extension)
-- ------------------------------------------------------------
create table parents (
  id uuid primary key references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- children
-- ------------------------------------------------------------
create table children (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes(id) on delete cascade,
  full_name text not null,
  birth_date date,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table parent_children (
  parent_id uuid not null references parents(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  relationship text default 'parent',
  primary key (parent_id, child_id)
);

-- ------------------------------------------------------------
-- attendance — one row per child per day
-- ------------------------------------------------------------
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references children(id) on delete cascade,
  report_date date not null default current_date,
  status attendance_status not null default 'present',
  marked_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, report_date)
);

-- ------------------------------------------------------------
-- daily_reports — one row per child per day, the "status" record
-- ------------------------------------------------------------
create table daily_reports (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references children(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  report_date date not null default current_date,
  mood mood_status,
  meal meal_status,
  nap_start time,
  nap_end time,
  hygiene_hands boolean not null default false,
  hygiene_toilet boolean not null default false,
  hygiene_teeth boolean not null default false,
  highlight_note text,
  extra_note text,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id),
  unique (child_id, report_date)
);

-- ------------------------------------------------------------
-- daily_activities — the checklist items (drawing, music, etc.)
-- ------------------------------------------------------------
create table daily_activities (
  id uuid primary key default uuid_generate_v4(),
  daily_report_id uuid not null references daily_reports(id) on delete cascade,
  drawing boolean not null default false,
  music boolean not null default false,
  story boolean not null default false,
  play boolean not null default false,
  physical boolean not null default false,
  cognitive boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (daily_report_id)
);

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- indexes
-- ------------------------------------------------------------
create index idx_classes_kindergarten on classes(kindergarten_id);
create index idx_children_class on children(class_id);
create index idx_children_active on children(class_id) where is_active;
create index idx_parent_children_parent on parent_children(parent_id);
create index idx_parent_children_child on parent_children(child_id);
create index idx_teacher_classes_teacher on teacher_classes(teacher_id);
create index idx_daily_reports_child_date on daily_reports(child_id, report_date desc);
create index idx_daily_reports_class_date on daily_reports(class_id, report_date desc);
create index idx_attendance_child_date on attendance(child_id, report_date desc);
create index idx_notifications_recipient on notifications(recipient_id, is_read);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger trg_kindergartens_updated before update on kindergartens
  for each row execute function set_updated_at();
create trigger trg_classes_updated before update on classes
  for each row execute function set_updated_at();
create trigger trg_children_updated before update on children
  for each row execute function set_updated_at();
create trigger trg_attendance_updated before update on attendance
  for each row execute function set_updated_at();
create trigger trg_daily_reports_updated before update on daily_reports
  for each row execute function set_updated_at();
