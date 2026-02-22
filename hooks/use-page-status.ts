import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PageStatus } from "@/lib/types";

export function usePageStatus(pageId: string | null) {
  const [status, setStatus] = useState<PageStatus | null>(null);

  useEffect(() => {
    if (!pageId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`page-status-${pageId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pages",
          filter: `id=eq.${pageId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as PageStatus;
          setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageId]);

  return status;
}
