
import React from 'react';
import { ShoppingItem } from '../types';
import { ShoppingCartIcon, TrashIcon } from './icons';

interface ShoppingListProps {
  list: ShoppingItem[];
  onRemoveItem: (itemUrl: string) => void;
  onClearList: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ list, onRemoveItem, onClearList }) => {
  if (list.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
        <ShoppingCartIcon className="w-8 h-8 mx-auto text-gray-500 mb-2" />
        <h3 className="font-semibold text-gray-300">Your Shopping List is Empty</h3>
        <p className="text-sm text-gray-400">Add items from the chat suggestions.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <ShoppingCartIcon className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Shopping List</h3>
        </div>
        <button
          onClick={onClearList}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center space-x-1"
          aria-label="Clear shopping list"
        >
          <TrashIcon className="w-3 h-3"/>
          <span>Clear All</span>
        </button>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {list.map((item) => (
          <div key={item.url} className="flex items-center justify-between text-sm p-2 rounded-md bg-gray-700/50">
            <div>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-200 hover:text-purple-400 transition-colors">{item.name}</a>
              <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
            </div>
            <button
              onClick={() => onRemoveItem(item.url)}
              className="p-1 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              aria-label={`Remove ${item.name} from list`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
