# Notification System (JavaScript)

## Message Types

| Type | Color | Use For |
|------|-------|---------|
| info | `#ffffff` | General messages |
| success | `#2ecc71` | Confirmations |
| warning | `#f39c12` | Cautions |
| error | `#e74c3c` | Failures |

## Toast Notification Manager

```javascript
class NotificationManager {
    constructor(container) {
        this.container = container || this.createContainer();
        this.notifications = [];
        this.maxVisible = 5;
        this.lingerTime = 4500;  // ms
        this.fadeTime = 300;     // ms
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info') {
        // Check for duplicate - update count instead
        const duplicate = this.findDuplicate(message);
        if (duplicate) {
            duplicate.count++;
            duplicate.element.querySelector('.count').textContent =
                duplicate.count > 1 ? ` (x${duplicate.count})` : '';
            return;
        }

        // Remove oldest if at max
        if (this.notifications.length >= this.maxVisible) {
            this.dismiss(this.notifications[0]);
        }

        const notification = this.createNotification(message, type);
        this.notifications.push(notification);
        this.container.appendChild(notification.element);

        // Auto-dismiss
        setTimeout(() => this.dismiss(notification), this.lingerTime);
    }

    createNotification(message, type) {
        const colors = {
            info: '#ffffff',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };

        const el = document.createElement('div');
        el.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: ${colors[type]};
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid ${colors[type]};
            font-family: sans-serif;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
        `;
        el.innerHTML = `${message}<span class="count"></span>`;

        return { element: el, message, count: 1 };
    }

    findDuplicate(message) {
        return this.notifications.find(n => n.message === message);
    }

    dismiss(notification) {
        notification.element.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.element.remove();
            this.notifications = this.notifications.filter(n => n !== notification);
        }, this.fadeTime);
    }

    // Convenience methods
    info(msg) { this.show(msg, 'info'); }
    success(msg) { this.show(msg, 'success'); }
    warning(msg) { this.show(msg, 'warning'); }
    error(msg) { this.show(msg, 'error'); }
}

// Required CSS (add to stylesheet)
const notificationCSS = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes fadeOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
```

## Usage

```javascript
const notify = new NotificationManager();

// Show notifications
notify.success('Item purchased!');
notify.error('Not enough gold');
notify.warning('Inventory almost full');
notify.info('New quest available');
```

## Sound Integration

```javascript
class NotificationManager {
    // ... existing code ...

    playSound(type) {
        const sounds = {
            info: 'notify.mp3',
            success: 'success.mp3',
            warning: 'warning.mp3',
            error: 'error.mp3'
        };
        const audio = new Audio(`/sounds/${sounds[type]}`);
        audio.playbackRate = 0.9 + Math.random() * 0.2; // Slight variation
        audio.play();
    }

    show(message, type = 'info') {
        // ... existing code ...
        this.playSound(type);
    }
}
```
