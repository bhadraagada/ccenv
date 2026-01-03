// Profile management commands with hauktui-style TUI
import * as config from '../lib/config.js';
import { generateShellScript, generateResetScript, detectShell, generateEnvVars } from '../lib/shell.js';
import { getTemplate, listTemplates } from '../templates/providers.js';
import { Profile, ShellType } from '../types.js';
import { spawn } from 'child_process';
import * as tui from '../tui/theme.js';

export function listProfiles(): void {
  const profiles = config.getProfiles();
  const activeProfile = config.getActiveProfile();
  const profileNames = Object.keys(profiles);
  
  if (profileNames.length === 0) {
    console.log(tui.header('No Profiles', 'Get started by creating your first profile'));
    console.log(tui.info('Create one with:'));
    console.log(`   ${tui.theme.colors.primary('ccx create <name> --template openrouter')}`);
    console.log('');
    console.log(tui.info('Or run the setup wizard:'));
    console.log(`   ${tui.theme.colors.primary('ccx setup')}`);
    console.log('');
    return;
  }
  
  console.log(tui.header('Profiles', `${profileNames.length} configured`));
  
  for (const name of profileNames.sort()) {
    const profile = profiles[name];
    const isActive = name === activeProfile;
    
    const statusBadge = isActive ? tui.badge('ACTIVE', 'success') : '';
    const nameColor = isActive ? tui.theme.colors.success : tui.theme.colors.primary;
    
    console.log(`  ${nameColor(tui.theme.symbols.arrowRight)} ${nameColor(name)} ${statusBadge}`);
    console.log(`    ${tui.theme.text.subtitle(`Provider: ${profile.provider}`)}`);
    if (profile.model) {
      console.log(`    ${tui.theme.text.subtitle(`Model: ${tui.theme.colors.warning(profile.model)}`)}`);
    }
    console.log('');
  }
}

export function showProfile(name: string): void {
  const profile = config.getProfile(name);
  
  if (!profile) {
    console.log(tui.error(`Profile "${name}" not found.`));
    process.exit(1);
  }
  
  const activeProfile = config.getActiveProfile();
  const isActive = name === activeProfile;
  
  console.log(tui.header(
    `Profile: ${profile.name}`,
    isActive ? 'Currently active' : undefined
  ));
  
  const items = [
    { key: 'Provider', value: profile.provider },
    { key: 'Base URL', value: profile.baseUrl },
    { key: 'Model', value: profile.model || tui.theme.text.subtitle('(default)') },
    { key: 'API Key', value: profile.apiKey ? tui.theme.colors.success('********') : tui.theme.text.subtitle('(not set)') },
    { key: 'Clear Key', value: profile.clearAnthropicKey ? 'Yes' : 'No' },
  ];
  
  if (profile.description) {
    items.push({ key: 'Description', value: profile.description });
  }
  
  items.push(
    { key: 'Created', value: tui.theme.text.subtitle(profile.createdAt) },
    { key: 'Updated', value: tui.theme.text.subtitle(profile.updatedAt) }
  );
  
  console.log(tui.keyValue(items, 14));
  console.log('');
}

export function createProfile(
  name: string, 
  options: {
    template?: string;
    baseUrl?: string;
    model?: string;
    apiKey?: string;
    description?: string;
    clearKey?: boolean;
  }
): void {
  if (config.profileExists(name)) {
    console.log(tui.error(`Profile "${name}" already exists. Use 'ccx edit ${name}' to modify it.`));
    process.exit(1);
  }
  
  let profile: Profile;
  
  if (options.template) {
    const template = getTemplate(options.template);
    if (!template) {
      console.log(tui.error(`Template "${options.template}" not found.`));
      console.log('');
      console.log(tui.info('Available templates:'));
      listTemplates().forEach(t => {
        console.log(`   ${tui.theme.colors.primary(t.name)}: ${t.description}`);
      });
      process.exit(1);
    }
    
    profile = {
      name,
      description: options.description || template.description,
      provider: template.name,
      baseUrl: options.baseUrl || template.baseUrl,
      model: options.model || template.defaultModel,
      apiKey: options.apiKey,
      clearAnthropicKey: options.clearKey ?? template.clearAnthropicKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (template.requiresApiKey && !options.apiKey) {
      console.log('');
      console.log(tui.info('This template requires an API key.'));
      if (template.setupInstructions) {
        console.log(tui.info(template.setupInstructions));
      }
      console.log(`   ${tui.theme.colors.primary(`ccx edit ${name} --api-key YOUR_KEY`)}`);
    }
  } else {
    if (!options.baseUrl) {
      console.log(tui.error('Either --template or --base-url is required.'));
      process.exit(1);
    }
    
    profile = {
      name,
      description: options.description,
      provider: 'custom',
      baseUrl: options.baseUrl,
      model: options.model,
      apiKey: options.apiKey,
      clearAnthropicKey: options.clearKey ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  config.saveProfile(profile);
  
  console.log('');
  console.log(tui.success(`Profile "${name}" created successfully.`));
  console.log('');
  console.log(tui.info('Activate it with:'));
  console.log(`   ${tui.theme.colors.primary(`eval "$(ccx use ${name})"`)}`);
  console.log('');
}

export function editProfile(
  name: string,
  options: {
    baseUrl?: string;
    model?: string;
    apiKey?: string;
    description?: string;
    clearKey?: boolean;
  }
): void {
  const profile = config.getProfile(name);
  
  if (!profile) {
    console.log(tui.error(`Profile "${name}" not found.`));
    process.exit(1);
  }
  
  if (options.baseUrl !== undefined) profile.baseUrl = options.baseUrl;
  if (options.model !== undefined) profile.model = options.model;
  if (options.apiKey !== undefined) profile.apiKey = options.apiKey;
  if (options.description !== undefined) profile.description = options.description;
  if (options.clearKey !== undefined) profile.clearAnthropicKey = options.clearKey;
  
  config.saveProfile(profile);
  console.log(tui.success(`Profile "${name}" updated successfully.`));
}

export function deleteProfileCommand(name: string, force: boolean = false): void {
  if (!config.profileExists(name)) {
    console.log(tui.error(`Profile "${name}" not found.`));
    process.exit(1);
  }
  
  if (!force) {
    console.log(tui.info(`To confirm deletion, run:`));
    console.log(`   ${tui.theme.colors.warning(`ccx delete ${name} --force`)}`);
    return;
  }
  
  config.deleteProfile(name);
  console.log(tui.success(`Profile "${name}" deleted.`));
}

export function useProfile(name: string, shell?: ShellType): void {
  const profile = config.getProfile(name);
  
  if (!profile) {
    console.error(`Profile "${name}" not found.`);
    process.exit(1);
  }
  
  const detectedShell = shell || detectShell();
  const script = generateShellScript(profile, detectedShell);
  
  // Output the script for eval
  console.log(script);
  
  // Update active profile in config
  config.setActiveProfile(name);
}

export function resetEnvironment(shell?: ShellType): void {
  const detectedShell = shell || detectShell();
  const script = generateResetScript(detectedShell);
  
  console.log(script);
  config.setActiveProfile(null);
}

export function showCurrent(): void {
  const activeProfile = config.getActiveProfile();
  const envProfile = process.env.CCX_ACTIVE_PROFILE;
  
  console.log(tui.header('Current Status'));
  
  const configStatus = activeProfile 
    ? tui.theme.colors.success(activeProfile) 
    : tui.theme.text.subtitle('(none)');
  const shellStatus = envProfile 
    ? tui.theme.colors.success(envProfile) 
    : tui.theme.text.subtitle('(none)');
    
  console.log(tui.keyValue([
    { key: 'Config active', value: configStatus },
    { key: 'Shell active', value: shellStatus },
  ], 16));
  
  console.log('');
  console.log(tui.theme.text.title('  Environment Variables'));
  console.log('');
  
  const envItems = [
    { key: 'ANTHROPIC_BASE_URL', value: process.env.ANTHROPIC_BASE_URL || tui.theme.text.subtitle('(not set)') },
    { key: 'ANTHROPIC_AUTH_TOKEN', value: process.env.ANTHROPIC_AUTH_TOKEN ? tui.theme.colors.success('********') : tui.theme.text.subtitle('(not set)') },
    { key: 'ANTHROPIC_MODEL', value: process.env.ANTHROPIC_MODEL ? tui.theme.colors.warning(process.env.ANTHROPIC_MODEL) : tui.theme.text.subtitle('(not set)') },
    { key: 'ANTHROPIC_API_KEY', value: process.env.ANTHROPIC_API_KEY ? tui.theme.colors.success('********') : tui.theme.text.subtitle('(not set)') },
  ];
  
  console.log(tui.keyValue(envItems, 22));
  console.log('');
}

export function showTemplates(): void {
  console.log(tui.header('Provider Templates', 'Pre-configured AI providers'));
  
  for (const template of listTemplates()) {
    console.log(`  ${tui.theme.colors.primary(tui.theme.symbols.arrowRight)} ${tui.theme.colors.primary(template.name)}`);
    console.log(`    ${template.displayName}`);
    console.log(`    ${tui.theme.text.subtitle(template.description)}`);
    if (template.defaultModel) {
      console.log(`    ${tui.theme.text.subtitle('Default model:')} ${tui.theme.colors.warning(template.defaultModel)}`);
    }
    console.log('');
  }
  
  console.log(tui.info('Usage:'));
  console.log(`   ${tui.theme.colors.primary('ccx create <name> --template <template-name>')}`);
  console.log('');
}

export function exportProfile(name: string): void {
  const profile = config.getProfile(name);
  
  if (!profile) {
    console.log(tui.error(`Profile "${name}" not found.`));
    process.exit(1);
  }
  
  // Export without the API key for safety
  const exported = { ...profile, apiKey: undefined };
  console.log(JSON.stringify(exported, null, 2));
}

export function importProfile(jsonStr: string, name?: string): void {
  try {
    const imported = JSON.parse(jsonStr) as Profile;
    
    if (name) {
      imported.name = name;
    }
    
    if (!imported.name) {
      console.log(tui.error('Profile name is required. Use --name flag or include "name" in JSON.'));
      process.exit(1);
    }
    
    if (config.profileExists(imported.name)) {
      console.log(tui.error(`Profile "${imported.name}" already exists.`));
      process.exit(1);
    }
    
    imported.createdAt = new Date().toISOString();
    imported.updatedAt = new Date().toISOString();
    
    config.saveProfile(imported);
    console.log(tui.success(`Profile "${imported.name}" imported successfully.`));
    
    if (!imported.apiKey) {
      console.log(tui.info(`No API key was imported. Add one with:`));
      console.log(`   ${tui.theme.colors.primary(`ccx edit ${imported.name} --api-key YOUR_KEY`)}`);
    }
  } catch (e) {
    console.log(tui.error(`Invalid JSON: ${e}`));
    process.exit(1);
  }
}

// Run Claude directly with a profile's environment
export async function runWithProfile(name: string): Promise<void> {
  const profile = config.getProfile(name);
  
  if (!profile) {
    console.log(tui.error(`Profile "${name}" not found.`));
    process.exit(1);
  }
  
  const env = generateEnvVars(profile);
  const childEnv: Record<string, string> = { ...process.env } as Record<string, string>;
  
  // Set the environment variables
  for (const [key, value] of Object.entries(env)) {
    if (value === '') {
      delete childEnv[key];
    } else if (value !== undefined) {
      childEnv[key] = value;
    }
  }
  childEnv['CCX_ACTIVE_PROFILE'] = name;
  
  // Update active profile in config
  config.setActiveProfile(name);
  
  console.log(tui.header('Launching Claude', `Profile: ${name}`));
  console.log(tui.keyValue([
    { key: 'Model', value: profile.model ? tui.theme.colors.warning(profile.model) : '(default)' },
    { key: 'Provider', value: profile.provider },
  ], 12));
  console.log('');
  
  // Spawn claude with the modified environment
  const child = spawn('claude', [], {
    env: childEnv,
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

// Run Claude with reset environment (official)
export async function runReset(): Promise<void> {
  const childEnv: Record<string, string> = { ...process.env } as Record<string, string>;
  
  // Remove ccx-related env vars
  delete childEnv['ANTHROPIC_BASE_URL'];
  delete childEnv['ANTHROPIC_AUTH_TOKEN'];
  delete childEnv['ANTHROPIC_MODEL'];
  delete childEnv['CCX_ACTIVE_PROFILE'];
  
  config.setActiveProfile(null);
  
  console.log(tui.header('Launching Claude', 'Default settings'));
  console.log('');
  
  const child = spawn('claude', [], {
    env: childEnv,
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    process.exit(code || 0);
  });
}
