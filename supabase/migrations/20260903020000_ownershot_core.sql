-- OwnerShot Ads: profiles, shops, products, assets, jobs. RLS on.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '',
  price text not null default '',
  material text not null default '',
  owner_brand text not null default '',
  cover_path text,
  extra_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'draft',
  facts jsonb not null default '{}'::jsonb,
  copy jsonb,
  cover_path text,
  extra_paths text[] not null default '{}',
  stills jsonb not null default '[]'::jsonb,
  clip_path text,
  audio_mode text not null default 'none',
  pack_path text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  path text not null,
  format text,
  created_at timestamptz not null default now()
);

create index if not exists shops_owner_id_idx on public.shops (owner_id);
create index if not exists products_owner_id_idx on public.products (owner_id);
create index if not exists jobs_owner_id_idx on public.jobs (owner_id);
create index if not exists jobs_updated_at_idx on public.jobs (updated_at desc);
create index if not exists assets_owner_id_idx on public.assets (owner_id);

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.jobs enable row level security;
alter table public.assets enable row level security;

create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy shops_owner on public.shops
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy products_owner on public.products
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy jobs_owner on public.jobs
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy assets_owner on public.assets
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('owner-media', 'owner-media', false)
on conflict (id) do nothing;

create policy owner_media_select on storage.objects
  for select using (
    bucket_id = 'owner-media' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy owner_media_insert on storage.objects
  for insert with check (
    bucket_id = 'owner-media' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy owner_media_update on storage.objects
  for update using (
    bucket_id = 'owner-media' and auth.uid()::text = (storage.foldername(name))[1]
  );
