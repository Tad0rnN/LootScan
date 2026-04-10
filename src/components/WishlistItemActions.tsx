"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function WishlistItemActions({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("wishlist");

  const remove = async () => {
    setLoading(true);
    await supabase.from("wishlist").delete().eq("id", itemId);
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      title={t("remove")}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
