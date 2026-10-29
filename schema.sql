
-- Categorias
create table public.subjects (
    id text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    color text not null,
    unique (id, user_id)
);

-- Tarefas
create table public.tasks (
    id text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    subject_id text not null,
    text text not null,
    done boolean not null default false,
    due date,
    foreign key (subject_id, user_id)
        references public.subjects(id, user_id) on delete cascade
);

-- Segurança
-- rls define quais registros cada usuário acessa
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;

revoke all on public.subjects, public.tasks from anon; -- bloqueia usuarios nao autenticados
grant select, insert, update, delete -- permite que usuarios autenticados façam essas operações
on public.subjects, public.tasks to authenticated;

-- Permissões das categorias
create policy "Read own subjects"
on public.subjects for select to authenticated
using (user_id = (select auth.uid()));

create policy "Insert own subjects"
on public.subjects for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "Update own subjects"
on public.subjects for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Delete own subjects"
on public.subjects for delete to authenticated
using (user_id = (select auth.uid()));

-- Permissões das tarefas
create policy "Read own tasks"
on public.tasks for select to authenticated
using (user_id = (select auth.uid()));

create policy "Insert own tasks"
on public.tasks for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "Update own tasks"
on public.tasks for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Delete own tasks"
on public.tasks for delete to authenticated
using (user_id = (select auth.uid()));

create index subjects_user_id_idx on public.subjects(user_id);
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_subject_id_idx on public.tasks(subject_id);
