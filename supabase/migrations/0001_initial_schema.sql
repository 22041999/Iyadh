-- Enable useful extensions ---------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Custom ENUM types ----------------------------------------------------------
create type user_role as enum ('customer', 'affiliate', 'moderator', 'admin');
create type order_status as enum ('draft', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
create type referral_status as enum ('pending', 'rewarded', 'expired');
create type ledger_entry_type as enum ('earn', 'spend', 'adjust');
create type ledger_source as enum ('order', 'referral', 'manual', 'admin_adjustment', 'expiration');
create type payment_method as enum ('card', 'points', 'mixed');

-- Profiles -------------------------------------------------------------------
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role user_role not null default 'customer',
    language_pref text check (language_pref in ('ar', 'fr', 'en')) default 'fr',
    phone text,
    address jsonb,
    referral_code text unique,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, role, referral_code)
    values (new.id, 'customer', encode(gen_random_bytes(4), 'hex'));
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
    before update on profiles
    for each row execute procedure public.touch_updated_at();

-- Catalog --------------------------------------------------------------------
create table products (
    id uuid primary key default gen_random_uuid(),
    sku text not null unique,
    slug text not null unique,
    base_price_tnd numeric(10,2) not null,
    stock integer not null default 0,
    media jsonb default '[]'::jsonb,
    name_translations jsonb not null,
    description_translations jsonb default '{}'::jsonb,
    nutrition_facts jsonb,
    tags text[] default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger products_set_updated_at
    before update on products
    for each row execute procedure public.touch_updated_at();

-- Orders ---------------------------------------------------------------------
create table orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id),
    status order_status not null default 'pending',
    subtotal_tnd numeric(10,2) not null,
    discount_tnd numeric(10,2) default 0,
    total_tnd numeric(10,2) not null,
    points_spent integer not null default 0,
    points_awarded integer not null default 0,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger orders_set_updated_at
    before update on orders
    for each row execute procedure public.touch_updated_at();

create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    product_id uuid not null references products(id),
    quantity integer not null,
    unit_price_tnd numeric(10,2) not null,
    total_price_tnd numeric(10,2) not null,
    metadata jsonb default '{}'::jsonb
);

create table payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    method payment_method not null,
    amount_tnd numeric(10,2) not null default 0,
    points integer not null default 0,
    provider_metadata jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

-- Referrals ------------------------------------------------------------------
create table referral_codes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    code text not null unique,
    active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now())
);

create unique index referral_codes_user_idx on referral_codes(user_id);

create table referrals (
    id uuid primary key default gen_random_uuid(),
    referrer_id uuid not null references profiles(id) on delete cascade,
    referee_id uuid references profiles(id) on delete set null,
    code text not null,
    status referral_status not null default 'pending',
    first_order_id uuid references orders(id),
    reward_snapshot jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger referrals_set_updated_at
    before update on referrals
    for each row execute procedure public.touch_updated_at();

-- Loyalty Ledger -------------------------------------------------------------
create table points_ledger (
    id bigint generated always as identity primary key,
    user_id uuid not null references profiles(id) on delete cascade,
    entry_type ledger_entry_type not null,
    source ledger_source not null,
    order_id uuid references orders(id) on delete set null,
    referral_id uuid references referrals(id) on delete set null,
    delta integer not null,
    balance_after integer not null,
    rule_snapshot jsonb not null,
    notes text,
    created_at timestamptz not null default timezone('utc', now())
);

create index points_ledger_user_idx on points_ledger(user_id);

-- Business Rules & Versions ---------------------------------------------------
create table business_rules (
    id bigserial primary key,
    slug text not null unique,
    version integer not null default 1,
    definition jsonb not null,
    is_active boolean not null default false,
    active_from timestamptz,
    active_to timestamptz,
    created_by uuid references profiles(id),
    created_at timestamptz not null default timezone('utc', now())
);

create table rule_versions (
    id bigserial primary key,
    rule_id bigint not null references business_rules(id) on delete cascade,
    version integer not null,
    definition jsonb not null,
    created_by uuid references profiles(id),
    created_at timestamptz not null default timezone('utc', now())
);

create unique index rule_versions_rule_version_idx on rule_versions(rule_id, version);

-- Analytics ------------------------------------------------------------------
create table event_log (
    id bigserial primary key,
    event_type text not null,
    user_id uuid references profiles(id),
    payload jsonb not null,
    created_at timestamptz not null default timezone('utc', now())
);

create table metrics_daily (
    metric_date date primary key,
    total_sales_tnd numeric(12,2) not null default 0,
    total_orders integer not null default 0,
    referral_conversions integer not null default 0,
    points_issued integer not null default 0,
    points_redeemed integer not null default 0,
    liability_points integer not null default 0,
    snapshot jsonb default '{}'::jsonb,
    generated_at timestamptz not null default timezone('utc', now())
);

-- Utility Functions ----------------------------------------------------------
create or replace function public.current_points_balance(target_user uuid)
returns integer as $$
declare
    balance integer;
begin
    select coalesce(sum(delta), 0) into balance
    from points_ledger
    where user_id = target_user;
    return balance;
end;
$$ language plpgsql stable;

create or replace function public.promote_to_affiliate()
returns trigger as $$
declare
    completed_orders integer;
begin
    if new.status = 'paid' or new.status = 'fulfilled' then
        select count(*) into completed_orders from orders where user_id = new.user_id and status in ('paid','fulfilled');
        if completed_orders = 1 then
            update profiles set role = 'affiliate' where id = new.user_id and role = 'customer';
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger promote_affiliate_after_first_order
    after update on orders
    for each row
    when (old.status is distinct from new.status)
    execute procedure public.promote_to_affiliate();

-- Row Level Security ---------------------------------------------------------
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table referral_codes enable row level security;
alter table referrals enable row level security;
alter table points_ledger enable row level security;
alter table business_rules enable row level security;
alter table rule_versions enable row level security;
alter table event_log enable row level security;
alter table metrics_daily enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
    for select
    using (auth.uid() = id);

create policy "Users update own profile" on profiles
    for update using (auth.uid() = id);

create policy "Staff manage profiles" on profiles
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Products policies
create policy "Public product read" on products
    for select using (is_active = true);

create policy "Staff manage products" on products
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Orders policies
create policy "Users can view own orders" on orders
    for select using (auth.uid() = user_id);

create policy "Users insert own orders" on orders
    for insert with check (auth.uid() = user_id);

create policy "Staff manage orders" on orders
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Order items policies
create policy "Order owners view items" on order_items
    for select using (exists (
        select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()
    ));

create policy "Staff manage order items" on order_items
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Payments policies
create policy "Order owners view payments" on payments
    for select using (exists (
        select 1 from orders o where o.id = payments.order_id and o.user_id = auth.uid()
    ));

create policy "Staff manage payments" on payments
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Referral codes & referrals policies
create policy "Users read own referral code" on referral_codes
    for select using (auth.uid() = user_id);

create policy "Users manage own referral code" on referral_codes
    for all using (auth.uid() = user_id);

create policy "Staff manage referral codes" on referral_codes
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

create policy "Users view related referrals" on referrals
    for select using (
        auth.uid() = referrer_id or auth.uid() = referee_id
    );

create policy "Staff manage referrals" on referrals
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Points ledger policies
create policy "Users view own ledger" on points_ledger
    for select using (auth.uid() = user_id);

create policy "Staff manage ledger" on points_ledger
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

-- Business rules & analytics policies
create policy "Admins manage business rules" on business_rules
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role = 'admin'
    ));

create policy "Admins manage rule versions" on rule_versions
    for all using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role = 'admin'
    ));

create policy "Admins read analytics" on event_log
    for select using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));

create policy "Admins read metrics" on metrics_daily
    for select using (exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role in ('moderator','admin')
    ));
