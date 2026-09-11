# T609: Agent Task Termination Implementation

## Summary
Implemented graceful agent task termination allowing BOSS to stop agents mid-execution.

## Changes Made

### 1. TaskStatus.CANCELLED (studio/core/tasks.py:166)
- Added CANCELLED to terminal states enum
- Indicates task was manually stopped mid-execution

### 2. cancel_task() Enhancement (studio/core/tasks.py:1166)
**Before**: Simple status update + delete
**After**: Graceful cancellation with:
- Status validation (only PENDING/READY/IN_PROGRESS)
- Partial output preservation
- Agent release tracking
- Detailed result reporting

**Return structure**:
```python
{
    'success': bool,
    'message': str,
    'task_id': str,
    'previous_status': str,
    'partial_output': str,
    'cancelled_at': str
}
```

### 3. Process Tracking (backends/backends/persistent_claude_cli.py:71)
- Added `_running_processes: dict[str, subprocess.Popen]` class variable
- Tracks active agent processes by name

### 4. Process Registration (backends/backends/persistent_claude_cli.py:297-327)
- Modified `_run_subprocess()` to register process on start
- Auto-cleanup on completion via try/finally
- Thread-safe registration using `_lock`

### 5. terminate_agent() Method (backends/backends/persistent_claude_cli.py:599)
```python
@classmethod
def terminate_agent(cls, agent_name: str, timeout: int = 5) -> dict
```

**Graceful shutdown flow**:
1. Check if agent is running
2. Send SIGTERM (graceful)
3. Wait up to `timeout` seconds
4. If still running, send SIGKILL (force)
5. Clean up tracking

**Return structure**:
```python
{
    'success': bool,
    'message': str,
    'terminated': bool
}
```

### 6. BOSS Tool Integration (studio/agents/boss/tools.py:422)
Updated `cancel_task()` to:
1. Call TaskManager.cancel_task() for state management
2. If task was IN_PROGRESS, terminate the running agent
3. Preserve partial output
4. Broadcast result to hub

### 7. Schema Update (studio/agents/boss/tools.py:402)
Updated CANCEL_TASK_SCHEMA description:
> "Stop a task mid-execution. Gracefully terminates the agent, preserves partial results, marks task as CANCELLED."

### 8. Dependency Chain Handling
Updated dependency checks to treat CANCELLED as terminal/blocking:
- `_all_dependencies_satisfied()`: CANCELLED deps block dependents
- Archive logic includes CANCELLED in terminal states
- Dependency unblocking excludes CANCELLED tasks

## Constraints Followed
✓ Graceful shutdown only - SIGTERM first, SIGKILL only after timeout
✓ Preserve partial results in task.output_response
✓ Mark task as CANCELLED with reason
✓ No force kill without graceful attempt

## Usage Example

```python
# BOSS cancels a long-running task
result = cancel_task("T123", reason="Taking too long, switching approach")

# Output:
# ✓ Cancelled T123 - Code terminated
#   Preserved partial output (1247 chars)
```

## Edge Cases Handled

1. **Agent not running**: Returns success but notes agent wasn't active
2. **Process already finished**: Clean handling via process tracking cleanup
3. **Termination failure**: Catches exceptions, returns error message
4. **Partial output**: Empty output is handled gracefully
5. **Terminal task**: Rejects cancellation of APPROVED/FAILED tasks

## Files Modified

- studio/core/tasks.py (+42 lines)
  - TaskStatus.CANCELLED enum
  - cancel_task() implementation
  - Dependency chain updates

- backends/backends/persistent_claude_cli.py (+60 lines)
  - Process tracking infrastructure
  - terminate_agent() classmethod
  - Process registration in _run_subprocess()

- studio/agents/boss/tools.py (+24 lines)
  - cancel_task() BOSS tool
  - Schema description update
  - Agent termination integration

## Testing Checklist

- [ ] Cancel PENDING task (should succeed, no process to kill)
- [ ] Cancel READY task (should succeed, no process to kill)
- [ ] Cancel IN_PROGRESS task (should terminate agent + preserve output)
- [ ] Cancel APPROVED task (should reject)
- [ ] Cancel non-existent task (should return error)
- [ ] Dependent tasks of cancelled task (should become BLOCKED)
- [ ] Graceful shutdown within timeout (SIGTERM works)
- [ ] Force kill after timeout (SIGTERM fails, SIGKILL succeeds)
- [ ] Partial output preservation (verify in task record)

## Implementation Notes

**Why SIGTERM then SIGKILL?**
- SIGTERM allows Claude CLI to flush output, close files, cleanup state
- 5-second timeout balances responsiveness vs cleanup time
- SIGKILL is last resort to prevent zombie processes

**Why track processes at class level?**
- Multiple agent instances share same process pool
- Centralized tracking simplifies termination logic
- Thread-safe via class-level lock

**Why preserve partial output?**
- Agent may have completed useful exploration
- BOSS/user can review what was attempted
- Avoids wasted work if retry needed

**Dependency blocking**:
- CANCELLED tasks block dependents (not "successfully completed")
- Prevents cascade of invalid work based on cancelled foundation
- User must manually retry or reassign dependencies
