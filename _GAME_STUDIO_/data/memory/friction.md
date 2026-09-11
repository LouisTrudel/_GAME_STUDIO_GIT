
## [2026-09-09 11:46]
- [RESOLVED] MCP tool availability intermittent across VSCode sessions - tasks created on server restart
- [RESOLVED] T373 error code 1 (out of tokens) - continued via T376
- [UNRESOLVED] UI not showing pending tasks (T373-T374) - frontend sync issue with tasks.json

## [2026-09-09 12:52]
- [RESOLVED] Frontend token display broken: JS expected flat fields but backend returned nested structure
- [RESOLVED] MCP tools not invoking - config was mislocated, fixed by moving to correct path
- [RESOLVED] Python executable permission issue in Windows sandbox during initial MCP setup

## [2026-09-09 13:32]
- [RESOLVED] "Run Now" button was incorrectly activating paused routines - fixed in T395
- [RESOLVED] BOSS would say "fix it" then do work instead of delegating - trigger words added in T390
- [UNRESOLVED] Agent token usage high (4.4M tokens) compared to VSCode sessions (~20K) - agents may be reading more context than necessary; VSCode abstracts file discovery better

## [2026-09-09 17:01]
- [RESOLVED] BrokenPipeError during BOSS response - T412 added retry logic with exponential backoff
- [RESOLVED] Expired session returns error instead of auto-retry - T412 added automatic retry on "No conversation found"

## [2026-09-09 21:39]
- [UNRESOLVED] Task examination missing project path/structure injection - likely causing orientation token waste
- [RESOLVED] Session encoding bug (- vs -- for special chars) fixed externally - `--resume` works correctly now
- [RESOLVED] OSError: [Errno 22] Invalid argument - occurred multiple times during Programmer tasks

## [2026-09-10 19:04]
- [RESOLVED] Incremental prompts only sent `## TASK` header without user message content - BOSS couldn't see messages
- [RESOLVED] Project Chat validation error "Error: 'Project Name'" - was calling non-existent `gemini.chat()`
- [RESOLVED] BOSS repeatedly said "No user message received" due to incremental prompt bug

## [2026-09-10 21:26]
- [UNRESOLVED] Live token counts disappear on tasks_update DOM rebuild (race condition bug T456)
- [RESOLVED] Git CRLF + stray `nul` file staging issues - cleaned up
- [RESOLVED] RuntimeError: CLI exited early with unknown option '--autocompact'
- [RESOLVED] BOSS "no user message detected" loop - session cleared to fix

## [2026-09-11 18:30]
- [RESOLVED] PersistentClaudeCLI missing REINIT_AFTER_TASKS constant - blocking compact after tasks
- [UNRESOLVED] routes.py:160 cancel_task treats dict as boolean - always truthy, error path unreachable
- [UNRESOLVED] Agents hitting 8-turn limit before completing tasks (T614-T618 all truncated)
