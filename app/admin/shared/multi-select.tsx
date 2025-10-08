"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./multi-select.module.scss";

interface Option {
  _id: string;
  name: string;
  image?: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
}

const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

export default function MultiSelect({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Izaberite opcije...",
  disabled = false,
  searchPlaceholder = "Pretražite..."
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option._id)
  );

  const selectedOptions = options.filter(option =>
    selectedValues.includes(option._id)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onSelectionChange(selectedValues.filter(id => id !== optionId));
    } else {
      onSelectionChange([...selectedValues, optionId]);
    }
  };

  const removeOption = (optionId: string) => {
    onSelectionChange(selectedValues.filter(id => id !== optionId));
  };

  return (
    <div className={styles.multiSelect} ref={dropdownRef}>
      <div
        className={`${styles.selectButton} ${disabled ? styles.disabled : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.selectedItems}>
          {selectedOptions.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            <div className={styles.tags}>
              {selectedOptions.map(option => (
                <div key={option._id} className={styles.tag}>
                  {option.image && (
                    <img
                      src={`${BLOB_URL}/${option.image}`}
                      alt={option.name}
                      className={styles.tagImage}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{option.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(option._id);
                    }}
                    className={styles.removeButton}
                    disabled={disabled}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.arrow}>
          {isOpen ? "▲" : "▼"}
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.options}>
            {filteredOptions.length === 0 ? (
              <div className={styles.noOptions}>
                {searchTerm ? "Nema rezultata" : "Sve opcije su već izabrane"}
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option._id}
                  className={styles.option}
                  onClick={() => toggleOption(option._id)}
                >
                  {option.image && (
                    <img
                      src={`${BLOB_URL}/${option.image}`}
                      alt={option.name}
                      className={styles.optionImage}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{option.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}