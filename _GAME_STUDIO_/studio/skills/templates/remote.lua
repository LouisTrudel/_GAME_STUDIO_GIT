-- RemoteEvent Handler Template
-- Location: ServerScriptService/Handlers/

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Events = ReplicatedStorage:WaitForChild("Events")
local MyEvent = Events:WaitForChild("MyEvent")

-- Cooldown tracking
local cooldowns = {}
local COOLDOWN_SECONDS = 0.5

local function onMyEvent(player, data)
    -- 1. Validate player
    if not player or not player.Parent then
        return
    end

    -- 2. Check cooldown
    local now = tick()
    if cooldowns[player.UserId] and now - cooldowns[player.UserId] < COOLDOWN_SECONDS then
        warn("[MyHandler] Cooldown:", player.Name)
        return
    end
    cooldowns[player.UserId] = now

    -- 3. Validate data
    if type(data) ~= "table" then
        warn("[MyHandler] Invalid data from:", player.Name)
        return
    end

    -- 4. Process request
    local ok, err = pcall(function()
        -- Your logic here
    end)

    if not ok then
        warn("[MyHandler] Error:", err)
        return
    end

    -- 5. Respond to client (optional)
    MyEvent:FireClient(player, { success = true })
end

MyEvent.OnServerEvent:Connect(onMyEvent)

-- Cleanup on leave
Players.PlayerRemoving:Connect(function(player)
    cooldowns[player.UserId] = nil
end)

print("[MyHandler] Ready")
