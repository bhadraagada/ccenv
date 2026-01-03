// Interactive setup wizard with hauktui-style TUI
import { select, input, confirm, password } from '@inquirer/prompts';
import { listTemplates, getTemplate } from '../templates/providers.js';
import * as config from '../lib/config.js';
import { Profile } from '../types.js';
import { fetchModels } from './models.js';
import * as tui from '../tui/theme.js';

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
}

function formatContext(contextLength: number): string {
  if (contextLength >= 1000000) return `${(contextLength / 1000000).toFixed(1)}M`;
  if (contextLength >= 1000) return `${(contextLength / 1000).toFixed(0)}K`;
  return `${contextLength}`;
}

async function selectModelInteractive(defaultModel?: string): Promise<string | undefined> {
  // Prefetch models in background
  const modelsPromise = fetchModels();
  
  while (true) {
    const searchOrDefault = await select({
      message: 'How would you like to select a model?',
      choices: [
        { name: `${tui.theme.colors.success('●')} Use default (${tui.theme.colors.warning(defaultModel || 'none')})`, value: 'default' },
        { name: `${tui.theme.colors.primary('◎')} Search models from OpenRouter`, value: 'search' },
        { name: `${tui.theme.colors.secondary('○')} Enter model ID manually`, value: 'manual' },
      ]
    });

    if (searchOrDefault === 'default') {
      return defaultModel;
    }

    if (searchOrDefault === 'manual') {
      const model = await input({
        message: 'Model ID:',
        default: defaultModel
      });
      return model || defaultModel;
    }

    // Search mode
    console.log('');
    console.log(tui.info('Fetching models from OpenRouter...'));
    const models = await modelsPromise;

    if (models.length === 0) {
      console.log(tui.error('Failed to fetch models. Falling back to manual entry.'));
      const model = await input({
        message: 'Model ID:',
        default: defaultModel
      });
      return model || defaultModel;
    }

    // Search loop - allows going back to search again
    while (true) {
      const searchTerm = await input({
        message: `Search models ${tui.theme.text.hint('(e.g. "glm", "minimax", "claude")')}:`,
      });

      let filtered = models as OpenRouterModel[];
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = (models as OpenRouterModel[]).filter(m =>
          m.id.toLowerCase().includes(term) ||
          m.name.toLowerCase().includes(term)
        );
      }

      if (filtered.length === 0) {
        console.log(tui.error(`No models found matching "${searchTerm}". Try another search.`));
        console.log('');
        continue;
      }

      // Sort and limit
      filtered.sort((a, b) => a.id.localeCompare(b.id));
      const limited = filtered.slice(0, 30);

      if (filtered.length > 30) {
        console.log('');
        console.log(tui.info(`Showing first 30 of ${filtered.length} matches.`));
      }

      const choices = [
        { name: `${tui.theme.colors.warning('←')} Back to search`, value: '__back__' },
        { name: `${tui.theme.colors.error('←')} Back to selection method`, value: '__back_menu__' },
        ...limited.map(m => {
          const promptPrice = parseFloat(m.pricing.prompt) * 1000000;
          const ctx = formatContext(m.context_length);
          return {
            name: `  ${m.id.padEnd(38)} ${tui.theme.text.subtitle(ctx.padEnd(8))} ${tui.theme.colors.success(`$${promptPrice.toFixed(2)}/1M`)}`,
            value: m.id
          };
        })
      ];

      const selected = await select({
        message: 'Select a model:',
        choices,
        pageSize: 17
      });

      if (selected === '__back__') {
        continue; // Go back to search
      }
      
      if (selected === '__back_menu__') {
        break; // Go back to main menu
      }

      return selected;
    }
  }
}

export async function runSetupWizard(): Promise<void> {
  console.log('');
  console.log(tui.theme.border.active('╭────────────────────────────────────────────╮'));
  console.log(tui.theme.border.active('│') + tui.theme.text.title('     Claude Env - Profile Setup Wizard     ') + tui.theme.border.active('│'));
  console.log(tui.theme.border.active('╰────────────────────────────────────────────╯'));
  console.log('');
  
  // Get profile name
  const profileName = await input({
    message: `${tui.theme.colors.primary('?')} Profile name:`,
    validate: (value) => {
      if (!value.trim()) return tui.theme.colors.error('Name is required');
      if (config.profileExists(value)) return tui.theme.colors.error('Profile already exists');
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) return tui.theme.colors.error('Only alphanumeric, dash, and underscore allowed');
      return true;
    }
  });
  
  // Select provider template
  const templates = listTemplates();
  const templateChoice = await select({
    message: `${tui.theme.colors.primary('?')} Select a provider:`,
    choices: templates.map(t => ({
      name: `${tui.theme.colors.primary(t.displayName)} ${tui.theme.text.subtitle('- ' + t.description)}`,
      value: t.name
    }))
  });
  
  const template = getTemplate(templateChoice)!;
  
  // Get base URL (use template default or ask for custom)
  let baseUrl = template.baseUrl;
  if (templateChoice === 'custom' || !baseUrl) {
    baseUrl = await input({
      message: `${tui.theme.colors.primary('?')} API Base URL:`,
      validate: (value) => value.trim() ? true : tui.theme.colors.error('URL is required')
    });
  } else {
    const customUrl = await confirm({
      message: `${tui.theme.colors.primary('?')} Use default URL (${tui.theme.colors.warning(template.baseUrl)})?`,
      default: true
    });
    
    if (!customUrl) {
      baseUrl = await input({
        message: `${tui.theme.colors.primary('?')} Custom API Base URL:`,
        default: template.baseUrl
      });
    }
  }
  
  // Get model - with search option for OpenRouter
  let model: string | undefined;
  const isOpenRouter = templateChoice.startsWith('openrouter') || template.baseUrl.includes('openrouter');
  
  if (isOpenRouter) {
    model = await selectModelInteractive(template.defaultModel);
  } else if (template.defaultModel) {
    const useDefaultModel = await confirm({
      message: `${tui.theme.colors.primary('?')} Use default model (${tui.theme.colors.warning(template.defaultModel)})?`,
      default: true
    });
    
    if (!useDefaultModel) {
      model = await input({
        message: `${tui.theme.colors.primary('?')} Model name:`,
        default: template.defaultModel
      });
    } else {
      model = template.defaultModel;
    }
  } else {
    model = await input({
      message: `${tui.theme.colors.primary('?')} Model name (optional):`,
    });
  }
  
  // Get API key if required
  let apiKey: string | undefined;
  if (template.requiresApiKey) {
    if (template.setupInstructions) {
      console.log('');
      console.log(tui.info(template.setupInstructions));
      console.log('');
    }
    
    apiKey = await password({
      message: `${tui.theme.colors.primary('?')} API Key:`,
      mask: '*'
    });
  } else {
    const wantApiKey = await confirm({
      message: `${tui.theme.colors.primary('?')} Add an API key? (optional)`,
      default: false
    });
    
    if (wantApiKey) {
      apiKey = await password({
        message: `${tui.theme.colors.primary('?')} API Key:`,
        mask: '*'
      });
    }
  }
  
  // Description
  const description = await input({
    message: `${tui.theme.colors.primary('?')} Description (optional):`,
    default: template.description
  });
  
  // Clear ANTHROPIC_API_KEY?
  const clearKey = await confirm({
    message: `${tui.theme.colors.primary('?')} Unset ANTHROPIC_API_KEY when using this profile?`,
    default: template.clearAnthropicKey
  });
  
  // Create the profile
  const profile: Profile = {
    name: profileName,
    description,
    provider: template.name,
    baseUrl,
    model: model || undefined,
    apiKey: apiKey || undefined,
    clearAnthropicKey: clearKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  config.saveProfile(profile);
  
  console.log('');
  console.log(tui.success('Profile created successfully!'));
  console.log('');
  console.log(tui.info('To activate this profile, run:'));
  console.log(`   ${tui.theme.colors.primary(`eval "$(ccx use ${profileName})"`)}`);
  console.log('');
}

export async function runQuickSetup(templateName: string): Promise<void> {
  const template = getTemplate(templateName);
  
  if (!template) {
    console.log(tui.error(`Template "${templateName}" not found.`));
    console.log('');
    console.log(tui.info('Available templates:'));
    listTemplates().forEach(t => {
      console.log(`   ${tui.theme.colors.primary(t.name)}`);
    });
    process.exit(1);
  }
  
  console.log('');
  console.log(tui.header(`Quick Setup: ${template.displayName}`));
  
  if (template.setupInstructions) {
    console.log(tui.info(template.setupInstructions));
    console.log('');
  }
  
  const profileName = await input({
    message: `${tui.theme.colors.primary('?')} Profile name:`,
    default: templateName,
    validate: (value) => {
      if (!value.trim()) return tui.theme.colors.error('Name is required');
      if (config.profileExists(value)) return tui.theme.colors.error('Profile already exists');
      return true;
    }
  });

  // Model selection for OpenRouter templates
  let model = template.defaultModel;
  const isOpenRouter = templateName.startsWith('openrouter') || template.baseUrl.includes('openrouter');
  
  if (isOpenRouter) {
    model = await selectModelInteractive(template.defaultModel);
  }

  let apiKey: string | undefined;
  if (template.requiresApiKey) {
    apiKey = await password({
      message: `${tui.theme.colors.primary('?')} API Key:`,
      mask: '*',
      validate: (value) => value.trim() ? true : tui.theme.colors.error('API key is required for this provider')
    });
  }
  
  const profile: Profile = {
    name: profileName,
    description: template.description,
    provider: template.name,
    baseUrl: template.baseUrl,
    model: model,
    apiKey,
    clearAnthropicKey: template.clearAnthropicKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  config.saveProfile(profile);
  
  console.log('');
  console.log(tui.success('Profile created!'));
  console.log('');
  console.log(tui.info('Activate with:'));
  console.log(`   ${tui.theme.colors.primary(`eval "$(ccx use ${profileName})"`)}`);
  console.log('');
}
