-- Tween Sequence Template
-- Usage: Smooth UI animations, object movement

local TweenService = game:GetService("TweenService")

-- Quick tween helper
local function tween(instance, properties, duration, style, direction)
    local info = TweenInfo.new(
        duration or 0.3,
        style or Enum.EasingStyle.Quad,
        direction or Enum.EasingDirection.Out
    )

    local t = TweenService:Create(instance, info, properties)
    t:Play()
    return t
end

-- Wait for tween to complete
local function tweenAsync(instance, properties, duration, style, direction)
    local t = tween(instance, properties, duration, style, direction)
    t.Completed:Wait()
    return t
end

-- Common UI patterns
local UI = {}

function UI.fadeIn(frame, duration)
    frame.Visible = true
    frame.BackgroundTransparency = 1
    return tween(frame, { BackgroundTransparency = 0 }, duration or 0.2)
end

function UI.fadeOut(frame, duration)
    local t = tween(frame, { BackgroundTransparency = 1 }, duration or 0.2)
    t.Completed:Connect(function()
        frame.Visible = false
    end)
    return t
end

function UI.slideIn(frame, fromDirection, duration)
    local original = frame.Position
    local offset = UDim2.new(
        fromDirection == "left" and -1 or (fromDirection == "right" and 1 or 0),
        0,
        fromDirection == "up" and -1 or (fromDirection == "down" and 1 or 0),
        0
    )

    frame.Position = original + offset
    frame.Visible = true
    return tween(frame, { Position = original }, duration or 0.3, Enum.EasingStyle.Back)
end

function UI.pop(instance, scale)
    scale = scale or 1.1
    local original = instance.Size
    instance.Size = original * UDim2.new(scale, 0, scale, 0)
    return tween(instance, { Size = original }, 0.15, Enum.EasingStyle.Back)
end

return {
    tween = tween,
    tweenAsync = tweenAsync,
    UI = UI,
}
