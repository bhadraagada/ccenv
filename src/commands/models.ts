// Models command - fetch and search available models from OpenRouter
import { select, input } from '@inquirer/prompts';
import * as tui from '../tui/theme.js';
import { banner } from '../tui/theme.js';

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  top_provider?: {
    max_completion_tokens?: number;
  };
}

interface ModelsResponse {
  data: OpenRouterModel[];
}

let cachedModels: OpenRouterModel[] | null = null;

export async function fetchModels(): Promise<OpenRouterModel[]> {
  if (cachedModels) return cachedModels;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json() as ModelsResponse;
    cachedModels = data.data || [];
    return cachedModels;
  } catch (error) {
    console.log(tui.error(`Failed to fetch models: ${(error as Error).message}`));
    return [];
  }
}

export async function listModels(searchTerm?: string, limit: number = 30): Promise<void> {
  console.log(banner('MODELS', {
    font: 'small',
    color: tui.theme.colors.primary,
    subtitle: 'OpenRouter Model Browser',
    center: false,
  }));
  
  console.log(tui.info('Fetching models...'));
  console.log('');
  
  const models = await fetchModels();
  
  if (models.length === 0) {
    console.log(tui.error('No models found or failed to fetch.'));
    return;
  }

  let filtered = models;
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = models.filter(m => 
      m.id.toLowerCase().includes(term) || 
      m.name.toLowerCase().includes(term) ||
      (m.description?.toLowerCase().includes(term))
    );
  }

  if (filtered.length === 0) {
    console.log(tui.error(`No models found matching "${searchTerm}"`));
    return;
  }

  // Sort by name
  filtered.sort((a, b) => a.id.localeCompare(b.id));
  
  const showing = filtered.slice(0, limit);
  
  const matchText = searchTerm ? ` matching "${tui.theme.colors.primary(searchTerm)}"` : '';
  console.log(tui.success(`Found ${filtered.length} models${matchText}`));
  
  if (filtered.length > limit) {
    console.log(tui.info(`Showing first ${limit}, use --limit to show more`));
  }
  console.log('');

  // Print as table
  const headers = ['Model ID', 'Context', 'Price (per 1M tokens)'];
  const rows = showing.map(model => {
    const promptPrice = parseFloat(model.pricing.prompt) * 1000000;
    const completionPrice = parseFloat(model.pricing.completion) * 1000000;
    const priceStr = tui.theme.colors.success(`$${promptPrice.toFixed(2)}`) + 
      tui.theme.text.subtitle(' / ') + 
      tui.theme.colors.success(`$${completionPrice.toFixed(2)}`);
    const contextStr = formatContext(model.context_length);
    
    return [model.id, contextStr, priceStr];
  });
  
  console.log(tui.table(headers, rows, [44, 10, 22]));
  
  console.log('');
  console.log(tui.info('Usage:'));
  console.log(`   ${tui.theme.colors.primary('ccx create <profile> --template openrouter --model <model-id>')}`);
  console.log('');
}

export async function searchModelsInteractive(): Promise<string | null> {
  console.log(banner('MODELS', {
    font: 'small',
    color: tui.theme.colors.primary,
    subtitle: 'Interactive Model Search',
    center: false,
  }));
  
  const models = await fetchModels();
  
  if (models.length === 0) {
    console.log(tui.error('No models found or failed to fetch.'));
    return null;
  }

  // First, ask for search term
  const searchTerm = await input({
    message: 'Search models (or press enter to browse all):',
  });

  let filtered = models;
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = models.filter(m => 
      m.id.toLowerCase().includes(term) || 
      m.name.toLowerCase().includes(term)
    );
  }

  if (filtered.length === 0) {
    console.log(tui.error(`No models found matching "${searchTerm}"`));
    return null;
  }

  // Sort by name and limit choices
  filtered.sort((a, b) => a.id.localeCompare(b.id));
  const choices = filtered.slice(0, 50).map(m => {
    const promptPrice = parseFloat(m.pricing.prompt) * 1000000;
    const contextStr = formatContext(m.context_length);
    return {
      name: `${m.id.padEnd(40)} ${contextStr.padEnd(10)} $${promptPrice.toFixed(2)}/1M`,
      value: m.id,
    };
  });

  if (filtered.length > 50) {
    console.log(tui.info(`Showing first 50 of ${filtered.length} matches. Use a more specific search term.`));
    console.log('');
  }

  const selected = await select({
    message: 'Select a model:',
    choices,
    pageSize: 15,
  });

  return selected;
}

function formatContext(contextLength: number): string {
  if (contextLength >= 1000000) {
    return `${(contextLength / 1000000).toFixed(1)}M`;
  } else if (contextLength >= 1000) {
    return `${(contextLength / 1000).toFixed(0)}K`;
  }
  return `${contextLength}`;
}

export async function getModelInfo(modelId: string): Promise<void> {
  console.log(banner('MODEL', {
    font: 'small',
    color: tui.theme.colors.primary,
    subtitle: 'Model Details',
    center: false,
  }));
  
  console.log(tui.info('Fetching model details...'));
  console.log('');
  
  const models = await fetchModels();
  const model = models.find(m => m.id === modelId);
  
  if (!model) {
    console.log(tui.error(`Model "${modelId}" not found.`));
    return;
  }

  const promptPrice = parseFloat(model.pricing.prompt) * 1000000;
  const completionPrice = parseFloat(model.pricing.completion) * 1000000;

  console.log(`  ${tui.theme.colors.primary(tui.theme.symbols.arrowRight)} ${tui.theme.colors.primary(model.id)}`);
  console.log('');
  
  console.log(tui.keyValue([
    { key: 'Name', value: model.name },
    { key: 'Context', value: tui.theme.colors.warning(`${formatContext(model.context_length)} tokens`) },
    { key: 'Prompt', value: tui.theme.colors.success(`$${promptPrice.toFixed(4)} / 1M tokens`) },
    { key: 'Completion', value: tui.theme.colors.success(`$${completionPrice.toFixed(4)} / 1M tokens`) },
  ], 14));
  
  if (model.description) {
    console.log('');
    console.log(tui.theme.text.subtitle('  Description:'));
    // Word wrap description
    const words = model.description.split(' ');
    let line = '  ';
    for (const word of words) {
      if (line.length + word.length > 70) {
        console.log(tui.theme.text.hint(line));
        line = '  ';
      }
      line += word + ' ';
    }
    if (line.trim()) {
      console.log(tui.theme.text.hint(line));
    }
  }
  console.log('');
}
