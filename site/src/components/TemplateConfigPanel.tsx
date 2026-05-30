import type { TemplateConfig } from '../state/templateConfigStore';

type TemplateConfigPanelProps = {
  config: TemplateConfig;
  onChange: (config: TemplateConfig) => void;
};

const fields: Array<{ key: keyof TemplateConfig; label: string; hint: string }> = [
  { key: 'codexHome', label: 'Codex home', hint: 'Onde os arquivos serão copiados.' },
  { key: 'workspacePath', label: 'Workspace', hint: 'Diretório raiz dos repos Luxury Escapes.' },
  { key: 'vaultPath', label: 'Vault', hint: 'Diretório raiz do Obsidian vault.' },
  { key: 'datadogMcpCliPath', label: 'Datadog CLI', hint: 'Binário usado pelo datadog-mcp.' },
  { key: 'localLeVaultServerPath', label: 'Vault MCP server', hint: 'Script Python do local-le-vault.' },
  { key: 'mcpAtlassianBinPath', label: 'Atlassian MCP', hint: 'Binário ou comando do mcp-atlassian.' },
  { key: 'databaseUrl', label: 'PostgreSQL URL', hint: 'Valor local para .mcp-secrets, não compartilhe.' },
  { key: 'userName', label: 'Nome', hint: 'Usado nos templates de rules.' },
  { key: 'teamName', label: 'Time', hint: 'Organização ou time.' },
  { key: 'projectName', label: 'Projeto padrão', hint: 'Nome usado no PROJECT_AGENTS.md.' },
  { key: 'projectStack', label: 'Stack', hint: 'Stack principal do projeto.' },
  { key: 'installCommand', label: 'Install', hint: 'Comando padrão de instalação.' },
  { key: 'testCommand', label: 'Test', hint: 'Comando padrão de teste.' },
  { key: 'lintCommand', label: 'Lint', hint: 'Comando padrão de lint.' },
  { key: 'buildCommand', label: 'Build', hint: 'Comando padrão de build.' },
  { key: 'validationCommand', label: 'Validation', hint: 'Comando mínimo antes de concluir.' },
];

export const TemplateConfigPanel = ({ config, onChange }: TemplateConfigPanelProps) => {
  const update = (key: keyof TemplateConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <section className="template-config" aria-label="Configuração dos templates">
      <div className="template-config__header">
        <span>Step de configuração</span>
        <strong>Preencha uma vez para baixar templates prontos</strong>
        <p>
          Estes valores ficam apenas no seu navegador. Os downloads substituem placeholders dos templates antes de
          salvar o arquivo.
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
