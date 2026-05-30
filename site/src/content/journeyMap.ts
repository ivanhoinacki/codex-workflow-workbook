import type { Checkpoint, Question } from './types';

export type PageDefinition = {
  id: string;
  title: string;
  sourcePath: string;
  track: string[];
  checkpoints: Checkpoint[];
  questions: Question[];
};

export type ChapterDefinition = {
  id: string;
  title: string;
  description: string;
  pages: PageDefinition[];
};

export type JourneyDefinition = {
  id: string;
  title: string;
  description: string;
  track: string[];
  chapters: ChapterDefinition[];
};

const page = (
  id: string,
  title: string,
  sourcePath: string,
  checkpoint: string,
  question: Question,
  track: string[],
): PageDefinition => ({
  id,
  title,
  sourcePath,
  track,
  checkpoints: [{ id: `${id}-checkpoint`, label: checkpoint, required: true }],
  questions: [question],
});

const choice = (
  id: string,
  prompt: string,
  options: string[],
  answer: string,
  feedback: string,
): Question => ({
  id,
  type: 'single-choice',
  prompt,
  options,
  answer,
  required: true,
  feedback,
});

export const journeyDefinitions: JourneyDefinition[] = [
  {
    id: 'foundations',
    title: 'Fundamentos',
    description: 'Propósito, camadas, sequência principal e limites operacionais.',
    track: ['Concepts', 'Workflow'],
    chapters: [
      {
        id: 'purpose-system-shape',
        title: 'Propósito e Forma do Sistema',
        description: 'Entenda o problema resolvido antes de configurar a máquina local.',
        pages: [
          page(
            'purpose',
            'Propósito',
            '01-purpose.md',
            'Consigo explicar, com minhas palavras, por que contexto, guardrails, memória e validação são responsabilidades separadas.',
            choice(
              'purpose-why',
              'Qual problema o ecossistema resolve além de usar uma IA no chat?',
              ['Criar respostas mais longas', 'Transformar trabalho real em um workflow previsível', 'Substituir testes locais'],
              'Transformar trabalho real em um workflow previsível',
              'O foco é previsibilidade, contexto, guardrails, validação e memória durável.',
            ),
            ['Concepts'],
          ),
          page(
            'ecosystem-layers',
            'Camadas do Ecossistema',
            '02-ecosystem-layers.md',
            'Consigo apontar qual camada cuida de instruções, ferramentas, memória e conhecimento reutilizável.',
            choice(
              'layers-runtime',
              'Qual camada é responsável por hooks e MCPs?',
              ['Runtime and tooling', 'Markdown content', 'GitHub Pages'],
              'Runtime and tooling',
              'Hooks and MCPs are runtime capabilities. They make rules and context operational.',
            ),
            ['Architecture'],
          ),
          page(
            'main-sequence',
            'Sequência Principal',
            '03-main-sequence.md',
            'Consigo ordenar o caminho entre pedido, contexto, evidência, validação e memória reutilizável.',
            choice(
              'sequence-first-step',
              'Qual é a primeira ação esperada antes de uma mudança relevante em trabalho LE?',
              ['Consultar contexto local relevante', 'Abrir PR', 'Pular direto para implementação'],
              'Consultar contexto local relevante',
              'O fluxo começa por contexto e evidência, não por edição imediata.',
            ),
            ['Workflow'],
          ),
          page(
            'workflow-boundaries',
            'Limites do Workflow',
            '04-workflow-boundaries.md',
            'Consigo separar ações locais seguras de efeitos externos ou destrutivos.',
            choice(
              'boundaries-approval',
              'Qual tipo de ação exige aprovação explícita?',
              ['Ler Markdown local', 'Rodar rg', 'Push, PR, Slack ou operação destrutiva'],
              'Push, PR, Slack ou operação destrutiva',
              'Efeitos externos e destrutivos precisam de aprovação clara.',
            ),
            ['Workflow', 'Safety'],
          ),
        ],
      },
    ],
  },
  {
    id: 'local-configuration',
    title: 'Configuração Local',
    description: 'Configuração do runtime, rules, agents, hooks, MCPs e skills.',
    track: ['Config', 'Automation'],
    chapters: [
      {
        id: 'environment-setup',
        title: 'Preparação do Ambiente',
        description: 'Terminal, Codex CLI e base mínima antes de copiar templates.',
        pages: [
          page(
            'terminal-codex-cli',
            'Terminal e Codex CLI',
            '00-terminal-and-codex-cli.md',
            'Consigo validar que terminal, Codex CLI e diretório local de configuração estão prontos.',
            choice(
              'terminal-cli-ready',
              'Qual é o objetivo desta etapa inicial?',
              [
                'Instalar todos os MCPs antes de abrir o Codex',
                'Configurar todos os hooks imediatamente',
                'Preparar terminal, Codex CLI e diretório ~/.codex',
              ],
              'Preparar terminal, Codex CLI e diretório ~/.codex',
              'Antes dos templates avançados, a pessoa precisa conseguir abrir o Codex e validar a base local.',
            ),
            ['Setup', 'CLI'],
          ),
          page(
            'environment-prerequisites',
            'Requisitos do Ambiente',
            '00-environment-prerequisites.md',
            'Consigo diferenciar o que preciso agora do que será configurado depois pelos templates.',
            choice(
              'prerequisites-before-config',
              'O que a pessoa precisa ter antes de copiar os modelos de configuração?',
              [
                'Base local mínima, acesso ao workbook e clareza dos próximos passos',
                'Todos os hooks já instalados',
                'PostgreSQL e MCPs obrigatoriamente em execução',
              ],
              'Base local mínima, acesso ao workbook e clareza dos próximos passos',
              'Hooks, skills, MCPs, vault e PostgreSQL serão montados nas etapas seguintes, a partir dos modelos do workbook.',
            ),
            ['Setup', 'Concepts'],
          ),
          page(
            'template-variables',
            'Variáveis dos Templates',
            '00-template-variables.md',
            'Preenchi os valores locais que serão usados para gerar downloads de templates sem placeholders.',
            choice(
              'template-variables-purpose',
              'Por que este step existe antes dos downloads?',
              [
                'Para salvar tokens no repositório',
                'Para substituir placeholders dos templates com valores da própria máquina',
                'Para pular a configuração do Codex',
              ],
              'Para substituir placeholders dos templates com valores da própria máquina',
              'O formulário fica no navegador e gera downloads personalizados sem expor paths privados no template público.',
            ),
            ['Setup', 'Templates'],
          ),
        ],
      },
      {
        id: 'runtime-configuration',
        title: 'Configuração do Runtime',
        description: 'Arquivos globais e de projeto que definem comportamento.',
        pages: [
          page(
            'config-toml',
            'config.toml',
            '05-config-toml.md',
            'Consigo localizar no config.toml as seções de instruções, hooks, MCPs e projetos confiáveis.',
            choice(
              'config-role',
              'Qual é o papel principal do config.toml?',
              ['Definir comportamento global do runtime', 'Guardar conteúdo do workbook', 'Abrir a página do playbook'],
              'Definir comportamento global do runtime',
              'O config.toml é a configuração local que conecta runtime, hooks e instruções.',
            ),
            ['Config'],
          ),
          page(
            'rules-and-instructions',
            'Rules e Instruções',
            '05-rules-and-instructions.md',
            'Consigo criar rules globais e separar o que pertence ao projeto.',
            choice(
              'rules-scope',
              'Onde devem ficar regras específicas de um projeto?',
              ['No AGENTS.md do projeto', 'Dentro do output final de toda resposta', 'No arquivo de build gerado'],
              'No AGENTS.md do projeto',
              'Regras globais ficam em ~/.codex, regras específicas ficam junto do projeto.',
            ),
            ['Rules', 'Config'],
          ),
          page(
            'copilot-config',
            'copilot.config.toml',
            '06-copilot-config.md',
            'Consigo explicar a diferença entre configuração global e configuração auxiliar por contexto.',
            choice(
              'copilot-scope',
              'O copilot.config.toml deve ser tratado como qual tipo de configuração?',
              ['Configuração auxiliar por contexto', 'Banco de dados principal', 'Build output'],
              'Configuração auxiliar por contexto',
              'Ele complementa o setup, sem substituir a configuração global.',
            ),
            ['Config'],
          ),
        ],
      },
      {
        id: 'execution-roles-guardrails',
        title: 'Papéis de Execução e Guardrails',
        description: 'Como workflows reutilizáveis e proteções locais guiam a execução.',
        pages: [
          page(
            'agents',
            'Agents',
            '07-agents.md',
            'Consigo decidir quando delegar para um agent e quando uma leitura local simples basta.',
            choice(
              'agents-use',
              'Quando agents fazem mais sentido?',
              ['Para toda pergunta simples', 'Para fan-out concreto e limitado', 'Para ignorar o plano principal'],
              'Para fan-out concreto e limitado',
              'Agents ajudam quando há paralelismo real e escopo bem definido.',
            ),
            ['Agents'],
          ),
          page(
            'hooks',
            'Hooks',
            '08-hooks.md',
            'Consigo identificar como hooks são registrados e qual hook protege o uso de ferramentas.',
            choice(
              'hooks-pretool',
              'Qual hook bloqueia comandos perigosos antes da execução?',
              ['PreToolUse', 'SessionEnd', 'PostCompact'],
              'PreToolUse',
              'PreToolUse roda antes da ferramenta e pode bloquear comandos fora da policy.',
            ),
            ['Automation', 'Safety'],
          ),
          page(
            'mcp-connectors-setup',
            'MCPs e Connectors',
            '09-mcp-and-connectors-setup.md',
            'Consigo separar MCP local de connector autenticado e manter segredos fora dos templates públicos.',
            choice(
              'mcp-secrets-location',
              'Onde devem ficar tokens e connection strings usados por wrappers MCP?',
              ['Em ~/.codex/.mcp-secrets', 'Dentro do template público', 'No README do repositório'],
              'Em ~/.codex/.mcp-secrets',
              'Templates públicos mostram formato e comandos. Segredos reais ficam em arquivo local ignorado pelo Git.',
            ),
            ['MCP', 'Connectors'],
          ),
          page(
            'skills',
            'Skills',
            '09-skills.md',
            'Consigo escolher qual workflow recorrente deve virar uma skill nomeada.',
            choice(
              'skills-purpose',
              'Por que skills existem no ecossistema?',
              ['Para repetir workflows com regras conhecidas', 'Para apagar validação', 'Para substituir todo contexto local'],
              'Para repetir workflows com regras conhecidas',
              'Skills tornam workflows recorrentes mais consistentes e menos improvisados.',
            ),
            ['Skills'],
          ),
          page(
            'local-configuration-hands-on',
            'Hands-on de Configuração',
            '09-local-configuration-hands-on.md',
            'Consigo testar se rules, agents, hooks e skills aparecem no workflow local.',
            choice(
              'hands-on-reflection',
              'Como saber que uma skill refletiu no workflow?',
              [
                'O pedido combina com a description e o Codex segue os passos do SKILL.md',
                'A skill aparece como texto dentro do README',
                'Qualquer arquivo local aparece sozinho no site',
              ],
              'O pedido combina com a description e o Codex segue os passos do SKILL.md',
              'Skills refletem quando o runtime carrega o contrato correto e aplica seus passos no trabalho real.',
            ),
            ['Hands-on', 'Skills'],
          ),
        ],
      },
    ],
  },
  {
    id: 'knowledge-system',
    title: 'Sistema de Conhecimento',
    description: 'Economia de tokens, vault, PostgreSQL knowledge base e ciclo de reuso.',
    track: ['Knowledge', 'Memory'],
    chapters: [
      {
        id: 'cost-memory',
        title: 'Custo e Memória',
        description: 'Como manter contexto útil sem inflar toda a sessão.',
        pages: [
          page(
            'token-economy',
            'Economia de Tokens',
            '10-token-economy.md',
            'Consigo identificar quais conteúdos devem ser buscados sob demanda em vez de colados em todo prompt.',
            choice(
              'token-economy-mechanism',
              'Qual prática reduz custo de contexto sem perder evidência?',
              ['Colar todos os docs sempre', 'Buscar contexto sob demanda', 'Remover memória durável'],
              'Buscar contexto sob demanda',
              'Busca sob demanda preserva contexto relevante e evita ruído.',
            ),
            ['Knowledge'],
          ),
          page(
            'vault-memory',
            'Vault e Memória',
            '11-vault-and-memory.md',
            'Consigo decidir se uma informação pertence a Session-Memory ou a um documento durável.',
            choice(
              'memory-when',
              'Quando uma informação deve virar Session-Memory?',
              ['Quando cria continuidade útil para sessões futuras', 'Quando é ruído temporário', 'Quando contém segredo'],
              'Quando cria continuidade útil para sessões futuras',
              'Session-Memory deve guardar decisões, pendências e handoff durável, nunca ruído ou segredo.',
            ),
            ['Memory'],
          ),
        ],
      },
      {
        id: 'reusable-knowledge',
        title: 'Conhecimento Reutilizável',
        description: 'Como trabalho gerado vira conhecimento consultável para futuras skills.',
        pages: [
          page(
            'local-knowledge-base',
            'Base de Conhecimento Local',
            '12-local-knowledge-base.md',
            'Consigo explicar como conteúdo do Obsidian vira conhecimento pesquisável pela base local.',
            choice(
              'kb-storage',
              'Qual tecnologia sustenta o MCP local de base de conhecimento?',
              ['PostgreSQL', 'GitHub Issues', 'Browser cache'],
              'PostgreSQL',
              'O local-le-vault consulta conteúdo indexado em PostgreSQL.',
            ),
            ['Knowledge', 'MCP'],
          ),
          page(
            'knowledge-reuse-loop',
            'Ciclo de Reuso do Conhecimento',
            '13-knowledge-reuse-loop.md',
            'Consigo pegar um aprendizado de review e transformar em gotcha reutilizável.',
            choice(
              'reuse-loop',
              'Por que code reviews e gotchas devem voltar para a base de conhecimento?',
              ['Para melhorar sessões futuras antes da ação', 'Para aumentar o tamanho do prompt', 'Para substituir o reviewer humano'],
              'Para melhorar sessões futuras antes da ação',
              'O valor aparece quando a próxima sessão encontra o aprendizado antes de repetir o erro.',
            ),
            ['Knowledge', 'Reviews'],
          ),
          page(
            'automation-sync',
            'Sincronização por Automação',
            '14-automation-sync.md',
            'Consigo listar quais fontes podem sincronizar informação durável para o vault.',
            choice(
              'automation-sync-source',
              'Qual fonte pode alimentar conhecimento reutilizável por sincronização?',
              ['Confluence e reviews duráveis', 'Apenas conversa temporária', 'Build artifacts de dist'],
              'Confluence e reviews duráveis',
              'Sincronização transforma fontes duráveis em material consultável.',
            ),
            ['Automation', 'Knowledge'],
          ),
        ],
      },
    ],
  },
  {
    id: 'final-validation',
    title: 'Primeira Tarefa Guiada',
    description: 'Um exercício seguro para observar o ambiente funcionando em trabalho real.',
    track: ['Practice', 'Validation'],
    chapters: [
      {
        id: 'first-real-workflow',
        title: 'Primeiro Workflow Real',
        description: 'Como sair da configuração e testar o comportamento do Codex em um pedido pequeno.',
        pages: [
          page(
            'guided-first-task',
            'Primeira Tarefa Guiada',
            '15-checkpoints.md',
            'Consigo executar uma tarefa pequena e identificar quais camadas do ambiente foram usadas.',
            choice(
              'guided-task-purpose',
              'Qual é o objetivo da primeira tarefa guiada?',
              [
                'Validar o ambiente em um pedido pequeno e seguro',
                'Fazer push para GitHub',
                'Substituir todos os testes do projeto',
              ],
              'Validar o ambiente em um pedido pequeno e seguro',
              'A primeira tarefa guiada observa rules, hooks, skills, agents e MCPs sem criar risco externo.',
            ),
            ['Practice', 'Validation'],
          ),
        ],
      },
    ],
  },
];
