# Camera System (Three.js)

## Camera Types

| Type | Three.js Class | Use Case |
|------|----------------|----------|
| Perspective | `PerspectiveCamera` | Standard 3D games |
| Orthographic | `OrthographicCamera` | 2D, isometric, UI |

## Basic Setup

```javascript
const camera = new THREE.PerspectiveCamera(
    70,                                    // FOV
    window.innerWidth / window.innerHeight, // Aspect
    0.1,                                   // Near clip
    1000                                   // Far clip
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
```

## Common Effects

### Camera Shake
```javascript
class CameraShake {
    constructor(camera) {
        this.camera = camera;
        this.basePosition = camera.position.clone();
        this.intensity = 0;
        this.decay = 0.95;
    }

    trigger(intensity = 0.5) {
        this.intensity = intensity;
    }

    update() {
        if (this.intensity > 0.01) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * this.intensity,
                (Math.random() - 0.5) * this.intensity,
                (Math.random() - 0.5) * this.intensity
            );
            this.camera.position.copy(this.basePosition).add(offset);
            this.intensity *= this.decay;
        } else {
            this.camera.position.copy(this.basePosition);
        }
    }
}
```

### Follow Target
```javascript
function followTarget(camera, target, offset, lerpFactor = 0.1) {
    const desiredPos = target.position.clone().add(offset);
    camera.position.lerp(desiredPos, lerpFactor);
    camera.lookAt(target.position);
}
```

### FOV Zoom
```javascript
function zoomFOV(camera, targetFOV, duration = 500) {
    const startFOV = camera.fov;
    const startTime = performance.now();

    function animate() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        camera.fov = startFOV + (targetFOV - startFOV) * t;
        camera.updateProjectionMatrix();
        if (t < 1) requestAnimationFrame(animate);
    }
    animate();
}
```

## FOV Guidelines

| State | FOV | Feel |
|-------|-----|------|
| Normal | 70 | Standard |
| Sprint | 80-85 | Speed sensation |
| Zoom/ADS | 30-50 | Focused |
| Cinematic | 50-60 | Dramatic |

## Orbit Controls (for debugging)

```javascript
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
```

## Cutscene System

```javascript
class Cutscene {
    constructor(camera, waypoints) {
        this.camera = camera;
        this.waypoints = waypoints; // [{position, lookAt, duration}]
        this.currentIndex = 0;
    }

    async play() {
        for (const wp of this.waypoints) {
            await this.moveTo(wp);
        }
    }

    moveTo({ position, lookAt, duration }) {
        return new Promise(resolve => {
            const startPos = this.camera.position.clone();
            const startTime = performance.now();

            const animate = () => {
                const t = Math.min((performance.now() - startTime) / duration, 1);
                const eased = t * t * (3 - 2 * t); // Smoothstep

                this.camera.position.lerpVectors(startPos, position, eased);
                this.camera.lookAt(lookAt);

                if (t < 1) requestAnimationFrame(animate);
                else resolve();
            };
            animate();
        });
    }
}
```
