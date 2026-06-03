"use client";

import { useState, useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      className="combobox-container"
      style={{ position: "relative", width: "100%" }}
    >
      <input
        type="text"
        value={isOpen ? filter : displayValue}
        placeholder={placeholder || "Type or select..."}
        onChange={(e) => {
          setFilter(e.target.value);
          // Update parent dynamically while typing so custom values work
          onChange(e.target.value);
        }}
        onFocus={() => {
          setFilter(displayValue);
          setIsOpen(true);
        }}
        className={className}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          className="combobox-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            maxHeight: "180px",
            overflowY: "auto",
            margin: "4px 0 0 0",
            padding: "4px 0",
            listStyle: "none",
            borderRadius: "var(--r-sm)",
            backgroundColor: "var(--bg-card, #fff)",
            border: "1px solid var(--border, #ccc)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {filteredOptions.map((opt) => (
            <li
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setFilter(opt.label);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "var(--text-xs)",
              }}
              className="combobox-option"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
