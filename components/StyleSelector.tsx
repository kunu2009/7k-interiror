
import React from 'react';
import { DESIGN_STYLES } from '../constants';

interface StyleSelectorProps {
  onSelectStyle: (style: string) => void;
  isLoading: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelectStyle, isLoading }) => {
  return (
    <div className="w-full py-4">
      <p className="text-center text-gray-400 mb-4 text-sm">First, pick a style to reimagine your room:</p>
      <div className="flex overflow-x-auto space-x-3 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => onSelectStyle(style)}
            disabled={isLoading}
            className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-full hover:bg-purple-600 hover:border-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
