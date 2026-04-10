-- LootScan Supabase Schema
-- Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/_/sql/new

-- Wishlist table
create table if not exists public.wishlist (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  game_id          text not null,
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
