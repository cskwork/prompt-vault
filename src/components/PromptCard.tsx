import { useState } from 'react';
import type { Prompt } from '../storage/promptStorage';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onCopy: (prompt: Prompt) => void;
}

export const PromptCard = ({ prompt, onEdit, onDelete, onCopy }: PromptCardProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(prompt);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleDelete = () => {
    console.log(`[PromptCard] Delete initiated for prompt: ${prompt.id}`);
    if (showConfirmDelete) {
      console.log(`[PromptCard] Confirmation received, calling onDelete for prompt: ${prompt.id}`);
      onDelete(prompt.id);
    } else {
      console.log(`[PromptCard] First delete click, showing confirmation for prompt: ${prompt.id}`);
      setShowConfirmDelete(true);
      setTimeout(() => {
        setShowConfirmDelete(false);
        console.log(`[PromptCard] Delete confirmation timed out for prompt: ${prompt.id}`);
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{prompt.title}</h3>
          <span className="text-xs text-gray-500">
            {prompt.category} • Used {prompt.useCount} times
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors relative"
            title="Copy to clipboard"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {showCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
            title="Edit prompt"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded transition-colors relative ${
              showConfirmDelete
                ? 'text-red-500 bg-red-50'
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
            }`}
            title={showConfirmDelete ? 'Click again to confirm' : 'Delete prompt'}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {showConfirmDelete && (
              <div className="absolute top-1/2 right-full -translate-y-1/2 mr-2 bg-red-500 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                Click again to delete
              </div>
            )}
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm whitespace-pre-wrap break-words">
        {prompt.content}
      </p>
    </div>
  );
};
