import type { TemplateConfig } from '../state/templateConfigStore';

type TemplateConfigPanelProps = {
  config: TemplateConfig;
  onChange: (config: TemplateConfig) => void;
};

const fields: Array<{ key: keyof TemplateConfig; label: string; hint: string }> = [
  { key: 'codexHome', label: 'Codex home', hint: 'Where files will be copied.' },
  { key: 'workspacePath', label: 'Workspace', hint: 'Root directory for Luxury Escapes repositories.' },
  { key: 'vaultPath', label: 'Vault', hint: 'Root directory of the Obsidian vault.' },
  { key: 'datadogMcpCliPath', label: 'Datadog CLI', hint: 'Binary used by datadog-mcp.' },
  { key: 'localLeVaultServerPath', label: 'Vault MCP server', hint: 'Python script for local-le-vault.' },
  { key: 'mcpAtlassianBinPath', label: 'Atlassian MCP', hint: 'Binary or command for mcp-atlassian.' },
  { key: 'databaseUrl', label: 'PostgreSQL URL', hint: 'Local value for .mcp-secrets, do not share it.' },
  { key: 'userName', label: 'Name', hint: 'Used in rules templates.' },
  { key: 'teamName', label: 'Team', hint: 'Organization or team.' },
  { key: 'projectName', label: 'Default project', hint: 'Name usado no PROJECT_AGENTS.md.' },
  { key: 'projectStack', label: 'Stack', hint: 'Primary project stack.' },
  { key: 'installCommand', label: 'Install', hint: 'Default install command.' },
  { key: 'testCommand', label: 'Test', hint: 'Default test command.' },
  { key: 'lintCommand', label: 'Lint', hint: 'Default lint command.' },
  { key: 'buildCommand', label: 'Build', hint: 'Default build command.' },
  { key: 'validationCommand', label: 'Validation', hint: 'Minimum command before completion.' },
];

export const TemplateConfigPanel = ({ config, onChange }: TemplateConfigPanelProps) => {
  const update = (key: keyof TemplateConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <section className="template-config" aria-label="Template configuration">
      <div className="template-config__header">
        <span>Configuration step</span>
        <strong>Fill this once to download ready-to-use templates</strong>
        <p>
          These values stay only in your browser. Downloads replace template placeholders before
          saving the file.
        </p>
      </div>

      <div className="template-config__grid">
        {fields.map((field) => (
          <label className="template-config__field" key={field.key}>
            <span>{field.label}</span>
            <input
              value={config[field.key]}
              onChange={(event) => update(field.key, event.target.value)}
              spellCheck={false}
            />
            <small>{field.hint}</small>
          </label>
        ))}
      </div>
    </section>
  );
};
