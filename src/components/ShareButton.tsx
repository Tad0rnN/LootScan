"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Twitter, Link as LinkIcon, Check, MessageCircle, Facebook } from "lucide-react";
import clsx from "clsx";

interface Props {
  url: string;       // full URL to share (will fall back to current location if empty)
  title: string;     // game / deal title
  text?: string;     // short description, e.g. "I found Elden Ring for $19.99 on LootScan"
  className?: string;
}

export default function ShareButton({ url, title, text, className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Resolve share URL (client-only)
  const shareUrl =
    url ||
    (typeof window !== "undefined" ? window.location.href : "");
  const shareText = text || title;

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClick = async () => {
    // Use native Web Share where available (mobile mostly)
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {
        // user cancelled → fall through to menu
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div ref={ref} className={clsx("relative inline-block", className)}>
      <button
        onClick={handleClick}
        className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-3.5"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0d0d1a] border border-white/10 shadow-2xl shadow-black/50 py-1.5 z-50 animate-fade-in">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
          >
            <Twitter className="w-4 h-4 text-sky-400" />
            <span>Twitter / X</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </a>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
          >
            <Facebook className="w-4 h-4 text-blue-400" />
            <span>Facebook</span>
          </a>
          <div className="my-1 mx-2 h-px bg-white/5" />
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-brand-400" />
                <span className="text-brand-400">Link copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
