ReplicatedStorage/
├── Framework.luau <-- Core Loader Module
└── ModuleScripts/ <-- Shared Managers (Network, FormatUtils, etc.)
└── RemoteEvents/
└── SharedAssets/

ServerScriptService/
├── ServerLoader.server.luau <-- Server Entry Point
└── ServerScripts/ <-- Server-only Managers (DataStore, PlayerManager, etc.)

StarterPlayer/StarterPlayerScripts/
├── ClientLoader.client.luau <-- Client Entry Point
└── ClientScripts/ <-- Client-only Managers (UIManager, CameraManager, etc.)

### **1. CORE FOUNDATION (Universal Across ALL Genres)**

_These systems must run in 99% of professional Roblox games regardless of genre._

---

#### **Engine & Infrastructure**

##### **Data & Persistence**

- DataStoreServer
- MemoryStoreServer

##### **Core Gameplay & Player Management**

- BackpackClient / BackpackServer
- ChatClient / ChatServer
- FriendsClient / FriendsServer
- LoadingClient / LoadingServer
- NPCClient / NPCServer
- PlayerClient / PlayerServer
- PlayerToolClient / PlayerToolServer

##### **Monetization & Economy**

- DropTables
- RarityConfigs
- ShopClient / ShopServer

##### **Server Operations & Security**

- AdminPanelClient / AdminPanelServer
- AnalyticsServer
- AntiCheatClient / AntiCheatServer
- ServerControl
- TimeServer

##### **Engine Utilities & Physics**

- CollisionModule
- FormatUtils
- MathsUtils
- ObjectPoolModule
- RNG_Server

---

#### **UI, Audio & World Environment**

##### **User Interface & Settings**

- OptionsClient / OptionsServer
- UIClient / UIServer

##### **Audio Systems**

- AudioClient / AudioServer
- MusicClient / MusicServer

##### **World & Rendering**

- CameraClient
- FootstepClient
- LightingClient / LightingServer
- ParticlesModule
- PostProcessingClient
- ProxPromptClient / ProxPromptServer

---

#### **Optionals But Popular**

##### **Game Progression & Mechanics**

- AutoFarm / AutoClick Client / Server
- CheckpointClient / CheckpointServer
- CraftingRecipesHandler
- Rebirth / Prestige Client / Server
- XpClient / XpServer

##### **Entity & Companion Systems**

- AIClient / AIServer
- AuraClient / AuraServer
- CosmeticsClient / CosmeticsServer
- MutationModule / MutationData
- PetClient / PetServer

##### **World, Building & Physics Extensions**

- DestructionClient / DestructionServer
- PhysicsModule
- Plot / Base Client / Server
- RaycastHandler
- WeatherClient / WeatherServer
- WorldGenerator / TerrainModule

---
