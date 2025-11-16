import React from 'react';

interface ImageHistoryProps {
  history: string[];
  currentImage: string | null;
  onSelect: (image: string) => void;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ history, currentImage, onSelect }) => {
  if (history.length <= 1) {
    return null;
  }

  return (
    <div className="w-full pt-2">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Design History</h3>
      <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {history.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelect(image)}
            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 ${
              currentImage === image ? 'border-purple-500' : 'border-gray-700 hover:border-purple-400'
            }`}
            aria-label={`Revert to design version ${index + 1}`}
          >
            <img src={image} alt={`Design version ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;
