"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Crosshair, Search, Heart, Zap, Menu, X, LogIn, LogOut, Gift, TrendingUp, Bot, Gamepad2, Target } from "lucide-react";
import GameSearchModal from "./GameSearchModal";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import RegionSwitcher from "./RegionSwitcher";
import { GlassButton } from "./ui/glass-button";

function getUserInitial(user: User | null): string {
  const source = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email
    || "?";

  return source.trim().charAt(0).toUpperCase() || "?";
}

export default function Navbar() {
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const t = useTranslations("nav");
  const supabase = createClient();
  const userInitial = getUserInitial(user);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: `/${locale}/deals`, label: t("deals"), icon: Zap },
    { href: `/${locale}/free`, label: t("free"), icon: Gift },
    { href: `/${locale}/popular`, label: t("popular"), icon: TrendingUp },
    { href: `/${locale}/search`, label: t("search"), icon: Bot },
    { href: `/${locale}/gear`, label: t("gear"), icon: Gamepad2 },
    { href: `/${locale}/wishlist`, label: t("wishlist"), icon: Heart },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    const onPointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);

    // Global keyboard shortcut: "/" opens search (unless user is typing in an input)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
  };

  return (
    <>
    <nav className={clsx(
      "sticky top-0 z-50 transition-all duration-500",
      scrolled
        ? "backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/30"
        : "bg-transparent"
    )}
      style={scrolled ? { background: 'rgba(5,5,13,0.85)' } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 16px rgba(34,197,94,0.3)' }}>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 24px rgba(34,197,94,0.5)' }} />
              <Crosshair className="w-4 h-4 text-white relative z-10" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[1.1rem] tracking-tight">
              <span className="text-white">Loot</span><span className="text-brand-400">Scan</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:block flex-1 min-w-0">
            <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
              <div className="inline-flex min-w-max items-center p-1 rounded-2xl gap-0.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                      pathname === href
                        ? "text-brand-400"
                        : "text-slate-500 hover:text-white hover:bg-white/[0.05]"
                    )}
                    style={pathname === href ? { background: 'rgba(34,197,94,0.1)' } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex shrink-0 items-center gap-1.5 lg:gap-2">
            <GlassButton
              onClick={() => setSearchOpen(true)}
              size="default"
              className="text-slate-300 hover:text-white"
              title={t("searchGames")}
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden lg:inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[11px] font-mono text-slate-600"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                /
              </kbd>
            </GlassButton>
            <GlassButton
              asChild
              variant="brand"
              size="icon"
              title="FPS Scan (yakında)"
              aria-label="FPS Scan"
            >
              <Link href={`/${locale}/fpsscan`}>
                <Target className="w-4 h-4 text-brand-400" />
              </Link>
            </GlassButton>
            <RegionSwitcher />
            <LanguageSwitcher />
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  title={user.email ?? undefined}
                  aria-label={user.email ?? "Account"}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
                    border: '1px solid rgba(34,197,94,0.25)',
                  }}
                >
                  {userInitial}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-2xl shadow-black/60 animate-fade-in"
                    style={{ background: '#0c0c18', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider">Account</p>
                        <p className="truncate text-sm font-medium text-slate-200">{user.email}</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white transition-all duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${locale}/auth/login`}
                className="btn-primary whitespace-nowrap flex items-center gap-1.5 text-sm !py-2 !px-4">
                <LogIn className="w-3.5 h-3.5" />
                {t("signIn")}
              </Link>
            )}
          </div>

          {/* Mobile: search + menu */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/5 pt-3 animate-slide-up">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-brand-500/15 text-brand-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="pt-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <RegionSwitcher />
                <LanguageSwitcher />
              </div>
              {user ? (
                <button onClick={handleSignOut} className="text-slate-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> {t("signOut")}
                </button>
              ) : (
                <Link href={`/${locale}/auth/login`} onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-1.5 px-4">
                  {t("signIn")}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>

    {searchOpen && <GameSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
