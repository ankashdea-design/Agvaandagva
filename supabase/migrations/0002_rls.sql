-- ============================================================
-- Row Level Security — enforced at the database level.
-- A parent cannot read another child's data even by guessing an
-- ID in the URL, because Postgres itself checks parent_children.
-- ============================================================

alter table profiles enable row level security;
alter table kindergartens enable row level security;
alter table classes enable row level security;
alter table teachers enable row level security;
alter table teacher_classes enable row level security;
alter table parents enable row level security;
alter table children enable row level security;
alter table parent_children enable row level security;
alter table attendance enable row level security;
alter table daily_reports enable row level security;
alter table daily_activities enable row level security;
alter table notifications enable row level security;

-- ------------------------------------------------------------
-- helper functions (security definer so they can read profiles
-- without recursively triggering RLS on profiles itself)
-- ------------------------------------------------------------
create or replace function auth_role()
returns user_role
language sql stable security definer
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_kindergarten_id()
returns uuid
language sql stable security definer
as $$
  select k.id from kindergartens k where k.admin_id = auth.uid()
  union
  select t.kindergarten_id from teachers t where t.id = auth.uid();
$$;

create or replace function is_teacher_of_class(target_class_id uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from teacher_classes tc
    where tc.teacher_id = auth.uid() and tc.class_id = target_class_id
  );
$$;

create or replace function is_parent_of_child(target_child_id uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from parent_children pc
    where pc.parent_id = auth.uid() and pc.child_id = target_child_id
  );
$$;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create policy "read own profile" on profiles for select
  using (id = auth.uid());
create policy "admin reads kindergarten profiles" on profiles for select
  using (auth_role() = 'admin');
create policy "update own profile" on profiles for update
  using (id = auth.uid());

-- ------------------------------------------------------------
-- kindergartens
-- ------------------------------------------------------------
create policy "admin manages own kindergarten" on kindergartens for all
  using (admin_id = auth.uid())
  with check (admin_id = auth.uid());
create policy "staff read own kindergarten" on kindergartens for select
  using (id = auth_kindergarten_id());

-- ------------------------------------------------------------
-- classes
-- ------------------------------------------------------------
create policy "admin manages classes" on classes for all
  using (kindergarten_id = auth_kindergarten_id() and auth_role() = 'admin')
  with check (kindergarten_id = auth_kindergarten_id() and auth_role() = 'admin');
create policy "teacher reads own classes" on classes for select
  using (is_teacher_of_class(id));
create policy "parent reads child class" on classes for select
  using (
    exists (
      select 1 from children c
      where c.class_id = classes.id and is_parent_of_child(c.id)
    )
  );

-- ------------------------------------------------------------
-- teachers / teacher_classes
-- ------------------------------------------------------------
create policy "admin manages teachers" on teachers for all
  using (kindergarten_id = auth_kindergarten_id() and auth_role() = 'admin')
  with check (kindergarten_id = auth_kindergarten_id() and auth_role() = 'admin');
create policy "teacher reads self" on teachers for select
  using (id = auth.uid());

create policy "admin manages teacher_classes" on teacher_classes for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');
create policy "teacher reads own assignments" on teacher_classes for select
  using (teacher_id = auth.uid());

-- ------------------------------------------------------------
-- parents / parent_children
-- ------------------------------------------------------------
create policy "admin manages parents" on parents for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');
create policy "parent reads self" on parents for select
  using (id = auth.uid());

create policy "admin manages parent_children" on parent_children for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');
create policy "parent reads own links" on parent_children for select
  using (parent_id = auth.uid());
create policy "teacher reads links for own class" on parent_children for select
  using (
    exists (
      select 1 from children c
      where c.id = parent_children.child_id and is_teacher_of_class(c.class_id)
    )
  );

-- ------------------------------------------------------------
-- children — the core security boundary
-- ------------------------------------------------------------
create policy "admin manages children" on children for all
  using (
    auth_role() = 'admin'
    and exists (
      select 1 from classes cl
      where cl.id = children.class_id and cl.kindergarten_id = auth_kindergarten_id()
    )
  )
  with check (
    auth_role() = 'admin'
    and exists (
      select 1 from classes cl
      where cl.id = children.class_id and cl.kindergarten_id = auth_kindergarten_id()
    )
  );
create policy "teacher reads/updates own class children" on children for select
  using (is_teacher_of_class(class_id));
create policy "teacher updates own class children" on children for update
  using (is_teacher_of_class(class_id))
  with check (is_teacher_of_class(class_id));
create policy "parent reads own child only" on children for select
  using (is_parent_of_child(id));

-- ------------------------------------------------------------
-- attendance
-- ------------------------------------------------------------
create policy "teacher manages attendance for own class" on attendance for all
  using (
    exists (select 1 from children c where c.id = attendance.child_id and is_teacher_of_class(c.class_id))
  )
  with check (
    exists (select 1 from children c where c.id = attendance.child_id and is_teacher_of_class(c.class_id))
  );
create policy "parent reads own child attendance" on attendance for select
  using (is_parent_of_child(child_id));
create policy "admin reads kindergarten attendance" on attendance for select
  using (
    auth_role() = 'admin'
    and exists (
      select 1 from children c join classes cl on cl.id = c.class_id
      where c.id = attendance.child_id and cl.kindergarten_id = auth_kindergarten_id()
    )
  );

-- ------------------------------------------------------------
-- daily_reports — the big one: parent must ONLY see their own child
-- ------------------------------------------------------------
create policy "teacher manages reports for own class" on daily_reports for all
  using (is_teacher_of_class(class_id))
  with check (is_teacher_of_class(class_id));
create policy "parent reads own child reports only" on daily_reports for select
  using (is_parent_of_child(child_id));
create policy "admin reads kindergarten reports" on daily_reports for select
  using (
    auth_role() = 'admin'
    and exists (
      select 1 from classes cl
      where cl.id = daily_reports.class_id and cl.kindergarten_id = auth_kindergarten_id()
    )
  );

-- ------------------------------------------------------------
-- daily_activities
-- ------------------------------------------------------------
create policy "teacher manages activities for own class" on daily_activities for all
  using (
    exists (
      select 1 from daily_reports dr
      where dr.id = daily_activities.daily_report_id and is_teacher_of_class(dr.class_id)
    )
  )
  with check (
    exists (
      select 1 from daily_reports dr
      where dr.id = daily_activities.daily_report_id and is_teacher_of_class(dr.class_id)
    )
  );
create policy "parent reads own child activities" on daily_activities for select
  using (
    exists (
      select 1 from daily_reports dr
      where dr.id = daily_activities.daily_report_id and is_parent_of_child(dr.child_id)
    )
  );
create policy "admin reads kindergarten activities" on daily_activities for select
  using (
    auth_role() = 'admin'
    and exists (
      select 1 from daily_reports dr join classes cl on cl.id = dr.class_id
      where dr.id = daily_activities.daily_report_id and cl.kindergarten_id = auth_kindergarten_id()
    )
  );

-- ------------------------------------------------------------
-- notifications — strictly own inbox
-- ------------------------------------------------------------
create policy "read own notifications" on notifications for select
  using (recipient_id = auth.uid());
create policy "update own notifications" on notifications for update
  using (recipient_id = auth.uid());
create policy "system inserts notifications" on notifications for insert
  with check (true);
