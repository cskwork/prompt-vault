import { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { PromptCard } from '../components/PromptCard';
import { promptStorage, type Prompt } from '../storage/promptStorage';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    content: '',
    category: 'General'
  });

  useEffect(() => {
    loadPrompts();
    loadCategories();
  }, []);

  const loadPrompts = async () => {
    const loadedPrompts = await promptStorage.getPrompts();
    setPrompts(loadedPrompts);
  };

  const loadCategories = async () => {
    const loadedCategories = await promptStorage.getCategories();
    setCategories(loadedCategories);
  };

  const handleAddOrUpdatePrompt = async () => {
    if (!newPrompt.title || !newPrompt.content) return;

    const finalCategory = newPrompt.category === 'new' ? newCategoryName : newPrompt.category;
    
    if (editingPrompt) {
      await promptStorage.updatePrompt(editingPrompt.id, {
        title: newPrompt.title,
        content: newPrompt.content,
        category: finalCategory
      });
    } else {
      await promptStorage.addPrompt(
        newPrompt.title,
        newPrompt.content,
        finalCategory
      );
    }

    setNewPrompt({ title: '', content: '', category: 'General' });
    setNewCategoryName('');
    setEditingPrompt(null);
    setIsModalOpen(false);
    await loadPrompts();
    await loadCategories();
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setNewPrompt({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log(`[App] Delete request received for prompt: ${id}`);
    try {
      await promptStorage.deletePrompt(id);
      console.log(`[App] Successfully deleted prompt: ${id}`);
      await loadPrompts();
      console.log('[App] Prompts reloaded after deletion');
    } catch (error) {
      console.error(`[App] Error deleting prompt ${id}:`, error);
      // TODO: Add user-facing error notification if needed
    }
  };

  const handleCopy = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.content);
    await promptStorage.incrementUseCount(prompt.id);
    await loadPrompts();
  };

  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = 
        selectedCategory === 'all' || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-gray-50">
      <div className="p-4 bg-white border-b shadow-sm">
        <h1 className="text-xl font-bold mb-4">Prompt Vault</h1>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 border rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-2.5 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button 
            onClick={() => {
              setEditingPrompt(null);
              setNewPrompt({ title: '', content: '', category: 'General' });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Add New
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Prompts
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPrompts.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {searchQuery
              ? 'No prompts found matching your search.'
              : 'No prompts yet. Click "Add New" to create one.'}
          </div>
        ) : (
          filteredPrompts.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrompt(null);
          setNewPrompt({ title: '', content: '', category: 'General' });
          setNewCategoryName('');
        }}
        title={editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newPrompt.title}
              onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter prompt title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={newPrompt.content}
              onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-2 border rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter prompt content"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newPrompt.category}
              onChange={(e) => setNewPrompt(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add New Category</option>
            </select>
          </div>
          {newPrompt.category === 'new' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new category name"
                autoFocus
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingPrompt(null);
                setNewPrompt({ title: '', content: '', category: 'General' });
                setNewCategoryName('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddOrUpdatePrompt}
              disabled={!newPrompt.title || !newPrompt.content || (newPrompt.category === 'new' && !newCategoryName)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingPrompt ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
