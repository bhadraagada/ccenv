import { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Copy,
  Download,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import "./App.css";
import "./index.css";
import {
  api,
  type Profile,
  type StatusResponse,
  type Template,
  type ShellType,
} from "./lib/api";
import { ToastProvider, useToast } from "./lib/toast";

const queryClient = new QueryClient();

type Page = "profiles" | "templates" | "settings";

function useStatus() {
  return useQuery<StatusResponse>({
    queryKey: ["status"],
    queryFn: () => api.status(),
  });
}

function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: () => api.templates(),
  });
}

function AppShell() {
  const [page, setPage] = useState<Page>("profiles");
  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useStatus();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col">
        <div className="px-4 py-4 border-b border-border flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600" />
          <div>
            <div className="text-sm font-semibold tracking-wide">ccenv</div>
            <div className="text-xs text-muted-foreground">
              Claude Code env switcher
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
          <button
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-secondary transition ${
              page === "profiles"
                ? "bg-secondary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setPage("profiles")}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Profiles</span>
          </button>
          <button
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-secondary transition ${
              page === "templates"
                ? "bg-secondary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setPage("templates")}
          >
            <ListChecks className="h-4 w-4" />
            <span>Templates</span>
          </button>
          <button
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-secondary transition ${
              page === "settings"
                ? "bg-secondary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setPage("settings")}
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>
        <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
          <div>Profiles: {status?.totalProfiles ?? 0}</div>
          <div>Active: {status?.activeProfile ?? "none"}</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {page === "profiles" && "Profiles"}
              {page === "templates" && "Templates"}
              {page === "settings" && "Settings"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {page === "profiles" &&
                "Manage Claude Code environments and activation commands."}
              {page === "templates" &&
                "Browse provider presets and create profiles from them."}
              {page === "settings" &&
                "View ccenv configuration details and tips."}
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {statusLoading && "Loading status…"}
            {statusError instanceof Error && (
              <span className="text-red-400">{statusError.message}</span>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {page === "profiles" && <ProfilesPage />}
          {page === "templates" && <TemplatesPage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

interface ProfileFormState {
  mode: "create" | "edit" | "duplicate" | null;
  base?: Profile;
}

interface ImportState {
  open: boolean;
}

interface ActivationState {
  profileName: string | null;
  shell: ShellType;
}

function ProfilesPage() {
  const { data, isLoading, error } = useStatus();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [formState, setFormState] = useState<ProfileFormState>({ mode: null });
  const [importState, setImportState] = useState<ImportState>({ open: false });
  const [importJson, setImportJson] = useState("");
  const [importName, setImportName] = useState("");
  const [activation, setActivation] = useState<ActivationState>({
    profileName: null,
    shell: "bash",
  });

  const createProfile = useMutation({
    mutationFn: api.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status"] });
      showToast("Profile created", "success");
      setFormState({ mode: null });
    },
    onError: (e: unknown) => {
      showToast(
        e instanceof Error ? e.message : "Failed to create profile",
        "error"
      );
    },
  });

  const updateProfile = useMutation({
    mutationFn: ({ name, body }: { name: string; body: Partial<Profile> }) =>
      api.updateProfile(name, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status"] });
      showToast("Profile updated", "success");
      setFormState({ mode: null });
    },
    onError: (e: unknown) => {
      showToast(
        e instanceof Error ? e.message : "Failed to update profile",
        "error"
      );
    },
  });

  const deleteProfile = useMutation({
    mutationFn: (name: string) => api.deleteProfile(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status"] });
      showToast("Profile deleted", "success");
    },
    onError: (e: unknown) => {
      showToast(
        e instanceof Error ? e.message : "Failed to delete profile",
        "error"
      );
    },
  });

  const importProfile = useMutation({
    mutationFn: ({ name, data }: { name?: string; data: string }) =>
      api.importProfile({ name, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status"] });
      showToast("Profile imported", "success");
      setImportState({ open: false });
      setImportJson("");
      setImportName("");
    },
    onError: (e: unknown) => {
      showToast(
        e instanceof Error ? e.message : "Failed to import profile",
        "error"
      );
    },
  });

  const exportProfile = async (name: string) => {
    try {
      const profile = await api.exportProfile(name);
      const blob = new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Profile JSON downloaded", "success");
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to export profile",
        "error"
      );
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const lower = search.toLowerCase().trim();
    return data.profiles.filter((p) => {
      if (providerFilter && p.provider !== providerFilter) return false;
      if (!lower) return true;
      return (
        (p.name || "").toLowerCase().includes(lower) ||
        (p.provider || "").toLowerCase().includes(lower) ||
        (p.model || "").toLowerCase().includes(lower) ||
        (p.description || "").toLowerCase().includes(lower)
      );
    });
  }, [data, search, providerFilter]);

  const providers = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.profiles.map((p) => p.provider))).sort();
  }, [data]);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading profiles…</div>
    );
  }
  if (error instanceof Error) {
    return <div className="text-sm text-red-400">{error.message}</div>;
  }

  const openCreate = () => setFormState({ mode: "create", base: undefined });
  const openEdit = (profile: Profile) =>
    setFormState({ mode: "edit", base: profile });
  const openDuplicate = (profile: Profile) =>
    setFormState({ mode: "duplicate", base: profile });

  const handleSubmitForm = (
    values: Omit<Profile, "createdAt" | "updatedAt">
  ) => {
    if (!formState.mode) return;
    if (formState.mode === "create" || formState.mode === "duplicate") {
      createProfile.mutate({ ...values, name: values.name });
    } else if (formState.mode === "edit" && formState.base) {
      const { name, ...rest } = values;
      updateProfile.mutate({ name: formState.base.name, body: rest });
    }
  };

  const handleDelete = (name: string) => {
    // Simple confirm; could be replaced with a nicer dialog later
    if (!window.confirm(`Delete profile "${name}"? This cannot be undone.`))
      return;
    deleteProfile.mutate(name);
  };

  const handleImportSubmit = () => {
    if (!importJson.trim()) {
      showToast("Profile JSON is required", "error");
      return;
    }
    importProfile.mutate({ name: importName || undefined, data: importJson });
  };

  const handleCopyActivationCommand = async (
    profileName: string | null,
    shell: ShellType
  ) => {
    if (!profileName) return;
    const command = buildActivateCommand(profileName, shell);
    try {
      await navigator.clipboard.writeText(command);
      showToast("Activate command copied", "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const activeProfile = data?.activeProfile ?? null;

  if (!data || data.profiles.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">No profiles yet</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs hover:bg-secondary"
            >
              <Plus className="h-3 w-3" /> New profile
            </button>
            <button
              type="button"
              onClick={() => setImportState({ open: true })}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs hover:bg-secondary/70"
            >
              <Upload className="h-3 w-3" /> Import JSON
            </button>
          </div>
        </div>
        <div className="border border-dashed border-border rounded-lg p-6 text-sm text-muted-foreground">
          <div className="font-medium text-foreground mb-1">Get started</div>
          <div>Create a profile here or import one from JSON.</div>
        </div>
        <ProfileFormDialog
          open={!!formState.mode}
          state={formState}
          onClose={() => setFormState({ mode: null })}
          onSubmit={handleSubmitForm}
          isSubmitting={createProfile.isPending || updateProfile.isPending}
        />
        <ImportDialog
          open={importState.open}
          onClose={() => setImportState({ open: false })}
          json={importJson}
          setJson={setImportJson}
          name={importName}
          setName={setImportName}
          isSubmitting={importProfile.isPending}
          onSubmit={handleImportSubmit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, provider, model…"
            className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="h-8 w-40 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setImportState({ open: true })}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs hover:bg-secondary/70"
          >
            <Upload className="h-3 w-3" /> Import
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs hover:bg-secondary"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-sm text-muted-foreground">
          <div className="font-medium text-foreground mb-1">
            No profiles match your filters
          </div>
          <div>Try adjusting the search or provider filter.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.name}
              className="border border-border rounded-lg p-3 text-sm bg-card/60 hover:border-primary/60 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium">{p.name}</div>
                  {activeProfile === p.name && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[11px] text-emerald-200">
                      active
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded-full border border-border text-[11px] text-muted-foreground">
                    {p.provider}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setActivation({
                        profileName: p.name,
                        shell: activation.shell,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-[11px] hover:bg-secondary/70"
                  >
                    <Wand2 className="h-3 w-3" /> Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-[11px] hover:bg-secondary/70"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDuplicate(p)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/30 px-2 py-0.5 text-[11px] hover:bg-secondary/60"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => exportProfile(p.name)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/30 px-2 py-0.5 text-[11px] hover:bg-secondary/60"
                  >
                    <Download className="h-3 w-3" /> Export
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.name)}
                    className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/20 px-2 py-0.5 text-[11px] text-destructive-foreground hover:bg-destructive/40"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
              {p.description && (
                <div className="text-xs text-muted-foreground mb-1.5">
                  {p.description}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-xs">
                <div>
                  <div className="text-muted-foreground">Base URL</div>
                  <div className="truncate" title={p.baseUrl}>
                    {p.baseUrl}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Model</div>
                  <div>
                    {p.model || (
                      <span className="text-muted-foreground">(default)</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">API key</div>
                  <div>{p.apiKey ? "Stored (encrypted)" : "Not set"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProfileFormDialog
        open={!!formState.mode}
        state={formState}
        onClose={() => setFormState({ mode: null })}
        onSubmit={handleSubmitForm}
        isSubmitting={createProfile.isPending || updateProfile.isPending}
      />

      <ImportDialog
        open={importState.open}
        onClose={() => setImportState({ open: false })}
        json={importJson}
        setJson={setImportJson}
        name={importName}
        setName={setImportName}
        isSubmitting={importProfile.isPending}
        onSubmit={handleImportSubmit}
      />

      <ActivationDialog
        open={!!activation.profileName}
        profileName={activation.profileName}
        shell={activation.shell}
        onShellChange={(shell) => setActivation((s) => ({ ...s, shell }))}
        onClose={() => setActivation((s) => ({ ...s, profileName: null }))}
        onCopy={handleCopyActivationCommand}
      />
    </div>
  );
}

interface ProfileFormDialogProps {
  open: boolean;
  state: ProfileFormState;
  onClose: () => void;
  onSubmit: (values: Omit<Profile, "createdAt" | "updatedAt">) => void;
  isSubmitting: boolean;
}

function ProfileFormDialog({
  open,
  state,
  onClose,
  onSubmit,
  isSubmitting,
}: ProfileFormDialogProps) {
  const { data: templates } = useTemplates();
  const base = state.base;

  const [name, setName] = useState(base?.name ?? "");
  const [templateName, setTemplateName] = useState("");
  const [baseUrl, setBaseUrl] = useState(base?.baseUrl ?? "");
  const [model, setModel] = useState(base?.model ?? "");
  const [description, setDescription] = useState(base?.description ?? "");
  const [apiKey, setApiKey] = useState("");
  const [clearAnthropicKey, setClearAnthropicKey] = useState(
    base?.clearAnthropicKey ?? true
  );

  // Reset fields when dialog opens/closes or mode changes
  const mode = state.mode;
  if (!open) {
    return null;
  }

  const title =
    mode === "edit"
      ? "Edit profile"
      : mode === "duplicate"
      ? "Duplicate profile"
      : "New profile";

  const effectiveName =
    mode === "duplicate" && base ? base.name + "-copy" : name;

  const handleApplyTemplate = (value: string) => {
    setTemplateName(value);
    if (!value || !templates) return;
    const t = templates.find((tpl) => tpl.name === value);
    if (!t) return;
    setBaseUrl(t.baseUrl || "");
    setModel(t.defaultModel || "");
    if (!description) setDescription(t.description || "");
    setClearAnthropicKey(t.clearAnthropicKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      mode === "edit" && base ? base.name : effectiveName.trim();

    if (!finalName || !baseUrl.trim()) return;
    if (!/^[a-zA-Z0-9_-]+$/.test(finalName)) return;

    const provider = templateName || base?.provider || "custom";

    onSubmit({
      name: finalName,
      provider,
      baseUrl: baseUrl.trim(),
      model: model.trim() || undefined,
      description: description.trim() || undefined,
      apiKey: apiKey.trim() || base?.apiKey,
      clearAnthropicKey,
      extraEnv: base?.extraEnv,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-background p-4 text-sm shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary/60"
          >
            Esc
          </button>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="space-y-1">
              <label className="block text-xs text-muted-foreground">
                Name
              </label>
              <input
                value={effectiveName}
                onChange={(e) => setName(e.target.value)}
                disabled={mode === "edit"}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                placeholder="short-identifier"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-muted-foreground">
                Template
              </label>
              <select
                value={templateName}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Custom</option>
                {templates?.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-muted-foreground">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-muted-foreground">
              Base URL
            </label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://api.example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-muted-foreground">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              placeholder="Optional, uses provider default when empty"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-muted-foreground">
              API key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              placeholder={
                mode === "edit" && base?.apiKey
                  ? "Leave blank to keep existing"
                  : "Optional"
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border bg-background"
                checked={clearAnthropicKey}
                onChange={(e) => setClearAnthropicKey(e.target.checked)}
              />
              <span>Clear ANTHROPIC_API_KEY when using this profile</span>
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border bg-secondary/40 px-3 py-1 hover:bg-secondary/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-border bg-primary/80 px-3 py-1 text-primary-foreground hover:bg-primary disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  json: string;
  setJson: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function ImportDialog({
  open,
  onClose,
  json,
  setJson,
  name,
  setName,
  isSubmitting,
  onSubmit,
}: ImportDialogProps) {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-background p-4 text-sm shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">Import profile from JSON</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary/60"
          >
            Esc
          </button>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-xs text-muted-foreground">
              Override name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              placeholder="Name to use instead of JSON value"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-muted-foreground">
              Profile JSON
            </label>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
              placeholder="Paste profile JSON here"
            />
          </div>
          <div className="flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-secondary/40 px-3 py-1 hover:bg-secondary/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-primary/80 px-3 py-1 text-primary-foreground hover:bg-primary disabled:opacity-60"
            >
              <Upload className="h-3 w-3" />{" "}
              {isSubmitting ? "Importing…" : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ActivationDialogProps {
  open: boolean;
  profileName: string | null;
  shell: ShellType;
  onShellChange: (shell: ShellType) => void;
  onClose: () => void;
  onCopy: (profileName: string | null, shell: ShellType) => void;
}

function buildActivateCommand(name: string, shell: ShellType): string {
  if (!name) return "";
  switch (shell) {
    case "fish":
      return `ccx use ${name} --shell fish | source`;
    case "powershell":
      return `iex (ccx use ${name} --shell powershell)`;
    case "cmd":
      return `ccx use ${name} --shell cmd`;
    case "bash":
    case "zsh":
    default:
      return `eval "$(ccx use ${name})"`;
  }
}

function ActivationDialog({
  open,
  profileName,
  shell,
  onShellChange,
  onClose,
  onCopy,
}: ActivationDialogProps) {
  if (!open || !profileName) return null;

  const runCommand = `ccx run ${profileName}`;
  const activateCommand = buildActivateCommand(profileName, shell);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-lg border border-border bg-background p-4 text-sm shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-semibold">Activate profile</div>
            <div className="text-xs text-muted-foreground">{profileName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary/60"
          >
            Esc
          </button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Recommended: run Claude Code with this profile</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-xs">
              <span className="flex-1 truncate" title={runCommand}>
                {runCommand}
              </span>
              <button
                type="button"
                onClick={() => onCopy(profileName, shell)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-[11px] hover:bg-secondary/70"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
          </div>

          <div className="space-y-1 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Or export env vars into your shell with ccx use</span>
              <select
                value={shell}
                onChange={(e) => onShellChange(e.target.value as ShellType)}
                className="h-7 rounded-md border border-border bg-background px-2 text-[11px] outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="bash">bash/zsh</option>
                <option value="fish">fish</option>
                <option value="powershell">PowerShell</option>
                <option value="cmd">cmd.exe</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-xs">
              <span className="flex-1 truncate" title={activateCommand}>
                {activateCommand}
              </span>
              <button
                type="button"
                onClick={() => onCopy(profileName, shell)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-[11px] hover:bg-secondary/70"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesPage() {
  const { data, isLoading, error } = useTemplates();
  const { showToast } = useToast();
  const [formState, setFormState] = useState<ProfileFormState>({ mode: null });

  if (isLoading)
    return (
      <div className="text-sm text-muted-foreground">Loading templates…</div>
    );
  if (error instanceof Error)
    return <div className="text-sm text-red-400">{error.message}</div>;
  if (!data) return null;

  const handleCreateFromTemplate = (template: Template) => {
    const base: Profile = {
      name: template.name,
      description: template.description,
      provider: template.name,
      baseUrl: template.baseUrl,
      model: template.defaultModel,
      apiKey: undefined,
      clearAnthropicKey: template.clearAnthropicKey,
      extraEnv: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormState({ mode: "create", base });
  };

  const queryClient = useQueryClient();
  const createProfile = useMutation({
    mutationFn: api.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status"] });
      showToast("Profile created from template", "success");
      setFormState({ mode: null });
    },
    onError: (e: unknown) => {
      showToast(
        e instanceof Error ? e.message : "Failed to create profile",
        "error"
      );
    },
  });

  const handleSubmitForm = (
    values: Omit<Profile, "createdAt" | "updatedAt">
  ) => {
    createProfile.mutate({ ...values, name: values.name });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Templates are presets for common providers. Create profiles from them
        and tweak as needed.
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm">
        {data.map((t) => (
          <div
            key={t.name}
            className="border border-border rounded-lg p-3 bg-card/60 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <div className="font-medium">{t.displayName}</div>
                <div className="text-xs text-muted-foreground">{t.name}</div>
              </div>
              {t.requiresApiKey && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[11px] text-amber-100">
                  API key
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex-1">
              {t.description}
            </div>
            <div className="text-xs">
              <div className="text-muted-foreground">Base URL</div>
              <div className="truncate" title={t.baseUrl}>
                {t.baseUrl || "—"}
              </div>
            </div>
            {t.defaultModel && (
              <div className="mt-1 text-xs">
                <div className="text-muted-foreground">Default model</div>
                <div>{t.defaultModel}</div>
              </div>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleCreateFromTemplate(t)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs hover:bg-secondary"
              >
                <Plus className="h-3 w-3" /> Create profile
              </button>
            </div>
          </div>
        ))}
      </div>
      <ProfileFormDialog
        open={!!formState.mode}
        state={formState}
        onClose={() => setFormState({ mode: null })}
        onSubmit={handleSubmitForm}
        isSubmitting={createProfile.isPending}
      />
    </div>
  );
}

function SettingsPage() {
  const { data: status } = useStatus();

  return (
    <div className="space-y-3 text-sm text-muted-foreground max-w-xl">
      <div className="border border-border rounded-lg p-3 bg-card/60">
        <div className="font-medium text-foreground mb-1">Overview</div>
        <div className="flex gap-6 text-xs">
          <div>
            <div className="text-muted-foreground">Total profiles</div>
            <div className="text-foreground">{status?.totalProfiles ?? 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Active profile</div>
            <div className="text-foreground">
              {status?.activeProfile ?? "none"}
            </div>
          </div>
        </div>
      </div>
      <div className="border border-border rounded-lg p-3 bg-card/60">
        <div className="font-medium text-foreground mb-1">How to use</div>
        <ul className="list-disc list-inside space-y-0.5">
          <li>
            Use{" "}
            <code className="px-1 rounded bg-secondary/60">
              ccx run &lt;profile&gt;
            </code>{" "}
            to launch Claude Code directly with a profile.
          </li>
          <li>
            Or eval the environment script using{" "}
            <code className="px-1 rounded bg-secondary/60">ccx use</code> with
            your shell.
          </li>
          <li>This web UI reads and writes the same config used by the CLI.</li>
        </ul>
      </div>
      <div className="border border-border rounded-lg p-3 bg-card/60">
        <div className="font-medium text-foreground mb-1">
          Config & security
        </div>
        <p>
          Profiles are stored on disk via{" "}
          <code className="px-1 rounded bg-secondary/60">conf</code>, and API
          keys are encrypted with a machine-specific key. The web UI never sends
          keys to any external service – it just talks to the local ccenv
          server.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
