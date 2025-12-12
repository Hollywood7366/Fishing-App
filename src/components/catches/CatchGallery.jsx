import React, { useState, useMemo } from 'react';
import CatchCard from './CatchCard';
import speciesData from '../../data/species.json';

const CatchGallery = ({ catches, onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique species from catches for filter dropdown
  const catchSpecies = useMemo(() => {
    const species = new Set(catches.map(c => c.species));
    return Array.from(species);
  }, [catches]);

  // Filter and sort catches
  const filteredCatches = useMemo(() => {
    let result = [...catches];
    
    // Filter by species
    if (filterSpecies !== 'all') {
      result = result.filter(c => c.species === filterSpecies);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.speciesName?.toLowerCase().includes(query) ||
        c.locationName?.toLowerCase().includes(query) ||
        c.baitUsed?.toLowerCase().includes(query) ||
        c.notes?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'weight-desc':
        result.sort((a, b) => (b.weight || 0) - (a.weight || 0));
        break;
      case 'weight-asc':
        result.sort((a, b) => (a.weight || 0) - (b.weight || 0));
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [catches, filterSpecies, searchQuery, sortBy]);

  // Stats summary
  const stats = useMemo(() => {
    const totalWeight = catches.reduce((sum, c) => sum + (c.weight || 0), 0);
    const withWeight = catches.filter(c => c.weight).length;
    const avgWeight = withWeight > 0 ? (totalWeight / withWeight).toFixed(1) : 0;
    
    const speciesCounts = {};
    catches.forEach(c => {
      speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1;
    });
    const topSpecies = Object.entries(speciesCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      total: catches.length,
      totalWeight: totalWeight.toFixed(1),
      avgWeight,
      topSpecies: topSpecies ? topSpecies[0] : null,
      topSpeciesCount: topSpecies ? topSpecies[1] : 0
    };
  }, [catches]);

  if (catches.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f9fafb',
        borderRadius: '16px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎣</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#374151' }}>
          No catches logged yet
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
          Start logging your catches to build your personal fishing gallery!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1d4ed8' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>
            Total Catches
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#ecfdf5',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
            {stats.totalWeight}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
            Total Lbs
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#d97706' }}>
            {stats.avgWeight}
          </div>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>
            Avg Lbs
          </div>
        </div>
        
        {stats.topSpecies && (
          <div style={{
            backgroundColor: '#fae8ff',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#a21caf' }}>
              {speciesData.find(s => s.id === stats.topSpecies)?.name?.split(' ')[0] || stats.topSpecies}
            </div>
            <div style={{ fontSize: '12px', color: '#c026d3', fontWeight: '500' }}>
              Top Species ({stats.topSpeciesCount})
            </div>
          </div>
        )}
      </div>

      {/* Filters & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 200px' }}>
          <input
            type="text"
            placeholder="🔍 Search catches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
        </div>
        
        {/* Species Filter */}
        <select
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">All Species</option>
          {catchSpecies.map(species => {
            const speciesInfo = speciesData.find(s => s.id === species);
            return (
              <option key={species} value={species}>
                {speciesInfo?.name || species}
              </option>
            );
          })}
        </select>
        
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="weight-desc">Heaviest First</option>
          <option value="weight-asc">Lightest First</option>
          <option value="rating-desc">Highest Rated</option>
        </select>
        
        {/* View Toggle */}
        <div style={{
          display: 'flex',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '10px 14px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'white',
              color: viewMode === 'grid' ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ▦ Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '10px 14px',
              border: 'none',
              borderLeft: '1px solid #d1d5db',
              backgroundColor: viewMode === 'list' ? '#3b82f6' : 'white',
              color: viewMode === 'list' ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Results Count */}
      {filteredCatches.length !== catches.length && (
        <p style={{ 
          margin: '0 0 16px', 
          fontSize: '14px', 
          color: '#6b7280' 
        }}>
          Showing {filteredCatches.length} of {catches.length} catches
        </p>
      )}

      {/* Gallery */}
      {filteredCatches.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
          <p style={{ margin: 0, color: '#6b7280' }}>
            No catches match your filters
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredCatches.map(catchItem => (
            <CatchCard
              key={catchItem.id}
              catchData={catchItem}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCatches.map(catchItem => (
            <CatchCard
              key={catchItem.id}
              catchData={catchItem}
              onEdit={onEdit}
              onDelete={onDelete}
              compact={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatchGallery;






