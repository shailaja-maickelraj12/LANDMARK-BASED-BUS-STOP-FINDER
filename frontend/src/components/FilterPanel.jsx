import React from 'react';
import { Filter, RotateCcw, MapPin, Bus, Compass } from 'lucide-react';

export default function FilterPanel({
  selectedDistance,
  onDistanceChange,
  selectedDestination,
  onDestinationChange,
  destinations = [],
  busNumberQuery,
  onBusNumberChange,
  onResetFilters
}) {
  const distanceOptions = [
    { label: 'All Stops', value: '' },
    { label: '500 m', value: '500' },
    { label: '1 km', value: '1000' },
    { label: '2 km', value: '2000' },
    { label: '5 km', value: '5000' },
  ];

  const hasActiveFilters = Boolean(selectedDistance || selectedDestination || busNumberQuery);

  return (
    <div className="filter-panel card">
      <div className="filter-panel-header">
        <div className="filter-title">
          <Filter size={18} className="filter-icon" />
          <span>Filter Bus Stops & Routes</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm reset-filter-btn"
            onClick={onResetFilters}
            title="Reset All Filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      <div className="filter-grid">
        {/* Distance Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Compass size={14} />
            <span>Maximum Distance (Haversine)</span>
          </label>
          <div className="distance-radio-group">
            {distanceOptions.map((opt) => (
              <label
                key={opt.value}
                className={`distance-chip ${selectedDistance === opt.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="distance-filter"
                  value={opt.value}
                  checked={selectedDistance === opt.value}
                  onChange={(e) => onDistanceChange(e.target.value)}
                  className="sr-only"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Destination Filter */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="dest-select">
            <MapPin size={14} />
            <span>Filter by Destination (Match Bus)</span>
          </label>
          <select
            id="dest-select"
            className="select-input"
            value={selectedDestination}
            onChange={(e) => onDestinationChange(e.target.value)}
          >
            <option value="">-- All Destinations --</option>
            {destinations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Bus Number Filter */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="bus-search">
            <Bus size={14} />
            <span>Search by Bus Number</span>
          </label>
          <input
            id="bus-search"
            type="text"
            className="text-input"
            placeholder="e.g. 27B, 21G, 29C..."
            value={busNumberQuery}
            onChange={(e) => onBusNumberChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
