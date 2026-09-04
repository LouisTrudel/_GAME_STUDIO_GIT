---
name: client
description: Client-side Roblox scripting. LocalScripts, UI, input, camera.
---

# Client (Roblox)

## Locations

| Script Type              | Location                         |
|--------------------------|----------------------------------|
| Player-level logic       | StarterPlayerScripts/            |
| UI screens               | StarterGui/                      |
| Tool scripts             | Inside tool models               |
| Character scripts        | StarterCharacterScripts/         |

## Client-Server Boundary

| Data Type        | Replicates? |
|------------------|-------------|
| Attributes       | YES         |
| Instance refs    | NO (use IDs)|
| Primitives       | YES         |
| Tables           | YES         |

## Common Patterns

| Pattern                  | Implementation                   |
|--------------------------|----------------------------------|
| Immediate feedback       | Update UI → FireServer → confirm |
| Input handling           | UserInputService or ContextAction|
| Camera control           | Set CameraType to Scriptable     |
| Local state              | Player:SetAttribute() (local only)|

## Rules

- Never trust server to be instant → show immediate feedback
- Can't send Instance refs via RemoteEvent → use names/IDs
- RenderStepped for visual updates
- Heartbeat for game logic
- Always clean up connections on player leave

## Gotchas

| Issue                    | Solution                         |
|--------------------------|----------------------------------|
| Heartbeat dt is 0        | Use `or 0`, not `or tick()`      |
| Remote returns nil       | Check InvokeServer timeout       |
| UI not updating          | Check Enabled, Visible, ZIndex   |
