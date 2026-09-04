-- DataStore Save/Load Template
-- Location: ServerScriptService/

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local PlayerData = DataStoreService:GetDataStore("PlayerData_v1")

-- Default data for new players
local DEFAULT_DATA = {
    coins = 0,
    level = 1,
    inventory = {},
}

-- In-memory cache
local cache = {}

local function loadData(player)
    local key = "user_" .. player.UserId

    local ok, data = pcall(function()
        return PlayerData:GetAsync(key)
    end)

    if not ok then
        warn("[Data] Load failed for", player.Name, ":", data)
        data = nil
    end

    -- Use defaults if no data
    if not data then
        data = table.clone(DEFAULT_DATA)
    end

    cache[player.UserId] = data
    return data
end

local function saveData(player)
    local data = cache[player.UserId]
    if not data then return end

    local key = "user_" .. player.UserId

    local ok, err = pcall(function()
        PlayerData:SetAsync(key, data)
    end)

    if not ok then
        warn("[Data] Save failed for", player.Name, ":", err)
    end
end

local function getData(player)
    return cache[player.UserId]
end

-- Events
Players.PlayerAdded:Connect(function(player)
    loadData(player)
    print("[Data] Loaded:", player.Name)
end)

Players.PlayerRemoving:Connect(function(player)
    saveData(player)
    cache[player.UserId] = nil
    print("[Data] Saved:", player.Name)
end)

-- Save all on shutdown
game:BindToClose(function()
    for _, player in Players:GetPlayers() do
        saveData(player)
    end
    task.wait(2) -- Give time for saves
end)

-- Public API
return {
    get = getData,
    save = saveData,
}
