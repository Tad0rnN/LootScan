-- LootScan Supabase Schema
-- Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/_/sql/new

-- Wishlist table
create table if not exists public.wishlist (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  game_id          text not null,
  locale           text not null default 'en',
  game_title       text not null,
  game_thumb       text not null,
  normal_price     text not null default '0.00',
  current_price    text not null default '0.00',
  notify_on_sale   boolean not null default true,
  last_notified_at timestamptz,
  created_at       timestamptz default now() not null,
  unique(user_id, game_id)
);

-- Enable RLS
alter table public.wishlist enable row level security;

-- Policies
create policy "Users can view their own wishlist"
  on public.wishlist for select using (auth.uid() = user_id);

create policy "Users can insert to their own wishlist"
  on public.wishlist for insert with check (auth.uid() = user_id);

create policy "Users can update their own wishlist"
  on public.wishlist for update using (auth.uid() = user_id);

create policy "Users can delete from their own wishlist"
  on public.wishlist for delete using (auth.uid() = user_id);

-- Migration: add new columns if table already exists
alter table public.wishlist add column if not exists notify_on_sale   boolean not null default true;
alter table public.wishlist add column if not exists last_notified_at timestamptz;
alter table public.wishlist add column if not exists locale           text not null default 'en';

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id                uuid default gen_random_uuid() primary key,
  email             text not null unique,
  locale            text not null default 'en',
  source            text not null default 'website',
  signup_path       text not null default '/',
  referrer          text,
  user_agent        text,
  status            text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  subscribed_at     timestamptz not null default now(),
  last_sent_at      timestamptz,
  created_at        timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- No public policies on purpose:
-- subscriptions are written only through our validated server route using the service role.

-- Gamesplanet product feed (our own affiliate data, synced from
-- https://<region>.gamesplanet.com/api/v1/products/feed.xml?ref=lootscan every few hours)
create table if not exists public.gamesplanet_deals (
  uid             text not null,
  region          text not null check (region in ('fr', 'uk', 'de', 'us')),
  title           text not null,
  price           numeric not null,
  price_base      numeric not null,
  currency        text not null,
  link            text not null,
  steam_app_id    text,
  delivery_type   text,
  category        text,
  publisher       text,
  thumb           text,
  is_on_sale      boolean generated always as (price < price_base) stored,
  savings_percent numeric generated always as (
                    case when price_base > 0
                      then round(((price_base - price) / price_base) * 100, 2)
                      else 0
                    end
                  ) stored,
  updated_at      timestamptz not null default now(),
  primary key (uid, region)
);

alter table public.gamesplanet_deals enable row level security;

create policy "Anyone can view gamesplanet deals"
  on public.gamesplanet_deals for select using (true);

-- No insert/update/delete policies on purpose:
-- rows are written only by the sync cron job using the service role.

create index if not exists gamesplanet_deals_region_idx on public.gamesplanet_deals (region);
create index if not exists gamesplanet_deals_steam_app_id_idx on public.gamesplanet_deals (steam_app_id);
create index if not exists gamesplanet_deals_savings_idx on public.gamesplanet_deals (region, savings_percent desc);
