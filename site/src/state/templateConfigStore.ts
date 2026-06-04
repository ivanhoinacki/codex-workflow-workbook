export type TemplateConfig = {
  codexHome: string;
  workspacePath: string;
  vaultPath: string;
  datadogMcpCliPath: string;
  localLeVaultServerPath: string;
  mcpAtlassianBinPath: string;
  databaseUrl: string;
  userName: string;
  teamName: string;
  projectName: string;
  projectStack: string;
  installCommand: string;
  testCommand: string;
  lintCommand: string;
  buildCommand: string;
  validationCommand: string;
};

const STORAGE_KEY = 'codex-workflow-template-config';

export const defaultTemplateConfig: TemplateConfig = {
  codexHome: '~/.codex',
  workspacePath: '~/workspace/luxury-escapes',
  vaultPath: '~/workspace/obsidian-vault',
  datadogMcpCliPath: '~/bin/datadog_mcp_cli',
  localLeVaultServerPath: '/path/to/source-package/local-ai/vault/vault_mcp_server.py',
  mcpAtlassianBinPath: '~/bin/mcp-atlassian',
  databaseUrl: 'postgresql://USER:PASSWORD@localhost:PORT/DATABASE',
  userName: 'First Last',
  teamName: 'Luxury Escapes Engineering',
  projectName: 'repository-or-project-name',
  projectStack: 'TypeScript / Node.js',
  installCommand: 'yarn install --frozen-lockfile',
  testCommand: 'yarn test',
  lintCommand: 'yarn lint',
  buildCommand: 'yarn build',
  validationCommand: 'yarn lint && yarn test',
};

export const loadTemplateConfig = (): TemplateConfig => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultTemplateConfig;
    }

    return { ...defaultTemplateConfig, ...JSON.parse(raw) };
  } catch {
    return defaultTemplateConfig;
  }
};

export const saveTemplateConfig = (config: TemplateConfig) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const applyTemplateConfig = (source: string, config: TemplateConfig) => {
  const codexHome = config.codexHome.trim() || defaultTemplateConfig.codexHome;
  const workspacePath = config.workspacePath.trim() || defaultTemplateConfig.workspacePath;
  const vaultPath = config.vaultPath.trim() || defaultTemplateConfig.vaultPath;

  const replacements: Array<[string | RegExp, string]> = [
    [/\/ABSOLUTE\/PATH\/TO\/OBSIDIAN_VAULT/g, vaultPath],
    [/ABSOLUTE\/PATH\/TO\/OBSIDIAN_VAULT/g, vaultPath],
    [/ABSOLUTE\/PATH\/TO\/\.codex/g, codexHome],
    [/ABSOLUTE\/PATH\/TO/g, codexHome.replace(/\/\.codex$/, '')],
    [/YOUR_WORKSPACE_PATH/g, workspacePath],
    [/YOUR_VAULT_PATH/g, vaultPath],
    [/YOUR_NAME/g, config.userName.trim() || defaultTemplateConfig.userName],
    [/YOUR_ORG_OR_TEAM/g, config.teamName.trim() || defaultTemplateConfig.teamName],
    [/YOUR_TEAM/g, config.teamName.trim() || defaultTemplateConfig.teamName],
    [/YOUR_PROJECT_NAME/g, config.projectName.trim() || defaultTemplateConfig.projectName],
    [/YOUR_STACK/g, config.projectStack.trim() || defaultTemplateConfig.projectStack],
    [/YOUR_INSTALL_COMMAND/g, config.installCommand.trim() || defaultTemplateConfig.installCommand],
    [/YOUR_TEST_COMMAND/g, config.testCommand.trim() || defaultTemplateConfig.testCommand],
    [/YOUR_LINT_COMMAND/g, config.lintCommand.trim() || defaultTemplateConfig.lintCommand],
    [/YOUR_BUILD_COMMAND/g, config.buildCommand.trim() || defaultTemplateConfig.buildCommand],
    [/YOUR_VALIDATION_COMMAND/g, config.validationCommand.trim() || defaultTemplateConfig.validationCommand],
    [/DATADOG_MCP_CLI_PATH/g, config.datadogMcpCliPath.trim() || defaultTemplateConfig.datadogMcpCliPath],
    [/DATADOG_MCP_CLI="[^"]*"/g, `DATADOG_MCP_CLI="${config.datadogMcpCliPath.trim() || defaultTemplateConfig.datadogMcpCliPath}"`],
    [/LOCAL_LE_VAULT_SERVER="[^"]*"/g, `LOCAL_LE_VAULT_SERVER="${config.localLeVaultServerPath.trim() || defaultTemplateConfig.localLeVaultServerPath}"`],
    [/MCP_ATLASSIAN_BIN="[^"]*"/g, `MCP_ATLASSIAN_BIN="${config.mcpAtlassianBinPath.trim() || defaultTemplateConfig.mcpAtlassianBinPath}"`],
    [/DATABASE_URL="[^"]*"/g, `DATABASE_URL="${config.databaseUrl.trim() || defaultTemplateConfig.databaseUrl}"`],
  ];

  return replacements.reduce((text, [pattern, value]) => text.replace(pattern, value), source);
};
