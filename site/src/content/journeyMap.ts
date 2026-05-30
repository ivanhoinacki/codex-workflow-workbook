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
    title: 'Foundations',
    description: 'Purpose, layers, main sequence and operational boundaries.',
    track: ['Concepts', 'Workflow'],
    chapters: [
      {
        id: 'purpose-system-shape',
        title: 'Purpose And System Shape',
        description: 'Understand the problem before configuring the local machine.',
        pages: [
          page(
            'purpose',
            'Purpose',
            '01-purpose.md',
            'I can explain why context, guardrails, memory and validation are separate responsibilities.',
            choice(
              'purpose-why',
              'What problem does the ecosystem solve beyond using AI chat?',
              ['Create longer answers', 'Turn real work into a predictable workflow', 'Replace local tests'],
              'Turn real work into a predictable workflow',
              'The focus is predictability, context, guardrails, validation and durable memory.',
            ),
            ['Concepts'],
          ),
          page(
            'ecosystem-layers',
            'Ecosystem Layers',
            '02-ecosystem-layers.md',
            'I can identify which layer owns instructions, tools, memory and reusable knowledge.',
            choice(
              'layers-runtime',
              'Which layer is responsible for hooks and MCPs?',
              ['Runtime and tooling', 'Markdown content', 'GitHub Pages'],
              'Runtime and tooling',
              'Hooks and MCPs are runtime capabilities. They make rules and context operational.',
            ),
            ['Architecture'],
          ),
          page(
            'main-sequence',
            'Main Sequence',
            '03-main-sequence.md',
            'I can order the path from request to context, evidence, validation and reusable memory.',
            choice(
              'sequence-first-step',
              'What is the expected first action before relevant LE work?',
              ['Consult relevant local context', 'Open a PR', 'Jump straight to implementation'],
              'Consult relevant local context',
              'The flow starts with context and evidence, not immediate edits.',
            ),
            ['Workflow'],
          ),
          page(
            'workflow-boundaries',
            'Workflow Boundaries',
            '04-workflow-boundaries.md',
            'I can separate safe local actions from external or destructive effects.',
            choice(
              'boundaries-approval',
              'Which type of action requires explicit approval?',
              ['Read local Markdown', 'Run rg', 'Push, PR, Slack or destructive operation'],
              'Push, PR, Slack or destructive operation',
              'External and destructive effects require clear approval.',
            ),
            ['Workflow', 'Safety'],
          ),
        ],
      },
    ],
  },
  {
    id: 'local-configuration',
    title: 'Local Configuration',
    description: 'Runtime configuration, rules, agents, hooks, MCPs and skills.',
    track: ['Config', 'Automation'],
    chapters: [
      {
        id: 'environment-setup',
        title: 'Environment Setup',
        description: 'Terminal, Codex CLI and minimum base before copying templates.',
        pages: [
          page(
            'terminal-codex-cli',
            'Terminal And Codex CLI',
            '00-terminal-and-codex-cli.md',
            'I can validate that terminal, Codex CLI and the local config directory are ready.',
            choice(
              'terminal-cli-ready',
              'What is the goal of this initial step?',
              [
                'Install all MCPs before opening Codex',
                'Configure all hooks immediately',
                'Prepare terminal, Codex CLI and ~/.codex directory',
              ],
              'Prepare terminal, Codex CLI and ~/.codex directory',
              'Before advanced templates, the learner must be able to open Codex and validate the local base.',
            ),
            ['Setup', 'CLI'],
          ),
          page(
            'environment-prerequisites',
            'Environment Prerequisites',
            '00-environment-prerequisites.md',
            'I can distinguish what I need now from what templates configure later.',
            choice(
              'prerequisites-before-config',
              'What does the learner need before copying configuration models?',
              [
                'Minimum local base, workbook access and clear next steps',
                'All hooks already installed',
                'PostgreSQL and MCPs already running',
              ],
              'Minimum local base, workbook access and clear next steps',
              'Hooks, skills, MCPs, vault and PostgreSQL are built in later steps from workbook templates.',
            ),
            ['Setup', 'Concepts'],
          ),
          page(
            'template-variables',
            'Template Variables',
            '00-template-variables.md',
            'I filled in the local values used to generate template downloads without placeholders.',
            choice(
              'template-variables-purpose',
              'Why does this step exist before downloads?',
              [
                'To save tokens in the repository',
                'To replace template placeholders with values from the local machine',
                'To skip Codex configuration',
              ],
              'To replace template placeholders with values from the local machine',
              'The form stays in the browser and generates personalized downloads without exposing private paths in public templates.',
            ),
            ['Setup', 'Templates'],
          ),
        ],
      },
      {
        id: 'runtime-configuration',
        title: 'Runtime Configuration',
        description: 'Global and project files that define behavior.',
        pages: [
          page(
            'config-toml',
            'config.toml',
            '05-config-toml.md',
            'I can locate instructions, hooks, MCPs and trusted projects in config.toml.',
            choice(
              'config-role',
              'What is the main role of config.toml?',
              ['Define global runtime behavior', 'Store workbook content', 'Open the playbook page'],
              'Define global runtime behavior',
              'config.toml is the local configuration that connects runtime, hooks and instructions.',
            ),
            ['Config'],
          ),
          page(
            'rules-and-instructions',
            'Rules And Instructions',
            '05-rules-and-instructions.md',
            'I can create global rules and separate what belongs to the project.',
            choice(
              'rules-scope',
              'Where should project-specific rules live?',
              ['In the project AGENTS.md', 'Inside every final answer', 'In the generated build file'],
              'In the project AGENTS.md',
              'Global rules live in ~/.codex, project-specific rules live with the project.',
            ),
            ['Rules', 'Config'],
          ),
          page(
            'copilot-config',
            'copilot.config.toml',
            '06-copilot-config.md',
            'I can explain the difference between global configuration and auxiliary context configuration.',
            choice(
              'copilot-scope',
              'What type of configuration is copilot.config.toml?',
              ['Auxiliary context configuration', 'Primary database', 'Build output'],
              'Auxiliary context configuration',
              'It complements the setup without replacing global configuration.',
            ),
            ['Config'],
          ),
        ],
      },
      {
        id: 'execution-roles-guardrails',
        title: 'Execution Roles And Guardrails',
        description: 'How reusable workflows and local protections guide execution.',
        pages: [
          page(
            'agents',
            'Agents',
            '07-agents.md',
            'I can decide when to delegate to an agent and when a simple local read is enough.',
            choice(
              'agents-use',
              'When do agents make the most sense?',
              ['For every simple question', 'For concrete and bounded fan-out', 'To ignore the main plan'],
              'For concrete and bounded fan-out',
              'Agents help when there is real parallelism and a well-defined scope.',
            ),
            ['Agents'],
          ),
          page(
            'hooks',
            'Hooks',
            '08-hooks.md',
            'I can identify how hooks are registered and which hook protects tool usage.',
            choice(
              'hooks-pretool',
              'Which hook blocks dangerous commands before execution?',
              ['PreToolUse', 'SessionEnd', 'PostCompact'],
              'PreToolUse',
              'PreToolUse runs before the tool and can block commands outside policy.',
            ),
            ['Automation', 'Safety'],
          ),
          page(
            'mcp-connectors-setup',
            'MCPs And Connectors',
            '09-mcp-and-connectors-setup.md',
            'I can separate local MCPs from authenticated connectors and keep secrets out of public templates.',
            choice(
              'mcp-secrets-location',
              'Where should tokens and connection strings used by MCP wrappers live?',
              ['In ~/.codex/.mcp-secrets', 'Inside the public template', 'In the repository README'],
              'In ~/.codex/.mcp-secrets',
              'Public templates show shape and commands. Real secrets stay in a local file ignored by Git.',
            ),
            ['MCP', 'Connectors'],
          ),
          page(
            'skills',
            'Skills',
            '09-skills.md',
            'I can choose which recurring workflow should become a named skill.',
            choice(
              'skills-purpose',
              'Why do skills exist in the ecosystem?',
              ['To repeat workflows with known rules', 'To delete validation', 'To replace all local context'],
              'To repeat workflows with known rules',
              'Skills make recurring workflows more consistent and less improvised.',
            ),
            ['Skills'],
          ),
          page(
            'local-configuration-hands-on',
            'Configuration Hands-on',
            '09-local-configuration-hands-on.md',
            'I can test whether rules, agents, hooks and skills appear in the local workflow.',
            choice(
              'hands-on-reflection',
              'How do you know a skill reflected in the workflow?',
              [
                'The request matches the description and Codex follows the SKILL.md steps',
                'The skill appears as text in the README',
                'Any local file appears by itself on the site',
              ],
              'The request matches the description and Codex follows the SKILL.md steps',
              'Skills reflect when the runtime loads the correct contract and applies its steps to real work.',
            ),
            ['Hands-on', 'Skills'],
          ),
        ],
      },
    ],
  },
  {
    id: 'knowledge-system',
    title: 'Knowledge System',
    description: 'Token economy, vault, PostgreSQL knowledge base and reuse loop.',
    track: ['Knowledge', 'Memory'],
    chapters: [
      {
        id: 'cost-memory',
        title: 'Cost And Memory',
        description: 'How to keep useful context without inflating the whole session.',
        pages: [
          page(
            'token-economy',
            'Token Economy',
            '10-token-economy.md',
            'I can identify which content should be fetched on demand instead of pasted into every prompt.',
            choice(
              'token-economy-mechanism',
              'Which practice reduces context cost without losing evidence?',
              ['Always paste all docs', 'Fetch context on demand', 'Remove durable memory'],
              'Fetch context on demand',
              'On-demand search preserves relevant context and avoids noise.',
            ),
            ['Knowledge'],
          ),
          page(
            'vault-memory',
            'Vault And Memory',
            '11-vault-and-memory.md',
            'I can decide whether information belongs in Session-Memory or a durable document.',
            choice(
              'memory-when',
              'When should information become Session-Memory?',
              ['When it creates useful continuity for future sessions', 'When it is temporary noise', 'When it contains a secret'],
              'When it creates useful continuity for future sessions',
              'Session-Memory should store decisions, pending actions and durable handoff, never noise or secrets.',
            ),
            ['Memory'],
          ),
        ],
      },
      {
        id: 'reusable-knowledge',
        title: 'Reusable Knowledge',
        description: 'How generated work becomes searchable knowledge for future skills.',
        pages: [
          page(
            'local-knowledge-base',
            'Local Knowledge Base',
            '12-local-knowledge-base.md',
            'I can explain how Obsidian content becomes searchable knowledge in the local base.',
            choice(
              'kb-storage',
              'Which technology supports the local knowledge-base MCP?',
              ['PostgreSQL', 'GitHub Issues', 'Browser cache'],
              'PostgreSQL',
              'local-le-vault queries content indexed in PostgreSQL.',
            ),
            ['Knowledge', 'MCP'],
          ),
          page(
            'knowledge-reuse-loop',
            'Knowledge Reuse Loop',
            '13-knowledge-reuse-loop.md',
            'I can take a review learning and turn it into a reusable gotcha.',
            choice(
              'reuse-loop',
              'Why should code reviews and gotchas return to the knowledge base?',
              ['To improve future sessions before action', 'To increase prompt size', 'To replace the human reviewer'],
              'To improve future sessions before action',
              'The value appears when the next session finds the learning before repeating the mistake.',
            ),
            ['Knowledge', 'Reviews'],
          ),
          page(
            'automation-sync',
            'Automation Sync',
            '14-automation-sync.md',
            'I can list which sources can synchronize durable information into the vault.',
            choice(
              'automation-sync-source',
              'Which source can feed reusable knowledge by synchronization?',
              ['Confluence and durable reviews', 'Only temporary conversation', 'dist build artifacts'],
              'Confluence and durable reviews',
              'Synchronization turns durable sources into searchable material.',
            ),
            ['Automation', 'Knowledge'],
          ),
        ],
      },
    ],
  },
  {
    id: 'final-validation',
    title: 'Guided First Task',
    description: 'A safe exercise to observe the environment working on real work.',
    track: ['Practice', 'Validation'],
    chapters: [
      {
        id: 'first-real-workflow',
        title: 'First Real Workflow',
        description: 'How to leave configuration and test Codex behavior on a small request.',
        pages: [
          page(
            'guided-first-task',
            'Guided First Task',
            '15-checkpoints.md',
            'I can execute a small task and identify which environment layers were used.',
            choice(
              'guided-task-purpose',
              'What is the goal of the guided first task?',
              [
                'Validate the environment on a small and safe request',
                'Push to GitHub',
                'Replace all project tests',
              ],
              'Validate the environment on a small and safe request',
              'The guided first task observes rules, hooks, skills, agents and MCPs without creating external risk.',
            ),
            ['Practice', 'Validation'],
          ),
        ],
      },
    ],
  },
];
