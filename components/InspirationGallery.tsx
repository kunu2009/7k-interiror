
import React from 'react';
import { GALLERY_ITEMS } from '../constants';

const InspirationGallery: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-center text-gray-200 mb-2">Inspiration Gallery</h2>
      <p className="text-center text-gray-400 mb-8">See what's possible with AI-powered interior design.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.style} className="relative rounded-lg overflow-hidden group shadow-lg aspect-[4/3]">
            <img src={item.imageUrl} alt={item.style} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 p-4">
              <h3 className="text-white font-semibold text-lg drop-shadow-md">{item.style}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InspirationGallery;
