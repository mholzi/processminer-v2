"use client";

import { useState, useEffect, useId, useRef } from "react";

export interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function Combobox({
  value,
  onChange,
  options,
  placeholder,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  // Index of the keyboard-highlighted option within `filteredOptions`; -1 = none.
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // Find corresponding label for the current value
  const activeOption = options.find((o) => o.value === value);
  const displayValue = activeOption ? activeOption.label : value;

  // Sync filter when value changes or when combobox closes
  useEffect(() => {
    if (!isOpen) {
      setFilter(displayValue);
    }
  }, [value, isOpen, displayValue]);

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(
    (o) =>
      o.value.toLowerCase().includes(filter.toLowerCase()) ||
      o.label.toLowerCase().includes(filter.toLowerCase())
  );

  // Keep the highlight in range as the filtered list changes, and keep the
  // highlighted option scrolled into view.
  useEffect(() => {
    setActiveIndex((i) => (i >= filteredOptions.length ? filteredOptions.length - 1 : i));
  }, [filteredOptions.length]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const selectOption = (opt: Option) => {
    onChange(opt.value);
    setFilter(opt.label);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
        e.preventDefault();
        selectOption(filteredOptions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  const showList = isOpen && filteredOptions.length > 0;
  const activeOptionId =
    showList && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="combobox-container">
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        value={isOpen ? filter : displayValue}
        placeholder={placeholder || "Type or select..."}
        onChange={(e) => {
          setFilter(e.target.value);
          setActiveIndex(-1);
          // Update parent dynamically while typing so custom values work
          onChange(e.target.value);
        }}
        onFocus={() => {
          setFilter(displayValue);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {showList && (
        <ul ref={listRef} className="combobox-dropdown" role="listbox" id={listboxId}>
          {filteredOptions.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`combobox-option${i === activeIndex ? " active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
