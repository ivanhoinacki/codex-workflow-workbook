import { defaultTemplateConfig, type TemplateConfig } from '../state/templateConfigStore';

type TemplateConfigPanelProps = {
  config: TemplateConfig;
  onChange: (config: TemplateConfig) => void;
};

const fields: Array<{
  key: keyof TemplateConfig;
  label: string;
  hint: string;
  help: string;
  section: 'required' | 'defaults';
  reviewDefault?: boolean;
}> = [
  {
    key: 'codexHome',
    label: 'Codex home',
    hint: 'Target folder for the generated Codex files.',
    help: 'Use your local Codex configuration directory. The default is usually ~/.codex.',
    section: 'required',
  },
  {
    key: 'workspacePath',
    label: 'Workspace',
    hint: 'Root directory for Luxury Escapes repositories.',
    help: 'Use the folder where you keep local Luxury Escapes repositories.',
    section: 'required',
  },
  {
    key: 'vaultPath',
    label: 'Vault',
    hint: 'Root directory of your Obsidian vault.',
    help: 'Use the vault folder that should provide reusable local knowledge.',
    section: 'required',
  },
  {
    key: 'datadogMcpCliPath',
    label: 'Datadog CLI',
    hint: 'Command used by datadog-mcp.',
    help: 'Use the binary or wrapper available in your machine. Leave the default only if it exists locally.',
    section: 'required',
  },
  {
    key: 'localLeVaultServerPath',
    label: 'Vault MCP server',
    hint: 'Python script for local-le-vault.',
    help: 'Use the local path to the vault MCP server script after cloning or installing it.',
    section: 'required',
  },
  {
    key: 'mcpAtlassianBinPath',
    label: 'Atlassian MCP',
    hint: 'Binary or command for mcp-atlassian.',
    help: 'Use the local command that starts the Atlassian MCP wrapper.',
    section: 'required',
  },
  {
    key: 'databaseUrl',
    label: 'PostgreSQL URL',
    hint: 'Local value for .mcp-secrets. Do not share it.',
    help: 'Replace USER, PASSWORD, PORT and DATABASE with your local PostgreSQL knowledge base values.',
    section: 'required',
    reviewDefault: true,
  },
  {
    key: 'userName',
    label: 'Name',
    hint: 'Use your full name or the owner label that should appear in generated rules.',
    help: 'Example: Jane Developer. This value identifies who owns or maintains the generated local rules.',
    section: 'required',
    reviewDefault: true,
  },
  {
    key: 'teamName',
    label: 'Team',
    hint: 'Organization or team name.',
    help: 'Use the team name that should appear in generated templates.',
    section: 'required',
  },
  {
    key: 'projectName',
    label: 'Default project',
    hint: 'Use the repository or project name that will receive PROJECT_AGENTS.md.',
    help: 'Examples: www-le-customer, svc-experiences, svc-payments. This should match the local project being configured.',
    section: 'required',
    reviewDefault: true,
  },
  {
    key: 'projectStack',
    label: 'Stack',
    hint: 'Primary project stack.',
    help: 'Use the main stack for the project, for example TypeScript, Node.js, React, Java, or Kotlin.',
    section: 'defaults',
  },
  {
    key: 'installCommand',
    label: 'Install',
    hint: 'Default install command.',
    help: 'Use the command normally required before running the project locally.',
    section: 'defaults',
  },
  {
    key: 'testCommand',
    label: 'Test',
    hint: 'Default test command.',
    help: 'Use the normal test command for the project.',
    section: 'defaults',
  },
  {
    key: 'lintCommand',
    label: 'Lint',
    hint: 'Default lint command.',
    help: 'Use the lint command that should run before finishing changes.',
    section: 'defaults',
  },
  {
    key: 'buildCommand',
    label: 'Build',
    hint: 'Default build command.',
    help: 'Use the build command that validates the project can compile or bundle.',
    section: 'defaults',
  },
  {
    key: 'validationCommand',
    label: 'Validation',
    hint: 'Minimum command before completion.',
    help: 'Use the minimum command sequence Codex should run before saying work is complete.',
    section: 'defaults',
  },
];

const fieldSections = [
  {
    key: 'required',
    title: 'Required local values',
    description: 'Review these before downloading templates because they depend on your machine.',
  },
  {
    key: 'defaults',
    title: 'Project defaults',
    description: 'Adjust only when your project uses different commands or stack defaults.',
  },
] as const;

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

      {fieldSections.map((section) => (
        <div className="template-config__section" key={section.key}>
          <div className="template-config__section-header">
            <strong>{section.title}</strong>
            <p>{section.description}</p>
          </div>

          <div className="template-config__grid">
            {fields
              .filter((field) => field.section === section.key)
              .map((field) => {
                const shouldReview =
                  Boolean(field.reviewDefault) && config[field.key] === defaultTemplateConfig[field.key];

                return (
                  <label
                    className={`template-config__field${
                      shouldReview ? ' template-config__field--review' : ''
                    }`}
                    key={field.key}
                  >
                    <span className="template-config__label">
                      <span>{field.label}</span>
                      <span className="template-config__help" data-tooltip={field.help} tabIndex={0}>
                        ?
                      </span>
                      {shouldReview ? <em>Needs value</em> : null}
                    </span>
                    <input
                      value={config[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                      spellCheck={false}
                    />
                    <small>{field.hint}</small>
                  </label>
                );
              })}
          </div>
        </div>
      ))}
    </section>
  );
};
