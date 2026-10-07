import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function SearchBar({ onSelect, autoFocus = false, placeholder = "Search for a landmark (e.g. Marina Beach, Kapaleeshwarar Temple)..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await api.searchLandmarks(query.trim());
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error("Search suggestions failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (landmark) => {
    setQuery(landmark.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(landmark);
    } else {
      navigate(`/landmark/${landmark.id}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="search-container" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
          />
          {loading && <Loader2 className="spinner-icon animate-spin" size={18} />}
          {query && !loading && (
            <button type="button" onClick={handleClear} className="clear-btn" aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </div>
        <button type="submit" className="search-submit-btn">
          Search
        </button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul className="suggestions-dropdown">
          {suggestions.map((lm) => (
            <li
              key={lm.id}
              className="suggestion-item"
              onClick={() => handleSelect(lm)}
            >
              <div className="suggestion-icon">
                <MapPin size={16} />
              </div>
              <div className="suggestion-info">
                <div className="suggestion-name">{lm.name}</div>
                <div className="suggestion-desc">
                  {lm.category} • {lm.city || 'Chennai'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim() && !loading && suggestions.length === 0 && (
        <div className="suggestions-dropdown empty-dropdown">
          <p>No landmark found matching "{query}".</p>
        </div>
      )}
    </div>
  );
}
