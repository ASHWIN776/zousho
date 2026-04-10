"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";

import { useState, useCallback } from "react";
import { Search, Link, Loader2, Check, AlertTriangle, CircleX } from "lucide-react";
import { saveLink } from "@/lib/actions";

type Mode = "idle" | "search" | "save";
type SaveState = "idle" | "saving" | "success" | "duplicate" | "error";

const URL_PATTERN = /^(https?:\/\/|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(\/.*)?$)/;

function detectMode(input: string): Mode {
  if (!input.trim()) return "idle";
  if (URL_PATTERN.test(input.trim())) return "save";
  return "search";
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function SmartBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [input, setInput] = useState(searchParams.get("query") ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const mode = detectMode(input);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("query", input);
    params.set("type", 'all');
    replace(`${pathname}?${params.toString()}`);
  }, [input, searchParams, pathname, replace]);

  const handleClear = useCallback(() => {
    setInput("");
    const params = new URLSearchParams(searchParams);
    params.delete("query");
    params.delete("type");
    const qs = params.toString();
    replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, pathname, replace]);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setSaveMessage("");

    try {
      const url = normalizeUrl(input);
      const result = await saveLink(url);

      if (result.error === "duplicate") {
        setSaveState("duplicate");
        setSaveMessage("You've already saved this blog.");
        return;
      }

      if (result.error) {
        setSaveState("error");
        setSaveMessage(result.error);
        return;
      }

      setSaveState("success");
      setSaveMessage("Saved! Indexing in background...");

      setTimeout(() => {
        setInput("");
        setSaveState("idle");
        setSaveMessage("");
      }, 1500);
    } catch {
      setSaveState("error");
      setSaveMessage("An unexpected error occurred.");
    }
  }, [input]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (mode === "save") {
      handleSave();
    } else {
      handleSearch();
    }
  };

  const borderClass =
    mode === "save"
      ? "border-orange-500 focus-visible:ring-orange-500"
      : mode === "search"
        ? "border-blue-500 focus-visible:ring-blue-500"
        : "";

  const isSaving = saveState === "saving";

  const iconElement = isSaving ? (
    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
  ) : mode === "save" ? (
    <Link className="w-4 h-4 text-orange-500" />
  ) : (
    <Search className="w-4 h-4 text-muted-foreground" />
  );

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none">
            {iconElement}
          </div>
          <Input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (saveState !== "idle") {
                setSaveState("idle");
                setSaveMessage("");
              }
            }}
            placeholder="Search or paste a URL to save"
            className={`pl-9 ${input && !isSaving ? "pr-9" : ""} ${borderClass} md:text-base md:h-10`}
            disabled={isSaving}
          />
          {input && !isSaving && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <CircleX className="w-4 h-4 text-destructive" />
            </button>
          )}
        </div>
      </form>

      {saveState !== "idle" && saveState !== "saving" && saveMessage && (
        <div
          className={`flex items-center gap-2 text-sm px-1 ${
            saveState === "success"
              ? "text-green-500"
              : saveState === "duplicate"
                ? "text-yellow-500"
                : "text-red-500"
          }`}
        >
          {saveState === "success" && <Check className="w-4 h-4" />}
          {saveState === "duplicate" && <AlertTriangle className="w-4 h-4" />}
          {saveState === "error" && <AlertTriangle className="w-4 h-4" />}
          {saveMessage}
        </div>
      )}
    </div>
  );
}
