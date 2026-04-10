"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";

interface Props {
  gameID: string;
  gameTitle: string;
  gameThumb: string;
  normalPrice: string;
  currentPrice: string;
}

export default function WishlistButton({ gameID, gameTitle, gameThumb, normalPrice, currentPrice }: Props) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const locale = useLocale();
  const t = useTranslations("wishlist");

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", gameID)
        .maybeSingle();
      setInWishlist(!!data);
      setLoading(false);
    };
    check();
  }, [gameID]);

  const toggle = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    if (inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("game_id", gameID);
      setInWishlist(false);
    } else {
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: gameID,
        game_title: gameTitle,
        game_thumb: gameThumb,
        normal_price: normalPrice,
        current_price: currentPrice,
      });
      setInWishlist(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={clsx(
        "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all",
        inWishlist
          ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
          : "bg-slate-700 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500"
      )}
    >
      <Heart className={clsx("w-4 h-4", inWishlist && "fill-current")} />
      {inWishlist ? t("inWishlist") : t("addToWishlist")}
    </button>
  );
}
