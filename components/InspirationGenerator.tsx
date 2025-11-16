import React, { useState } from 'react';
import { generateInspirationImage } from '../services/geminiService';
import { DownloadIcon, SparklesIcon } from './icons';

const InspirationGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const image = await generateInspirationImage(prompt);
      setGeneratedImage(image);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `inspiration-${prompt.substring(0, 20).replace(/\s/g, '_')}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-200">Or, Generate an Idea</h2>
        <p className="text-gray-400 mt-2">Describe your dream room and let AI create a visual concept for you.</p>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A minimalist living room with a large abstract painting, floor-to-ceiling windows, and a plush white sofa..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition h-24 md:h-auto resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>{isLoading ? 'Generating...' : 'Generate Image'}</span>
          </button>
        </div>
        
        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        
        <div className="mt-6">
          <div className="relative w-full aspect-video bg-gray-700/50 rounded-lg border border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <SparklesIcon className="w-10 h-10 text-purple-400 animate-pulse" />
                <p className="mt-2 text-gray-300">Creating your vision...</p>
              </div>
            )}
            {generatedImage ? (
                <>
                    <img src={generatedImage} alt="AI generated inspiration" className="w-full h-full object-contain" />
                    <button
                        onClick={handleDownloadImage}
                        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur-sm text-white rounded-full hover:bg-gray-900/80 transition-colors"
                        aria-label="Download inspiration image"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download</span>
                    </button>
                </>
            ) : (
              !isLoading && <p className="text-gray-500">Your generated image will appear here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationGenerator;
