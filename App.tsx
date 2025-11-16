import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import StyleSelector from './components/StyleSelector';
import ImageComparator from './components/ImageComparator';
import ChatInterface from './components/ChatInterface';
import ShoppingList from './components/ShoppingList';
import { generateImage, getShoppingSuggestions, classifyChatIntent, getGeneralChatResponse } from './services/geminiService';
import { ChatMessage, ShoppingItem } from './types';
import { SparklesIcon } from './components/icons';

interface UploadedImage {
  base64: string;
  file: File;
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    try {
        const storedList = localStorage.getItem('shoppingList');
        if (storedList) {
            setShoppingList(JSON.parse(storedList));
        }
    } catch (e) {
        console.error("Failed to parse shopping list from localStorage", e);
        setShoppingList([]);
    }
  }, []);

  const handleImageUpload = (base64: string, file: File) => {
    setOriginalImage({ base64, file });
    setGeneratedImage(null);
    setChatHistory([{ sender: 'ai', text: "Great! I've got your image. What style are you envisioning for your space?" }]);
  };

  const handleSelectStyle = useCallback(async (style: string) => {
    if (!originalImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(`Reimagining your room in a ${style} style...`);
    try {
      const prompt = `Reimagine this entire room in a ${style} interior design style. Maintain the original room layout and architecture but change the furniture, colors, lighting, and decor to fit the style.`;
      const newImage = await generateImage(originalImage.base64, originalImage.file.type, prompt);
      setGeneratedImage(newImage);
      setChatHistory(prev => [...prev, { sender: 'ai', text: `Here's a ${style} version of your room! You can use the slider to compare. What do you think? Feel free to ask for changes.`}])
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);
  
  const handleSendMessage = async (message: string, intent: 'visual' | 'shopping' | 'general') => {
    setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
    setIsLoading(true);
    setError(null);

    const imageForEditing = generatedImage || originalImage?.base64;
    const fileType = originalImage?.file.type || 'image/jpeg';

    try {
        if (intent === 'visual' && imageForEditing) {
            setLoadingMessage('Applying your changes to the image...');
            const newImage = await generateImage(imageForEditing, fileType, message);
            setGeneratedImage(newImage);
            setChatHistory(prev => [...prev, { sender: 'ai', text: 'Done! What do you think of this version?' }]);
        } else if (intent === 'shopping') {
            setLoadingMessage('Searching for product ideas...');
            const items = await getShoppingSuggestions(message);
            setChatHistory(prev => [...prev, { sender: 'ai', text: 'Here are a few ideas I found:', items }]);
        } else {
            setLoadingMessage('Thinking...');
            const responseText = await getGeneralChatResponse(message);
            setChatHistory(prev => [...prev, { sender: 'ai', text: responseText }]);
        }
    } catch (err: any) {
        const errorMessage = err.message || 'Sorry, I ran into an issue.';
        setError(errorMessage);
        setChatHistory(prev => [...prev, { sender: 'ai', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    
    const mimeTypeMatch = generatedImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    let extension = 'png';
    if (mimeTypeMatch && mimeTypeMatch.length > 1) {
      extension = mimeTypeMatch[1].split('/')[1];
    }
    
    link.download = `reimagined-room.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToShoppingList = (itemToAdd: ShoppingItem) => {
    setShoppingList(prevList => {
        if (prevList.some(item => item.url === itemToAdd.url)) {
            return prevList; // Already in list
        }
        const newList = [...prevList, itemToAdd];
        localStorage.setItem('shoppingList', JSON.stringify(newList));
        return newList;
    });
  };

  const handleRemoveFromShoppingList = (itemUrl: string) => {
      setShoppingList(prevList => {
          const newList = prevList.filter(item => item.url !== itemUrl);
          localStorage.setItem('shoppingList', JSON.stringify(newList));
          return newList;
      });
  };

  const handleClearShoppingList = () => {
      setShoppingList([]);
      localStorage.removeItem('shoppingList');
  };

  if (!originalImage) {
    return (
      <main className="w-full min-h-screen">
        <ImageUploader onImageUpload={handleImageUpload} />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 lg:p-6 h-screen flex flex-col space-y-4">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col space-y-4 min-h-0">
          <StyleSelector onSelectStyle={handleSelectStyle} isLoading={isLoading && !generatedImage} />
          {error && <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-md text-sm">{error}</div>}
          
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            {isLoading && !generatedImage && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse" />
                <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
              </div>
            )}
            
            {!generatedImage ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <img src={originalImage.base64} alt="Original Room" className="max-h-full max-w-full" />
                </div>
            ) : (
                <ImageComparator original={originalImage.base64} generated={generatedImage} onDownload={handleDownloadImage} />
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-4 min-h-0">
          <ShoppingList 
            list={shoppingList}
            onRemoveItem={handleRemoveFromShoppingList}
            onClearList={handleClearShoppingList}
          />
          <div className="flex-1 min-h-0">
            <ChatInterface 
              onSendMessage={handleSendMessage} 
              chatHistory={chatHistory} 
              isLoading={isLoading}
              classifyIntent={classifyChatIntent}
              onAddItem={handleAddToShoppingList}
              shoppingList={shoppingList}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;