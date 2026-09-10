# Input System (JavaScript)

## Event Types

| Event | Use For |
|-------|---------|
| `keydown` / `keyup` | Keyboard |
| `mousedown` / `mouseup` | Mouse buttons |
| `mousemove` | Mouse position |
| `touchstart` / `touchend` | Mobile touch |
| `gamepadconnected` | Controller |

## Input Manager Pattern

```javascript
class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.touch = { active: false, x: 0, y: 0 };

        this.setupKeyboard();
        this.setupMouse();
        this.setupTouch();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!e.repeat) {  // Ignore held key repeats
                this.keys[e.code] = true;
                this.onKeyDown?.(e.code);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.onKeyUp?.(e.code);
        });
    }

    setupMouse() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', (e) => {
            this.mouse.buttons[e.button] = true;
        });
        window.addEventListener('mouseup', (e) => {
            this.mouse.buttons[e.button] = false;
        });
    }

    setupTouch() {
        window.addEventListener('touchstart', (e) => {
            this.touch.active = true;
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
        });
        window.addEventListener('touchend', () => {
            this.touch.active = false;
        });
    }

    isKeyDown(code) {
        return this.keys[code] === true;
    }

    isMouseDown(button = 0) {
        return this.mouse.buttons[button] === true;
    }
}
```

## Device Detection

```javascript
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const hasTouch = 'ontouchstart' in window;
const hasGamepad = 'getGamepads' in navigator;
```

## Action Binding System

```javascript
class ActionBinder {
    constructor() {
        this.actions = {};  // { actionName: { keys: [], callback: fn } }
    }

    bind(action, keys, callback) {
        this.actions[action] = { keys, callback };
    }

    unbind(action) {
        delete this.actions[action];
    }

    update(inputManager) {
        for (const [name, action] of Object.entries(this.actions)) {
            const pressed = action.keys.some(k => inputManager.isKeyDown(k));
            if (pressed) action.callback(name);
        }
    }
}

// Usage
const actions = new ActionBinder();
actions.bind('jump', ['Space', 'KeyW'], () => player.jump());
actions.bind('shoot', ['MouseLeft', 'KeyF'], () => player.shoot());
```

## Gamepad Support

```javascript
class GamepadManager {
    getGamepad() {
        const gamepads = navigator.getGamepads();
        return gamepads[0] || null;
    }

    isButtonPressed(index) {
        const gp = this.getGamepad();
        return gp?.buttons[index]?.pressed || false;
    }

    getAxis(index) {
        const gp = this.getGamepad();
        return gp?.axes[index] || 0;
    }
}

// Button indices (standard mapping)
const GAMEPAD = {
    A: 0, B: 1, X: 2, Y: 3,
    LB: 4, RB: 5, LT: 6, RT: 7,
    LEFT_STICK_X: 0, LEFT_STICK_Y: 1,
    RIGHT_STICK_X: 2, RIGHT_STICK_Y: 3
};
```

## Pointer Lock (FPS games)

```javascript
function setupPointerLock(element) {
    element.addEventListener('click', () => {
        element.requestPointerLock();
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === element) {
            // e.movementX, e.movementY = delta movement
            camera.rotation.y -= e.movementX * 0.002;
            camera.rotation.x -= e.movementY * 0.002;
        }
    });
}
```

## Input Buffering (for combos)

```javascript
class InputBuffer {
    constructor(bufferTime = 200) {
        this.buffer = [];
        this.bufferTime = bufferTime;
    }

    add(input) {
        this.buffer.push({ input, time: performance.now() });
        this.cleanup();
    }

    cleanup() {
        const now = performance.now();
        this.buffer = this.buffer.filter(i => now - i.time < this.bufferTime);
    }

    matches(sequence) {
        this.cleanup();
        const recent = this.buffer.map(i => i.input);
        return sequence.every((s, i) => recent[recent.length - sequence.length + i] === s);
    }
}
```
