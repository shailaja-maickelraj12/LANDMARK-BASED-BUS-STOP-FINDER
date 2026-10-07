import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, AlertCircle, Compass } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import LandmarkCard from '../components/LandmarkCard';
import api from '../services/api';

export default function Search() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState(queryParam);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (queryParam) {
      setSearchedQuery(queryParam);
      executeSearch(queryParam);
    } else {
      fetchAll();
    }
  }, [queryParam]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLandmarks();
      setResults(data);
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (term) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.searchLandmarks(term);
      setResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page-container">
      <div className="search-page-header">
        <h1 className="page-title">Search Landmark</h1>
        <p className="page-subtitle">
          Find your tourist destination to locate the nearest bus stops and direct routes.
        </p>

        <div className="search-bar-centered">
          <SearchBar
            autoFocus
            placeholder="Enter landmark name (e.g. Marina Beach, Kapaleeshwarar Temple)..."
          />
        </div>
      </div>

      <div className="search-results-section">
        <div className="results-status-bar">
          {searchedQuery ? (
            <h2>
              Search results for: <span className="highlight-term">"{searchedQuery}"</span>
              <span className="results-count"> ({results.length} found)</span>
            </h2>
          ) : (
            <h2>All Available Landmarks <span className="results-count">({results.length})</span></h2>
          )}
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching landmarks...</p>
          </div>
        )}

        {error && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="empty-state-box card">
            <AlertCircle size={36} className="empty-icon text-muted" />
            <h3>No landmark found.</h3>
            <p>Please try another landmark name or check our popular suggestions.</p>
            <div className="popular-suggestions mt-3">
              <span className="text-sm font-semibold">Try searching for:</span>
              <div className="chip-group mt-2">
                <span className="badge">Marina Beach</span>
                <span className="badge">Kapaleeshwarar Temple</span>
                <span className="badge">Fort St. George</span>
                <span className="badge">Government Museum</span>
                <span className="badge">Valluvar Kottam</span>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="landmarks-grid">
            {results.map((lm) => (
              <LandmarkCard key={lm.id} landmark={lm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
