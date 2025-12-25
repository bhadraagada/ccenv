export interface Profile {
  name: string
  description?: string
  provider: string
  baseUrl: string
  model?: string
  apiKey?: string
  clearAnthropicKey: boolean
  extraEnv?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface StatusResponse {
  profiles: Profile[]
  activeProfile: string | null
  totalProfiles: number
}

export interface Template {
  name: string
  displayName: string
  description: string
  baseUrl: string
  defaultModel?: string
  requiresApiKey: boolean
  clearAnthropicKey: boolean
  setupInstructions?: string
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return (await res.json()) as T
}

export type ShellType = 'bash' | 'zsh' | 'fish' | 'powershell' | 'cmd'

interface ProfileEnvelope {
  success: boolean
  profile: Profile
}

export const api = {
  status: () => request<StatusResponse>('/api/status'),
  templates: () => request<Template[]>('/api/templates'),
  getProfile: (name: string) => request<Profile>(`/api/profiles/${encodeURIComponent(name)}`),
  createProfile: (body: Partial<Profile> & { name: string }) =>
    request<ProfileEnvelope>('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.profile),
  updateProfile: (name: string, body: Partial<Profile>) =>
    request<ProfileEnvelope>(`/api/profiles/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.profile),
  deleteProfile: (name: string) =>
    request<{ success: boolean }>(`/api/profiles/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),
  exportProfile: (name: string) => request<Profile>(`/api/profiles/${encodeURIComponent(name)}/export`),
  importProfile: (payload: { name?: string; data: string }) =>
    request<ProfileEnvelope>('/api/profiles/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.profile),
  activateProfile: (name: string, shell?: ShellType) => {
    const query = shell ? `?shell=${encodeURIComponent(shell)}` : ''
    return request<{ script: string; shell: ShellType }>(
      `/api/profiles/${encodeURIComponent(name)}/activate${query}`,
      {
        method: 'POST',
      },
    )
  },
  reset: (shell?: ShellType) => {
    const query = shell ? `?shell=${encodeURIComponent(shell)}` : ''
    return request<{ script: string; shell: ShellType }>(`/api/reset${query}`, {
      method: 'POST',
    })
  },
}
