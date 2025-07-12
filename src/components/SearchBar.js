import { Search, FilterList } from '@mui/icons-material';

export default function SearchBar({ searchQuery, handleSearch, filterType, setFilterType }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search tours..."
              className="input-field pl-10 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="input-field min-w-[150px]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="religious">Religious</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="wildlife">Wildlife</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <FilterList className="w-5 h-5" />
            More Filters
          </button>
        </div>
      </div>
    </div>
  );
}
