import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  clearable?: boolean;
  /** Max items to render at once. Defaults to 100. Use lower values for very large lists. */
  maxVisible?: number;
}

// ─── PERFORMANCE FIX ──────────────────────────────────────────────────────────
// Previously: All 707 clinic / 195 area options were rendered as DOM nodes at once.
// Now: debounced search query + sliced visible window limits DOM nodes.
// ─────────────────────────────────────────────────────────────────────────────

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  isLoading = false,
  disabled = false,
  className,
  emptyMessage = "No results found.",
  clearable = false,
  maxVisible = 100,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Debounce the search query so filtering doesn't run synchronously on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 150);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Reset search when dropdown closes
  React.useEffect(() => {
    if (!open) {
      setInputValue("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Pre-filter + slice to maxVisible — avoids rendering 700+ DOM nodes
  const visibleOptions = React.useMemo(() => {
    if (!debouncedQuery) return options.slice(0, maxVisible);
    const q = debouncedQuery.toLowerCase();
    const filtered = options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    );
    return filtered.slice(0, maxVisible);
  }, [options, debouncedQuery, maxVisible]);

  const totalMatches = React.useMemo(() => {
    if (!debouncedQuery) return options.length;
    const q = debouncedQuery.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    ).length;
  }, [options, debouncedQuery]);

  const selected = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading...
              </span>
            ) : selected ? (
              selected.label
            ) : (
              placeholder
            )}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {clearable && value && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange("");
                }}
                className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {/* Custom search input with debounce — bypasses cmdk's synchronous filtering */}
        <div className="flex items-center border-b border-border px-3">
          <Search className="w-4 h-4 shrink-0 text-muted-foreground mr-2" />
          <input
            className="h-10 flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus={open}
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Options list — capped at maxVisible to prevent DOM bloat */}
        <div className="max-h-64 overflow-y-auto">
          {visibleOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <>
              {visibleOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-muted/60 transition-colors",
                    option.value === value && "bg-muted"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Show count indicator when results are truncated */}
              {totalMatches > maxVisible && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
                  Showing {maxVisible} of {totalMatches} — type to narrow results
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
