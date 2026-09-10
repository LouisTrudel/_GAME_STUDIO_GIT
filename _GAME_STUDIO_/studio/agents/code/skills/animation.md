# Animation (Three.js)

## Animation Loop

```javascript
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();  // Time since last frame

    // Update animations
    mixer?.update(delta);

    // Update game logic
    updateGame(delta);

    renderer.render(scene, camera);
}
animate();
```

## Tweening (GSAP or manual)

### Manual Lerp
```javascript
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Usage in animation loop
object.position.x = lerp(object.position.x, targetX, 0.1);
```

### Easing Functions
```javascript
const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};
```

### Tween Class
```javascript
class Tween {
    constructor(object, property, target, duration, easing = Easing.easeOutQuad) {
        this.object = object;
        this.property = property;
        this.start = object[property];
        this.target = target;
        this.duration = duration;
        this.easing = easing;
        this.elapsed = 0;
        this.done = false;
    }

    update(delta) {
        if (this.done) return;

        this.elapsed += delta * 1000;
        const t = Math.min(this.elapsed / this.duration, 1);
        const easedT = this.easing(t);

        this.object[this.property] = this.start + (this.target - this.start) * easedT;

        if (t >= 1) this.done = true;
    }
}

// Usage
const tween = new Tween(mesh.position, 'y', 5, 500);
// In animation loop:
tween.update(delta);
```

## Three.js Animation System

### Load Animated Model
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
let mixer;

loader.load('character.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);

    // Play first animation
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
});
```

### Animation Control
```javascript
class AnimationController {
    constructor(model, animations) {
        this.mixer = new THREE.AnimationMixer(model);
        this.actions = {};

        for (const clip of animations) {
            this.actions[clip.name] = this.mixer.clipAction(clip);
        }

        this.current = null;
    }

    play(name, fadeTime = 0.3) {
        const next = this.actions[name];
        if (!next || next === this.current) return;

        if (this.current) {
            this.current.fadeOut(fadeTime);
        }

        next.reset().fadeIn(fadeTime).play();
        this.current = next;
    }

    update(delta) {
        this.mixer.update(delta);
    }
}

// Usage
const animator = new AnimationController(model, gltf.animations);
animator.play('idle');
animator.play('run');  // Crossfades from idle to run
```

## Timing Guidelines

| Animation Type | Duration |
|----------------|----------|
| Button hover | 100-150ms |
| UI panel | 200-300ms |
| Character action | 200-500ms |
| Camera move | 500-1000ms |
| Scene transition | 500-1500ms |

## Common Patterns

### Bounce
```javascript
function bounce(t) {
    if (t < 0.5) return 8 * t * t * t * t;
    return 1 - 8 * Math.pow(t - 1, 4);
}
```

### Pulse
```javascript
// In animation loop
const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.1;
mesh.scale.setScalar(pulse);
```

### Float/Bob
```javascript
const float = Math.sin(performance.now() * 0.002) * 0.5;
mesh.position.y = baseY + float;
```
