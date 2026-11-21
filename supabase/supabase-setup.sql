-- =====================================================================
-- OPA HR Admin Corp Tools - Setup Supabase (jalankan SEKALI di SQL Editor, aman diulang)
-- Isi: tabel, aturan keamanan (RLS), folder cloud "arsip", realtime, fungsi bantu.
-- (Fungsi opa_orphan_objects yang disebut di aplikasi sebagai "supabase-tambahan.sql" sudah ada di sini.)
-- =====================================================================

-- 1. Profil pengguna (satu baris per akun login) -----------------------
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nama text,
  role text not null default 'admin',
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Data aplikasi (kontrak, karyawan, surat, slip gaji, dll.) ----------
create table if not exists public.app_data(
  key text primary key,
  value jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- 3. Daftar berkas (lampiran arsip + hasil generate PDF/Excel/XML) ------
create table if not exists public.app_files(
  file_key text primary key,
  store text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  storage_path text not null,
  kind text,
  source text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_files_store_idx on public.app_files(store);
create index if not exists app_files_path_idx on public.app_files(storage_path);

-- 4. Otomatis: nomor versi + waktu ubah ---------------------------------
create or replace function public.opa_touch() returns trigger
language plpgsql as $$
begin
  if tg_table_name = 'app_data' then
    if tg_op = 'INSERT' then new.version := 1; else new.version := old.version + 1; end if;
    new.updated_by := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists app_data_touch on public.app_data;
create trigger app_data_touch before insert or update on public.app_data
  for each row execute function public.opa_touch();
drop trigger if exists app_files_touch on public.app_files;
create trigger app_files_touch before insert or update on public.app_files
  for each row execute function public.opa_touch();

-- 5. Profil otomatis untuk akun baru (akun pertama = admin) -------------
create or replace function public.opa_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, nama, role, aktif)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)),
          case when (select count(*) from public.profiles) = 0 then 'admin' else 'staf' end,
          true)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists opa_on_auth_user on auth.users;
create trigger opa_on_auth_user after insert on auth.users
  for each row execute function public.opa_new_user();

-- akun yang sudah terlanjur dibuat sebelum SQL ini dijalankan
insert into public.profiles(id, email, nama, role, aktif)
select id, email, split_part(email,'@',1), 'admin', true from auth.users
on conflict (id) do nothing;

-- 6. Keamanan: hanya akun aktif yang boleh baca/tulis -------------------
create or replace function public.opa_is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and aktif);
$$;

alter table public.profiles  enable row level security;
alter table public.app_data  enable row level security;
alter table public.app_files enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select to authenticated using (id = auth.uid());

drop policy if exists app_data_all on public.app_data;
create policy app_data_all on public.app_data for all to authenticated
  using (public.opa_is_active()) with check (public.opa_is_active());

drop policy if exists app_files_all on public.app_files;
create policy app_files_all on public.app_files for all to authenticated
  using (public.opa_is_active()) with check (public.opa_is_active());

-- 7. Folder cloud (Storage bucket) "arsip" - PRIVAT ---------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('arsip', 'arsip', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists arsip_select on storage.objects;
create policy arsip_select on storage.objects for select to authenticated
  using (bucket_id = 'arsip' and public.opa_is_active());
drop policy if exists arsip_insert on storage.objects;
create policy arsip_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'arsip' and public.opa_is_active());
drop policy if exists arsip_update on storage.objects;
create policy arsip_update on storage.objects for update to authenticated
  using (bucket_id = 'arsip' and public.opa_is_active())
  with check (bucket_id = 'arsip' and public.opa_is_active());
drop policy if exists arsip_delete on storage.objects;
create policy arsip_delete on storage.objects for delete to authenticated
  using (bucket_id = 'arsip' and public.opa_is_active());

-- 8. Realtime: perubahan admin lain langsung muncul ---------------------
do $$
begin
  begin alter publication supabase_realtime add table public.app_data;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.app_files; exception when duplicate_object then null; end;
end $$;

-- 9. Pembersihan: berkas di Storage yang tidak tercatat di app_files ----
create or replace function public.opa_orphan_objects(min_age interval default '1 day')
returns table(name text, size_bytes bigint, created_at timestamptz)
language sql stable security definer set search_path = public, storage as $$
  select o.name::text,
         coalesce((o.metadata->>'size')::bigint, 0),
         o.created_at
  from storage.objects o
  where o.bucket_id = 'arsip'
    and public.opa_is_active()
    and o.name not like 'backup/%'
    and o.created_at < now() - min_age
    and not exists (select 1 from public.app_files f where f.storage_path = o.name);
$$;
revoke all on function public.opa_orphan_objects(interval) from public, anon;
grant execute on function public.opa_orphan_objects(interval) to authenticated;
