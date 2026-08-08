'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAiSearch?: (q: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function KnowledgeSearchBar({
  value,
  onChange,
  onAiSearch,
  placeholder,
  suggestions = [],
}: Props) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === '/' && !focused && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focused]);

  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className={cn(
          'relative flex items-center rounded-2xl border bg-background shadow-sm transition-all',
          focused
            ? 'border-primary ring-2 ring-primary/20 shadow-lg'
            : 'border-border hover:border-border/80',
        )}
      >
        <div className="pl-4 pr-2 flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => {
            setFocused(true);
            if (value) setShowSuggestions(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder ?? 'جستجوی هوشمند در دانشنامه...     ( / یا ⌘K )'}
          className="flex-1 h-14 bg-transparent pr-2 pl-2 text-[15px] outline-none placeholder:text-muted-foreground/60"
        />
        <div className="flex items-center gap-1 pr-2">
          {value && (
            <button
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {onAiSearch && value.length >= 2 && (
            <button
              onClick={() => onAiSearch(value)}
              className="h-9 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-3.5 w-3.5" />
              جستجوی AI
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 ml-1 pl-2 border-l border-border">
            <kbd className="h-6 px-1.5 rounded border bg-muted text-[10px] font-mono flex items-center gap-1">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl border bg-card shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <p className="text-[10px] text-muted-foreground px-2 py-1 uppercase tracking-wider">
              پیشنهادها
            </p>
            {filteredSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  onChange(s);
                  setShowSuggestions(false);
                }}
                className="w-full text-right px-3 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2 transition-colors"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                {s}
              </button>
            ))}
          </div>
          <div className="border-t bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            جستجوی هوشمند با پشتیبانی از استانداردها، تجهیزات و محاسبات
          </div>
        </div>
      )}
    </div>
  );
}
