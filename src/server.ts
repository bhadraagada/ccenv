import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as config from './lib/config.js';
import { listTemplates, getTemplate } from './templates/providers.js';
import { generateShellScript, generateResetScript } from './lib/shell.js';
import { ShellType } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve built web SPA from /web/dist
const webDistPath = path.join(__dirname, '..', 'web', 'dist');
app.use(express.static(webDistPath));

app.get('/api/status', (req: Request, res: Response) => {
  const profiles = config.getProfiles();
  const activeProfile = config.getActiveProfile();
  const profilesList = Object.keys(profiles).map(name => {
    const profile = profiles[name];
    return {
      ...profile,
      apiKey: profile.apiKey ? '********' : undefined
    };
  });
  
  res.json({
    profiles: profilesList,
    activeProfile,
    totalProfiles: profilesList.length
  });
});

app.get('/api/profiles', (req: Request, res: Response) => {
  const profiles = config.getProfiles();
  const profilesList = Object.keys(profiles).map(name => {
    const profile = profiles[name];
    return {
      ...profile,
      apiKey: profile.apiKey ? '********' : undefined
    };
  });
  res.json(profilesList);
});

app.get('/api/profiles/:name', (req: Request, res: Response) => {
  const profile = config.getProfile(req.params.name);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({
    ...profile,
    apiKey: profile.apiKey ? '********' : undefined
  });
});

app.post('/api/profiles', (req: Request, res: Response) => {
  const { name, description, provider, baseUrl, model, apiKey, clearAnthropicKey } = req.body;
  
  if (!name || !baseUrl) {
    return res.status(400).json({ error: 'Name and baseUrl are required' });
  }
  
  if (config.profileExists(name)) {
    return res.status(409).json({ error: 'Profile already exists' });
  }
  
  const profile = {
    name,
    description: description || '',
    provider: provider || 'custom',
    baseUrl,
    model: model || undefined,
    apiKey: apiKey || undefined,
    clearAnthropicKey: clearAnthropicKey ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  config.saveProfile(profile);
  res.json({ success: true, profile: { ...profile, apiKey: profile.apiKey ? '********' : undefined } });
});

app.put('/api/profiles/:name', (req: Request, res: Response) => {
  const profile = config.getProfile(req.params.name);
  
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  const { baseUrl, model, apiKey, description, clearAnthropicKey } = req.body;
  
  if (baseUrl !== undefined) profile.baseUrl = baseUrl;
  if (model !== undefined) profile.model = model;
  if (apiKey !== undefined) profile.apiKey = apiKey;
  if (description !== undefined) profile.description = description;
  if (clearAnthropicKey !== undefined) profile.clearAnthropicKey = clearAnthropicKey;
  
  config.saveProfile(profile);
  res.json({ success: true, profile: { ...profile, apiKey: profile.apiKey ? '********' : undefined } });
});

app.delete('/api/profiles/:name', (req: Request, res: Response) => {
  if (!config.profileExists(req.params.name)) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  config.deleteProfile(req.params.name);
  res.json({ success: true });
});

app.get('/api/templates', (req: Request, res: Response) => {
  res.json(listTemplates());
});

app.post('/api/profiles/:name/activate', (req: Request, res: Response) => {
  const profile = config.getProfile(req.params.name);
  const shell = (req.query.shell as ShellType) || 'bash';
  
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  const script = generateShellScript(profile, shell);
  config.setActiveProfile(req.params.name);
  
  res.json({ script, shell });
});

app.post('/api/reset', (req: Request, res: Response) => {
  const shell = (req.query.shell as ShellType) || 'bash';
  const script = generateResetScript(shell);
  config.setActiveProfile(null);
  
  res.json({ script, shell });
});

app.get('/api/profiles/:name/export', (req: Request, res: Response) => {
  const profile = config.getProfile(req.params.name);
  
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  const exported = { ...profile, apiKey: undefined };
  res.json(exported);
});

app.post('/api/profiles/import', (req: Request, res: Response) => {
  const { name, data } = req.body;
  
  try {
    const imported = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (name) imported.name = name;
    
    if (!imported.name) {
      return res.status(400).json({ error: 'Profile name is required' });
    }
    
    if (config.profileExists(imported.name)) {
      return res.status(409).json({ error: 'Profile already exists' });
    }
    
    imported.createdAt = new Date().toISOString();
    imported.updatedAt = new Date().toISOString();
    
    config.saveProfile(imported);
    res.json({ success: true, profile: { ...imported, apiKey: imported.apiKey ? '********' : undefined } });
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON' });
  }
});

// SPA fallback: for any non-API route, serve index.html from the built web app
app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(webDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🚀 ccenv web UI running at http://localhost:${PORT}\n`);
});
