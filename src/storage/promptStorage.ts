export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUsed: string;
  useCount: number;
  tags?: string[];
}

class PromptStorage {
  private async getStorageData(): Promise<{ prompts: Prompt[]; categories: string[] }> {
    const data = await chrome.storage.sync.get(['prompts', 'categories']);
    return {
      prompts: data.prompts || [],
      categories: data.categories || ['General']
    };
  }

  async getPrompts(): Promise<Prompt[]> {
    const { prompts } = await this.getStorageData();
    return prompts;
  }

  async getCategories(): Promise<string[]> {
    const { categories } = await this.getStorageData();
    return categories;
  }

  async addPrompt(title: string, content: string, category: string = 'General'): Promise<void> {
    const { prompts, categories } = await this.getStorageData();
    
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title,
      content,
      category,
      lastUsed: new Date().toISOString(),
      useCount: 0
    };
    
    prompts.push(newPrompt);
    
    // Add new category if it doesn't exist
    if (!categories.includes(category)) {
      categories.push(category);
    }
    
    await chrome.storage.sync.set({ prompts, categories });
  }

  async updatePrompt(id: string, updates: Partial<Prompt>): Promise<void> {
    const { prompts, categories } = await this.getStorageData();
    const index = prompts.findIndex((p: Prompt) => p.id === id);
    
    if (index !== -1) {
      prompts[index] = {
        ...prompts[index],
        ...updates,
        lastUsed: new Date().toISOString()
      };

      // Add new category if it doesn't exist
      if (updates.category && !categories.includes(updates.category)) {
        categories.push(updates.category);
      }

      await chrome.storage.sync.set({ prompts, categories });
    }
  }

  async deletePrompt(id: string): Promise<void> {
    const { prompts, categories } = await this.getStorageData();
    const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
    await chrome.storage.sync.set({ prompts: updatedPrompts, categories });
  }

  async incrementUseCount(id: string): Promise<void> {
    const { prompts } = await this.getStorageData();
    const prompt = prompts.find((p: Prompt) => p.id === id);
    
    if (prompt) {
      prompt.useCount += 1;
      prompt.lastUsed = new Date().toISOString();
      await chrome.storage.sync.set({ prompts });
    }
  }

  async deleteCategory(category: string): Promise<void> {
    if (category === 'General') return; // Prevent deleting the default category
    
    const { categories, prompts } = await this.getStorageData();
    const updatedCategories = categories.filter((c: string) => c !== category);
    
    // Move prompts in deleted category to 'General'
    const updatedPrompts = prompts.map((prompt: Prompt) => 
      prompt.category === category 
        ? { ...prompt, category: 'General' }
        : prompt
    );

    await chrome.storage.sync.set({
      categories: updatedCategories,
      prompts: updatedPrompts
    });
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    const { prompts } = await this.getStorageData();
    const searchTerm = query.toLowerCase();
    
    return prompts.filter((prompt: Prompt) => 
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.content.toLowerCase().includes(searchTerm) ||
      prompt.category.toLowerCase().includes(searchTerm) ||
      prompt.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  }

  async exportPrompts(): Promise<string> {
    const { prompts, categories } = await this.getStorageData();
    const exportData = {
      prompts,
      categories,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  async importPrompts(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
      interface ImportData {
        prompts: Prompt[];
        categories?: string[];
        exportDate?: string;
        version?: string;
      }

      const importedData = JSON.parse(jsonData) as ImportData;
      
      // Validate imported data structure
      if (!importedData.prompts || !Array.isArray(importedData.prompts)) {
        return { success: false, message: 'Invalid data format: prompts array is missing' };
      }

      // Validate each prompt
      for (const prompt of importedData.prompts) {
        if (!prompt.id || !prompt.title || !prompt.content || !prompt.category) {
          return { success: false, message: 'Invalid prompt format: missing required fields' };
        }
      }

      const { prompts: existingPrompts, categories: existingCategories } = await this.getStorageData();
      
      // Merge categories
      const newCategories = Array.from(new Set([
        ...existingCategories,
        ...(importedData.categories || []),
        ...importedData.prompts.map((p: Prompt) => p.category)
      ]));

      // Merge prompts, avoiding duplicates by ID
      const promptsMap = new Map(existingPrompts.map(p => [p.id, p]));
      importedData.prompts.forEach((prompt: Prompt) => {
        promptsMap.set(prompt.id, prompt);
      });
      
      const mergedPrompts = Array.from(promptsMap.values());

      await chrome.storage.sync.set({ 
        prompts: mergedPrompts,
        categories: newCategories
      });

      return { 
        success: true, 
        message: `Successfully imported ${importedData.prompts.length} prompts` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const promptStorage = new PromptStorage();
