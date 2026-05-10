import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: Props) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search developers, skills, or projects..."
        className="w-full bg-dark-card/30 backdrop-blur-xl border border-dark-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all shadow-2xl"
      />
    </div>
  );
};

export default SearchBar;
