import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon } from './icons';

interface ImageComparatorProps {
  original: string;
  generated: string;
  onDownload: () => void;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ original, generated, onDownload }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const handleMove = (clientX: number) => {
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setSliderPos(percent);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

  const stopMoving = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('mouseup', stopMoving);
    window.removeEventListener('touchend', stopMoving);
  };
  
  const startMoving = (e: React.MouseEvent | React.TouchEvent) => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', stopMoving);
    window.addEventListener('touchend', stopMoving);
  };

  return (
    <div ref={imageContainerRef} className="relative w-full aspect-video rounded-lg overflow-hidden select-none group border-2 border-gray-700 shadow-2xl">
      <img src={original} alt="Original Room" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={generated} alt="Generated Design" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize"
        style={{ left: `calc(${sliderPos}% - 2px)` }}
        onMouseDown={startMoving}
        onTouchStart={startMoving}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
      
      <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 rounded-full text-xs font-semibold">ORIGINAL</div>
      <div 
        className="absolute top-2 right-2 px-3 py-1 bg-black/50 rounded-full text-xs font-semibold"
        style={{ opacity: sliderPos > 60 ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        REIMAGINED
      </div>

      <button
        onClick={onDownload}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur-sm text-white rounded-full hover:bg-gray-900/80 transition-colors"
        aria-label="Download reimagined image"
      >
        <DownloadIcon className="w-5 h-5" />
        <span>Download</span>
      </button>
    </div>
  );
};

export default ImageComparator;