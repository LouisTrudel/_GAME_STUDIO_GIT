---
name: collectibles
description: Basic collectible item system with touch detection and UI counter.
---

# Collectibles (Roblox)

Simple collectible items that increment a counter when touched.

## Structure

```
Workspace/
  Collectibles/
    Coin (Part)
      CollectibleScript (Script)
    Gem (Part)
      CollectibleScript (Script)

ServerScriptService/
  CollectibleManager (Script)

StarterGui/
  CollectibleUI (ScreenGui)
    Counter (TextLabel)
```

## CollectibleScript (Server Script in Part)

```lua
-- CollectibleScript: Attach to any Part to make it collectible
-- Place this script inside each collectible Part

local part = script.Parent
local debounce = {}
local COOLDOWN = 0.5

part.Touched:Connect(function(hit)
    local player = game.Players:GetPlayerFromCharacter(hit.Parent)
    if not player then return end

    -- Prevent spam collection
    if debounce[player.UserId] then return end
    debounce[player.UserId] = true

    -- Fire collection event
    local collectEvent = game.ReplicatedStorage:FindFirstChild("CollectItem")
    if collectEvent then
        collectEvent:FireServer(part.Name)
    end

    -- Visual feedback: shrink and fade
    local tween = game:GetService("TweenService"):Create(
        part,
        TweenInfo.new(0.2),
        {Size = Vector3.new(0, 0, 0), Transparency = 1}
    )
    tween:Play()
    tween.Completed:Wait()

    -- Respawn after delay
    task.wait(5)
    part.Size = Vector3.new(2, 2, 2) -- Original size
    part.Transparency = 0
    debounce[player.UserId] = nil
end)
```

## CollectibleManager (ServerScriptService)

```lua
-- CollectibleManager: Server-side collection tracking
-- Place in ServerScriptService

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- Create RemoteEvents
local collectEvent = Instance.new("RemoteEvent")
collectEvent.Name = "CollectItem"
collectEvent.Parent = ReplicatedStorage

local updateUI = Instance.new("RemoteEvent")
updateUI.Name = "UpdateCollectibleUI"
updateUI.Parent = ReplicatedStorage

-- Player collection counts
local playerCounts = {}

Players.PlayerAdded:Connect(function(player)
    playerCounts[player.UserId] = 0
end)

Players.PlayerRemoving:Connect(function(player)
    playerCounts[player.UserId] = nil
end)

collectEvent.OnServerEvent:Connect(function(player, itemName)
    -- Validate player
    if not player or not playerCounts[player.UserId] then return end

    -- Increment count
    playerCounts[player.UserId] = playerCounts[player.UserId] + 1
    local newCount = playerCounts[player.UserId]

    print(player.Name .. " collected " .. itemName .. " (total: " .. newCount .. ")")

    -- Update client UI
    updateUI:FireClient(player, newCount)
end)
```

## CollectibleUI (LocalScript in StarterGui)

```lua
-- CollectibleUIController: Updates the counter display
-- Place as LocalScript in StarterGui

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Create UI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "CollectibleUI"
screenGui.Parent = playerGui

local counter = Instance.new("TextLabel")
counter.Name = "Counter"
counter.Size = UDim2.new(0, 150, 0, 50)
counter.Position = UDim2.new(0, 10, 0, 10)
counter.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
counter.BackgroundTransparency = 0.5
counter.TextColor3 = Color3.fromRGB(255, 215, 0)
counter.TextSize = 24
counter.Font = Enum.Font.GothamBold
counter.Text = "Collected: 0"
counter.Parent = screenGui

-- Listen for updates
local updateUI = ReplicatedStorage:WaitForChild("UpdateCollectibleUI")
updateUI.OnClientEvent:Connect(function(newCount)
    counter.Text = "Collected: " .. newCount

    -- Pop animation
    counter:TweenSize(
        UDim2.new(0, 170, 0, 60),
        Enum.EasingDirection.Out,
        Enum.EasingStyle.Bounce,
        0.2,
        true,
        function()
            counter:TweenSize(
                UDim2.new(0, 150, 0, 50),
                Enum.EasingDirection.Out,
                Enum.EasingStyle.Quad,
                0.1
            )
        end
    )
end)
```

## Testing Checklist

| Test | Expected |
|------|----------|
| Touch collectible | Counter increments by 1 |
| Spam touch | Only counts once per cooldown |
| Multiple players | Each player has own count |
| Player leaves/rejoins | Count resets (no persistence) |
| Collectible respawns | After 5 seconds, can collect again |

## Extending

| Feature | Modification |
|---------|-------------|
| Different item values | Add `value` attribute to Part, read in script |
| Persistence | Save `playerCounts` to DataStore |
| Sound on collect | Add `game.SoundService:PlayLocalSound()` |
| Particles | Create ParticleEmitter, emit on touch |
