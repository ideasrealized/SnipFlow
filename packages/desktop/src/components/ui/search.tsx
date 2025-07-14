import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Search as SearchIcon, X, Filter, Command } from 'lucide-react';
import Fuse, { FuseResultMatch } from 'fuse.js';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { Button } from './button';

interface SearchResult<T> {
  item: T;
  score: number;
  matches?: FuseResultMatch[];
}

interface SearchProps<T> {
  data: T[];
  onResultsChange: (results: SearchResult<T>[]) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  searchFields?: string[];
  threshold?: number;
  showFilters?: boolean;
  autoFocus?: boolean;
  clearOnEscape?: boolean;
  showShortcut?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const defaultSearchOptions = {
  threshold: 0.3,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
  useExtendedSearch: true,
};

export const Search = forwardRef<HTMLInputElement, SearchProps<any>>(
  ({
    data,
    onResultsChange,
    onQueryChange,
    placeholder = "Search...",
    className,
    searchFields = ['name', 'description'],
    threshold = 0.3,
    showFilters = false,
    autoFocus = false,
    clearOnEscape = true,
    showShortcut = false,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const [query, setQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>(searchFields);
    const inputRef = useRef<HTMLInputElement>(null);
    const fuseRef = useRef<Fuse<any> | null>(null);

    // Initialize Fuse.js
    useEffect(() => {
      if (data.length > 0) {
        fuseRef.current = new Fuse(data, {
          ...defaultSearchOptions,
          threshold,
          keys: selectedFields,
        });
      }
    }, [data, threshold, selectedFields]);

    // Handle search
    useEffect(() => {
      if (!fuseRef.current) {
        onResultsChange([]);
        return;
      }

      if (query.trim() === '') {
        onResultsChange(data.map(item => ({ item, score: 0 })));
        return;
      }

      const results = fuseRef.current.search(query);
      onResultsChange(results.map(result => {
        const mappedResult: SearchResult<any> = {
          item: result.item,
          score: result.score ?? 1,
        };
        if (result.matches) {
          mappedResult.matches = [...result.matches];
        }
        return mappedResult;
      }));
    }, [query, data, onResultsChange]);

    // Handle query changes
    const handleQueryChange = (newQuery: string) => {
      setQuery(newQuery);
      onQueryChange?.(newQuery);
    };

    // Handle clear
    const handleClear = () => {
      setQuery('');
      onQueryChange?.('');
      inputRef.current?.focus();
    };

    // Handle escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && clearOnEscape) {
          handleClear();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [clearOnEscape]);

    // Handle field selection
    const handleFieldToggle = (field: string) => {
      setSelectedFields(prev => 
        prev.includes(field) 
          ? prev.filter(f => f !== field)
          : [...prev, field]
      );
    };

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref || inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus={autoFocus}
            className={cn(
              "pl-10 pr-12",
              showShortcut && "pr-20"
            )}
            {...props}
          />
          
          {/* Keyboard shortcut indicator */}
          {showShortcut && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <Command className="h-3 w-3" />
                <span>K</span>
              </kbd>
            </div>
          )}
          
          {/* Clear button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {/* Filter button */}
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted",
                isFilterOpen && "bg-muted"
              )}
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Filter dropdown */}
        {isFilterOpen && showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-popover border rounded-md shadow-md z-50">
            <div className="space-y-2">
              <div className="text-sm font-medium">Search in:</div>
              {searchFields.map(field => (
                <label key={field} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{field}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';

// Helper function to highlight search matches
export const highlightMatches = (text: string, matches?: FuseResultMatch[]) => {
  if (!matches || matches.length === 0) return text;

  let highlightedText = text;
  const highlights: Array<{ start: number; end: number }> = [];

  // Collect all match indices
  matches.forEach(match => {
    if (match.indices) {
      match.indices.forEach(([start, end]: [number, number]) => {
        highlights.push({ start, end });
      });
    }
  });

  // Sort highlights by start position
  highlights.sort((a, b) => a.start - b.start);

  // Apply highlights from end to start to avoid index shifting
  for (let i = highlights.length - 1; i >= 0; i--) {
    const highlight = highlights[i];
    if (highlight) {
      const { start, end } = highlight;
      const before = highlightedText.substring(0, start);
      const match = highlightedText.substring(start, end + 1);
      const after = highlightedText.substring(end + 1);
      
      highlightedText = `${before}<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">${match}</mark>${after}`;
    }
  }

  return highlightedText;
};

export type { SearchResult, SearchProps };
