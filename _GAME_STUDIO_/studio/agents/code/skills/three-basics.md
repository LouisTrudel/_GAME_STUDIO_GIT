# Three.js Fundamentals

## Minimal Setup

```javascript
import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
```

## Common Objects

### Mesh = Geometry + Material
```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x3498db });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### Geometries
| Type | Constructor |
|------|-------------|
| Box | `BoxGeometry(w, h, d)` |
| Sphere | `SphereGeometry(radius, wSeg, hSeg)` |
| Plane | `PlaneGeometry(w, h)` |
| Cylinder | `CylinderGeometry(rTop, rBot, h)` |

### Materials
| Type | Use For |
|------|---------|
| `MeshBasicMaterial` | No lighting, flat color |
| `MeshStandardMaterial` | PBR, realistic |
| `MeshPhongMaterial` | Shiny surfaces |
| `MeshLambertMaterial` | Matte, fast |

## Lighting

```javascript
// Ambient (everywhere)
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Directional (sun)
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

// Point (bulb)
const point = new THREE.PointLight(0xff9900, 1, 10);
point.position.set(0, 2, 0);
scene.add(point);
```

## Transformations

```javascript
// Position
mesh.position.set(x, y, z);
mesh.position.x = 5;

// Rotation (radians)
mesh.rotation.set(x, y, z);
mesh.rotation.y = Math.PI / 4;  // 45 degrees

// Scale
mesh.scale.set(2, 2, 2);  // Double size
mesh.scale.setScalar(0.5);  // Half size
```

## Groups

```javascript
const group = new THREE.Group();
group.add(mesh1);
group.add(mesh2);
scene.add(group);

// Transform group = transforms all children
group.position.x = 5;
group.rotation.y = Math.PI;
```

## Loading Models

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('model.glb', (gltf) => {
    scene.add(gltf.scene);
}, undefined, (error) => {
    console.error(error);
});
```

## Raycasting (Mouse Picking)

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        console.log('Clicked:', clicked);
    }
});
```

## Performance Tips

- Reuse geometries and materials
- Use `Object3D.visible = false` instead of removing
- Merge static meshes with `BufferGeometryUtils.mergeBufferGeometries`
- Use instancing for many identical objects
- Limit shadow-casting objects
