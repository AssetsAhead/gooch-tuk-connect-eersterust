import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SmartLocationInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  storageKey: "pickup" | "destination";
  quickSuggestions?: string[];
}

const STORAGE_PREFIX = "loc_suggestions";

export const SmartLocationInput: React.FC<SmartLocationInputProps> = ({
  value,
  onChange,
  placeholder,
  storageKey,
  quickSuggestions = [],
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);

  const storageId = useMemo(() => `${STORAGE_PREFIX}:${user?.id || "anon"}:${storageKey}`, [user?.id, storageKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageId);
      if (raw) setLocalSuggestions(JSON.parse(raw));
    } catch (e) {
      // no-op
    }
  }, [storageId]);

  const mergedSuggestions = useMemo(() => {
    const set = new Set<string>([...quickSuggestions, ...localSuggestions]);
    return Array.from(set).filter(Boolean).slice(0, 12);
  }, [quickSuggestions, localSuggestions]);

  const persistSuggestion = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Update localStorage (MRU ordering)
    try {
      const next = [trimmed, ...localSuggestions.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 20);
      setLocalSuggestions(next);
      localStorage.setItem(storageId, JSON.stringify(next));
    } catch (e) {
      // ignore
    }

    // Fire-and-forget analytics event
    try {
      await supabase.from("analytics_events").insert({
        event_type: "location_input",
        user_id: user?.id ?? null,
        session_id: crypto?.randomUUID?.() ?? "web",
        event_data: { field: storageKey, value: trimmed },
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
      });
    } catch (e) {
      // ignore analytics failure
    }
  };

  const handleSelect = (text: string) => {
    onChange(text);
    setOpen(false);
    void persistSuggestion(text);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setOpen(false);
      void persistSuggestion(value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-expanded={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 z-50 w-full min-w-[18rem]">
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandList>
            <CommandEmpty>No suggestions yet</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {mergedSuggestions.map((s) => (
                <CommandItem key={s} value={s} onSelect={() => handleSelect(s)}>
                  {s}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="p-2 border-t text-right">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SmartLocationInput;
