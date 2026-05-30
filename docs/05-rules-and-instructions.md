---
date: 2026-05-29
type: workbook-module
project: codex-workflow
module: rules-and-instructions
status: draft
order: 5.5
---

# 05.5 - Rules and Instructions

## Em uma frase

Rules são o contrato escrito que o Codex carrega antes de trabalhar.

## O que você vai entender

Ao final desta página, você deve conseguir separar regra global, regra de projeto e regra operacional de terminal.

## Resumo

Rules são arquivos de instrução que definem o comportamento esperado antes de uma tarefa começar.

Neste setup, existem dois níveis principais:

- `~/.codex/AGENTS.md`: regras globais do operador local;
- `~/.codex/RTK.md`: regra operacional para comandos de terminal com output controlado.

Em projetos específicos, também pode existir um `AGENTS.md` no diretório do repo ou vault. Esse arquivo complementa as regras globais com contexto do projeto.

O modelo compartilhado não deve ser uma cópia literal da configuração de uma pessoa. Ele deve preservar os princípios e trocar dados pessoais por placeholders.

## Passo a passo de configuração local

1. Crie ou revise `~/.codex/AGENTS.md`.
2. Crie ou revise `~/.codex/RTK.md`.
3. Mantenha regras globais pequenas e reutilizáveis.
4. Coloque regras específicas do projeto no `AGENTS.md` do projeto.
5. Valide que nenhuma regra pública contém paths privados, tokens ou detalhes sensíveis.

Templates:

- [Download global AGENTS.md template](templates/rules/AGENTS.md)
- [Download project AGENTS.md template](templates/rules/PROJECT_AGENTS.md)
- [Download RTK.md template](templates/rules/RTK.md)

Comandos para aplicar:

```bash
mkdir -p ~/.codex
$EDITOR ~/.codex/AGENTS.md
$EDITOR ~/.codex/RTK.md
```

Para um projeto específico:

```bash
cp PROJECT_AGENTS.md /path/to/your/project/AGENTS.md
$EDITOR /path/to/your/project/AGENTS.md
```

## O que personalizar

| Placeholder | Onde aparece | Exemplo de valor |
|---|---|---|
| `YOUR_NAME` | `~/.codex/AGENTS.md` | Nome da pessoa. |
| `YOUR_ORG_OR_TEAM` | `~/.codex/AGENTS.md` | Time, tribo ou empresa. |
| `YOUR_WORKSPACE_PATH` | `~/.codex/AGENTS.md` | Diretório onde ficam os repos. |
| `YOUR_VAULT_PATH` | `~/.codex/AGENTS.md` | Vault Obsidian ou pasta de docs. |
| `YOUR_PROJECT_NAME` | `AGENTS.md` do projeto | Nome do repo ou projeto. |
| `YOUR_VALIDATION_COMMAND` | `AGENTS.md` do projeto | Comando mínimo de validação. |

## Como Escrever Uma Boa Regra

Uma boa regra deve ser:

- curta o suficiente para ser lida sempre;
- específica o suficiente para mudar comportamento;
- verificável quando possível;
- livre de segredo ou dado privado;
- colocada na camada correta.

Exemplo ruim: "seja melhor".

Exemplo melhor: "Antes de editar um projeto Luxury Escapes, consulte o vault ou a Session-Memory quando houver contexto relevante".

Modelo reduzido de `AGENTS.md`:

```markdown
@~/.codex/RTK.md

# Local Codex Rules

## Language

- Conversation: English.
- Code, commits and PR text: English.

## Operating Rules

- Prefer local files, vault notes and repository state before assumptions.
- Use focused commands and bounded reads.
- Do not run destructive git commands unless explicitly requested.
- Do not send external messages or mutate external systems without approval.
- Do not publish private config files without sanitizing paths and secrets.
```

## O que não compartilhar

Não publique:

- tokens;
- emails pessoais sem necessidade;
- paths internos de empresa;
- URLs privadas;
- regras que mencionam clientes, incidentes ou dados sensíveis;
- outputs de `env`, `config.toml` real ou `.mcp-secrets`.

## Por que funciona

Rules reduzem repetição. Em vez de explicar estilo, limites e preferências em cada conversa, o runtime carrega esse comportamento como contrato local.

## Erros comuns

- Escrever regras longas demais e pouco acionáveis.
- Colocar tudo no arquivo global.
- Misturar preferência pessoal com regra obrigatória do projeto.
- Compartilhar rules com paths privados ou nomes internos sensíveis.

## Checkpoint

```bash
rtk sed -n '1,120p' ~/.codex/AGENTS.md
rtk sed -n '1,120p' ~/.codex/RTK.md
rtk rg -n 'token|secret|password|api_key|PRIVATE' ~/.codex/AGENTS.md ~/.codex/RTK.md
rtk rg -n 'YOUR_|REPLACE_ME|TODO' ~/.codex/AGENTS.md ~/.codex/RTK.md
```

Antes de seguir, você deve conseguir explicar:

- quais regras são globais;
- quais regras pertencem ao projeto;
- por que paths privados e segredos não entram em templates públicos.

## Próximo Módulo

Siga para [[06-copilot-config]].
