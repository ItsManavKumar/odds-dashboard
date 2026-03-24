"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search teams..." }: Props) {
  return (
    <div className="relative mb-4 sm:mb-6">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-700 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}