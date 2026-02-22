"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState, useCallback } from "react";
import { Search, Link, Loader2, Check, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [type, setType] = useState(searchParams.get("type") ?? "all");

  const mode = detectMode(input);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("query", input);
    params.set("type", type);
    replace(`${pathname}?${params.toString()}`);
  }, [input, type, searchParams, pathname, replace]);

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

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit}>
        <div className="flex lg:space-x-4 flex-wrap lg:flex-nowrap space-y-4 lg:space-y-0 items-center">
          <div className="relative flex-grow flex items-center">
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
              placeholder="Search your library or paste a URL to save"
              className={`dark:bg-zinc-800/50 dark:border-zinc-700 pr-20 ${borderClass}`}
              disabled={isSaving}
            />
          </div>

          {mode !== "save" && (
            <Select
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger className="mr-4 lg:mr-0 w-[calc(100%_-120px)] lg:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            type="submit"
            disabled={isSaving || !input.trim()}
            className={
              mode === "save"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-foreground"
            }
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "save" ? (
              <Link className="w-4 h-4" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : mode === "save" ? "Save" : "Search"}
          </Button>
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
