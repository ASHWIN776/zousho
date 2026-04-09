"use client"

import Link from "next/link";
import { Loader2, AlertTriangle, Check, ChevronUp, ExternalLink, MoreHorizontal } from "lucide-react";
import { Page, PageStatus } from "@/lib/types";
import { format } from 'date-fns'

import DeleteContentDialog from "./delete-dialog";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { usePageStatus } from "@/hooks/use-page-status";
import { toggleReadStatus, updatePageNote } from "@/lib/actions";
import { useState, useCallback } from "react";
import { toast } from "sonner";

const AVATAR_COLORS = [
  'bg-red-800', 'bg-blue-800', 'bg-green-800', 'bg-yellow-800',
  'bg-purple-800', 'bg-pink-800', 'bg-indigo-800', 'bg-teal-800',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAvatarColor(seed: string): string {
  return AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
}

function getInitials(author: string | null, domain: string | null): string {
  if (author) {
    const words = author.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return author.slice(0, 2).toUpperCase();
  }
  if (domain) {
    return domain.slice(0, 2).toUpperCase();
  }
  return "??";
}

function getDomain(path: string | null): string | null {
  if (!path) return null;
  try {
    return new URL(path).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function getFaviconUrl(path: string | null): string | null {
  if (!path) return null;
  try {
    const domain = new URL(path).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

interface Props {
  page: Page
  showSimilarity: boolean
}

export default function ResourceRow({ page, showSimilarity }: Props) {
  const { name: title, path, max_similarity: similarity, created_at, id, status: initialStatus, is_read: initialIsRead, author, note: initialNote } = page;
  const similarityPercentage = similarity ? (similarity * 100).toFixed(2) : undefined;
  const faviconUrl = getFaviconUrl(path);
  const domain = getDomain(path);
  const initials = getInitials(author, domain);
  const avatarColor = getAvatarColor(author ?? domain ?? title);
  const [isRead, setIsRead] = useState(initialIsRead);
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [savedNote, setSavedNote] = useState(initialNote ?? "");

  const hasNoteChanged = note !== savedNote;

  const handleSaveNote = useCallback(async () => {
    try {
      await updatePageNote(id, note || null);
      setSavedNote(note);
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    }
  }, [id, note]);

  const handleCancelNote = useCallback(() => {
    setNote(savedNote);
  }, [savedNote]);

  const handleNoteKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveNote();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelNote();
    }
  }, [handleSaveNote, handleCancelNote]);

  // Subscribe to realtime status updates only for pages still indexing
  const realtimeStatus = usePageStatus(initialStatus === "indexing" ? id : null);
  const status: PageStatus = realtimeStatus ?? initialStatus;

  const handleToggleRead = async () => {
    const newValue = !isRead;
    setIsRead(newValue);
    try {
      await toggleReadStatus(id, newValue);
    } catch {
      setIsRead(!newValue);
      toast.error("Failed to update read status");
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Item className={`py-3 sm:py-4 gap-2 sm:gap-4 sm:px-4 px-2 ${status === "indexing" ? "opacity-70" : ""}`}>
        {/* Unread dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 self-start mt-2 ${!isRead ? 'bg-orange-500' : 'invisible'}`} />

        {/* Favicon / Avatar */}
        <ItemMedia>
          <Avatar className="h-6 w-6 rounded">
            {faviconUrl && <AvatarImage src={faviconUrl} />}
            <AvatarFallback className={`rounded text-white text-xs font-semibold ${avatarColor}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </ItemMedia>

        {/* Content */}
        <ItemContent className="self-start min-w-0">
          <ItemTitle className={`${isRead ? "font-normal" : "font-semibold"}`}>
            <Link href={path ?? `/library/${id}`} target={path ? "_blank" : "_self"} className="hover:underline line-clamp-1">
              {title}
            </Link>
            {status === "indexing" && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Indexing
              </Badge>
            )}
            {status === "failed" && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Failed
              </Badge>
            )}
            {showSimilarity && similarityPercentage && (
              <Badge variant="secondary">{similarityPercentage}% match</Badge>
            )}
          </ItemTitle>
          <ItemDescription className="flex items-center gap-2">
            {author && <span>{author}</span>}
            {author && domain && <span> · </span>}
            {domain && <span>{domain}</span>}
          </ItemDescription>
        </ItemContent>

        {/* Right side */}
        <ItemActions className="self-start flex flex-col sm:flex-row">
          <span className="text-sm text-muted-foreground">
            {format(created_at, 'MMM d')}
          </span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronUp className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
            </Button>
          </CollapsibleTrigger>
        </ItemActions>
      </Item>

      <CollapsibleContent>
        <div className="p-3 pt-0 sm:p-4 sm:pt-0 space-y-3">
          {/* Note section */}
          <div className="space-y-2">
            <Textarea
              placeholder="What did you think? What's worth remembering..."
              className="min-h-[100px] text-sm resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleNoteKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Save / Cancel row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⌘ ↵ to save · esc to cancel</span>
            <div className="flex items-center gap-2">
              {hasNoteChanged && (
                <Button variant="outline" size="sm" onClick={handleCancelNote}>
                  Cancel
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSaveNote} disabled={!hasNoteChanged}>
                Save note
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleRead}>
                    <Check className="h-4 w-4" />
                    {isRead ? "Mark as unread" : "Mark as read"}
                  </DropdownMenuItem>
                  {path && (
                    <DropdownMenuItem asChild>
                      <Link href={path} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                        Open link
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <DeleteContentDialog page={page} variant="dropdown" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
