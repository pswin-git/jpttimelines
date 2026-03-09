import type { Filters, Region, Category, Tag } from '../types';
import { MultiSelect } from './MultiSelect';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  regions: Region[];
  categories: Category[];
  tags: Tag[];
  onClear: () => void;
}

export function FilterSidebar({ filters, onChange, regions, categories, tags, onClear }: Props) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilters =
    filters.search ||
    filters.start_year ||
    filters.end_year ||
    filters.region_ids.length > 0 ||
    filters.category_ids.length > 0 ||
    filters.tag_ids.length > 0;

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <h2>Filters</h2>
        {hasFilters && (
          <button className="btn-link" onClick={onClear}>Clear all</button>
        )}
      </div>

      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          placeholder="Title or narrative…"
        />
      </div>

      <div className="filter-group">
        <label>Date range</label>
        <div className="year-range">
          <input
            type="number"
            value={filters.start_year}
            onChange={e => set('start_year', e.target.value)}
            placeholder="From"
          />
          <span className="year-range-sep">–</span>
          <input
            type="number"
            value={filters.end_year}
            onChange={e => set('end_year', e.target.value)}
            placeholder="To"
          />
        </div>
        <p className="field-hint">Negative = BCE (e.g. −44)</p>
      </div>

      <div className="filter-group">
        <MultiSelect
          label="Regions"
          options={regions}
          selected={filters.region_ids}
          onChange={ids => set('region_ids', ids)}
          placeholder="Any region"
        />
      </div>

      <div className="filter-group">
        <MultiSelect
          label="Categories"
          options={categories}
          selected={filters.category_ids}
          onChange={ids => set('category_ids', ids)}
          placeholder="Any category"
        />
      </div>

      <div className="filter-group">
        <MultiSelect
          label="Tags"
          options={tags}
          selected={filters.tag_ids}
          onChange={ids => set('tag_ids', ids)}
          placeholder="Any tag"
        />
      </div>
    </aside>
  );
}
