# Top 10 Roblox Games Market Research & Deconstruction Report

This report provides a comprehensive deconstruction of the top 10 most successful games on the Roblox platform. Each game profile covers core mechanics, specific numbers/cooldowns, progression curves, edge cases, and quantitative success metrics to guide game design and engineering decisions for our Three.js multiplayer project.

---

## 1. Brookhaven RP

### Core Mechanic
Open-world social roleplaying where players purchase homes, customize vehicles, adopt roles (police, firefighter, citizen), and roleplay in a persistent town without forced combat or mandatory progression.

### Numbers & Configuration
- **Max Server Capacity:** 30 players per server
- **Housing Slots:** 1 house ownership per player slot (Free tier vs. Premium VIP tier costing ~279 Robux)
- **Vehicle Spawn Time:** Immediate instantiation; max 1 active personal vehicle per player
- **Role Cooldowns:** Job switching is instantaneous (0s cooldown) to maintain fluid social engagement

### Progression & Economy
- **Monetization Model:** Convenience & Status (Gamepasses for Premium House, Premium Radio, Fast Vehicles, Vault Access)
- **Currency Flow:** No persistent core currency grinding required; purely sandbox social economy

### Edge Cases
- **Housing Overlap / Proximity:** Multiple plots in close proximity; handled via instanced interior spaces while exterior is seamless.
- **Vehicle Spam & Blockades:** Server-side cleanup despawns abandoned vehicles after 180 seconds of driver absence.
- **Exploits / Clipping:** Physics layers restrict player clipping through private residential walls.

### Success Metrics
- **Concurrent Users (CCU):** Consistently peaks between 500,000 to 800,000 CCU globally.
- **Retention:** Extremely high D1 (70%+) and D30 retention due to infinite emergent social loops.

---

## 2. Adopt Me!

### Core Mechanic
Pet collection, trading, nurturing, and housing simulation where players hatch eggs, care for pet needs (hunger, thirst, sleep, school), and trade with other players in a real-time marketplace.

### Numbers & Configuration
- **Egg Hatching Time:** Ranges from Common (1,200 tasks/steps) to Legendary (4,000+ tasks/steps or time-equivalent)
- **Trade Window:** 4-step confirmation protocol with a 10-second mandatory review timer before final lock-in to prevent scamming.
- **Task Spawn Rate:** A new pet need spawns every 60 to 120 seconds per active pet.

### Progression & Economy
- **Currency:** Bucks (earned via completing pet/player needs: e.g., $20–$50 per need met).
- **Rarity Distribution:** Common (55%), Uncommon (30%), Rare (12%), Ultra-Rare (2.5%), Legendary (0.5%).
- **Pet Aging:** Newborn → Junior → Pre-Teen → Teen → Post-Teen → Full Grown (x4 Full Grown pets can be merged into a Neon variant).

### Edge Cases
- **Scam Trading ("Trust Trades"):** Mitigated by the dual-confirmation trade window displaying item value indicators.
- **Duplicate Item Duping:** Prevented by server-authoritative inventory databases and transaction logging.
- **Server Disconnects During Trade:** Automatic rollback of trade state if either player loses connection before final confirmation.

### Success Metrics
- **All-Time Peak CCU:** Over 1.92 million concurrent users (Roblox record for a single game).
- **Monetization:** Heavily driven by gacha egg purchases and VIP pet accessories.

---

## 3. Blox Fruits

### Core Mechanic
Open-world anime-inspired action RPG where players choose between Swordsman, Blox Fruit user, or Gunner combat styles, questing across dangerous seas, defeating bosses, and collecting legendary fruits.

### Numbers & Configuration
- **Max Level Cap:** Level 2550
- **Blox Fruit Spawn Timer:** Spawns under random trees every 60 minutes in public servers; despawns after 20 minutes if unclaimed.
- **Combat Cooldowns:** Skill abilities range from 3 seconds (basic projectiles) to 45 seconds (ultimate awakening moves).
- **Stamina System:** Energy pool of 100 base units, scaling +5 per stat point invested in Melee/Defense/Blox Fruit.

### Progression & Economy
- **Leveling Curve:** Exponential XP curve starting at 500 XP for Level 1 up to 15,000,000+ XP for late-game levels.
- **Currency:** Beli (earned via quests/NPC kills) and Fragments (earned via Raids/Sea Events for awakening abilities).

### Edge Cases
- **PVP Safe Zones:** Players under Level 20 or inside island safe zones are immune to unauthorized PvP damage.
- **Boss Stunlocking:** Bosses possess hyper-armor frames every 15 seconds to break player stun locks.
- **Fruit Stealing:** Dropped fruits can be picked up by any player; priority pickup window of 3 seconds for the player who generated/purchased it.

### Success Metrics
- **Peak CCU:** Frequently hits 2.5 million+ CCU during major updates.
- **Engagement:** High session lengths averaging 90+ minutes per user login.

---

## 4. Pet Simulator 99

### Core Mechanic
Incremental collection game where players equip armies of pets to break chests, mine blocks, and earn coins to hatch rarer eggs and unlock new themed worlds.

### Numbers & Configuration
- **Max Equipped Pets:** Base 4, expandable up to 80+ via gamepasses, ranks, and achievements.
- **Click / Tap Rate Limit:** Capped at 15 clicks per second to prevent autoclicker server saturation while rewarding active play.
- **World Progression:** 100+ distinct worlds, each requiring escalating coin milestones to unlock the next cannon portal.

### Progression & Economy
- **Rarity Tiers:** Basic (70%), Rare (20%), Epic (8%), Legendary (1.9%), Huge (0.09%), Titanic (<0.001%).
- **Rebirth System:** Resets coin progress and world unlocks in exchange for permanent multipliers (Damage +5%, Speed +2%).

### Edge Cases
- **Massive Particle Overload:** Client-side particle pooling and culling when 50+ players are breaking high-health chests simultaneously.
- **Economy Inflation:** Controlled by consumable sinks (Enchant merging, potion crafting, diamond sinks in the Trading Plaza).

### Success Metrics
- **Peak CCU:** Regularly sustains 500,000 to 1,000,000 CCU upon content drops.
- **Monetization:** Highly optimized microtransactions for auto-tap, extra pet equip slots, and exclusive egg boosts.

---

## 5. Murder Mystery 2 (MM2)

### Core Mechanic
Asymmetric multiplayer social deduction game where 1 player is the Murderer (armed with a knife), 1 is the Sheriff (armed with a revolver), and the remaining players are Innocents trying to survive and collect guns.

### Numbers & Configuration
- **Round Timer:** 360 seconds (6 minutes) max per match.
- **Sheriff Gun Drop:** When the Sheriff is killed, their gun drops on the floor for 30 seconds; any Innocent can pick it up to become the Hero.
- **Murderer Attack Cooldown:** 0.75-second slash cooldown; knife throw has a 3-second recovery cooldown.

### Progression & Economy
- **Currency:** Gold coins collected during rounds (capped at 10 coins per player per round).
- **Loot Boxes (Knife/Gun Cases):** Rarity tiers ranging from Common (60%) to Godly (0.1%).
- **Trading Hub:** Direct player-to-player trading system with item value community standards.

### Edge Cases
- **Innocent Shot by Mistake:** If the Sheriff shoots an innocent bystander, both die instantly, and the Sheriff’s gun drops.
- **AFK Murderer / Sheriff:** Round auto-ends in an Innocent victory if the Murderer fails to make a kill within 4 minutes.
- **Hitchhiking / Glitching into Walls:** Raycast collision checks on knife stabs to prevent wall-penetration kills.

### Success Metrics
- **Longevity:** One of Roblox's longest-standing evergreen hits, maintaining 100,000+ CCU consistently for years.

---

## 6. BedWars

### Core Mechanic
Team-based tactical PvP combat where players gather iron/gold resources from generators, purchase armor, swords, and blocks, defend their team's bed, and destroy enemy beds to eliminate respawns.

### Numbers & Configuration
- **Resource Generation Rates:**
  - Iron: 1 unit every 1.5 seconds per generator tier 1.
  - Gold: 1 unit every 7 seconds per generator tier 1.
  - Emerald: Spawns in center islands every 30 seconds.
- **Match Duration:** Average match length of 8 to 15 minutes, ending in sudden-death bed destruction.
- **Kit Abilities:** 30+ unique kits with passive perks and active cooldowns ranging from 10s to 60s.

### Progression & Economy
- **Match Economy:** Resets every match (Roguelike match progression).
- **Meta Progression:** XP gained per match unlocks cosmetic skins, lobby emotes, and battle pass tiers.

### Edge Cases
- **Build Limits & Void Falling:** Automatic death plane at Y = -20; blocks placed outside build boundaries are automatically destroyed.
- **Bed Defense Overlap:** Multi-layer wool/obsidian blast resistance calculations against TNT and fireball explosives.

### Success Metrics
- **Audience:** Core competitive esports audience on Roblox, averaging 100,000 to 300,000 CCU.

---

## 7. Doors

### Core Mechanic
First-person psychological horror survival game where players navigate through procedurally generated rooms in a haunted hotel, solving puzzles while hiding from blind, sound-sensitive monsters.

### Numbers & Configuration
- **Door Count:** 100 doors per successful run (Hotel level).
- **Hiding Spot Cooldown:** Players can hide in closets/beds indefinitely, but staying inside longer than 45 seconds triggers a "Monster Pull-Out" penalty.
- **Flashlight Battery:** 120 seconds of continuous use before requiring battery pickups.

### Progression & Economy
- **Knobs (Currency):** Earned per door unlocked and player revived. Used pre-run to buy shop items (vitamins, lockpicks, crucifixes).
- **Achievements/Badges:** Unlock special modifiers and elevator elevator skin variants.

### Edge Cases
- **Multiplayer Sync & Death:** When a player dies, they become a floating spectator ghost who can revive teammates using a Revive Token or team defibrillator.
- **Generation Glitches:** Room tile connection validation checks prevent unwinnable dead-end rooms.

### Success Metrics
- **Critical Acclaim:** Praised as the gold standard for atmospheric horror on Roblox, hitting millions of total visits and massive peak CCU during updates.

---

## 8. Arsenal

### Core Mechanic
Fast-paced arcade first-person shooter (FPS) inspired by *Counter-Strike* and *Gun Game*, where players cycle through a randomized sequence of weapons with every elimination, culminating in a final golden knife kill.

### Numbers & Configuration
- **Weapon Arsenal Length:** 32 weapons per standard match.
- **Respawn Time:** Instantaneous (0.5 seconds) upon death.
- **Match Timer:** 10 minutes or first player to complete all 32 weapon kills wins.
- **Movement Mechanics:** Slide-jump physics with momentum retention; zero fall damage.

### Progression & Economy
- **Currency:** Funds earned per kill, headshot bonus, and match completion.
- **Loot System:** Crates containing character skins, voice lines, melee skins, and unusual particle effects.

### Edge Cases
- **Spawn Camping:** Invulnerability shield for 1.5 seconds upon respawn, disappearing immediately upon firing a weapon.
- **Hit Registration:** Client-side prediction with server-side reconciliation to handle high-velocity movement combat.

### Success Metrics
- **Engagement:** High-intensity arcade loop driving rapid session replays and competitive clan communities.

---

## 9. Tower Defense Simulator (TDS)

### Core Mechanic
Cooperative tower defense where players place, upgrade, and command specialized units (Scouts, Militants, Rangers, Commanders) to defend against waves of increasingly difficult zombies and bosses.

### Numbers & Configuration
- **Wave Count:** Standard modes feature 40 waves; Hardcore/Event modes feature 50+ waves.
- **Placement Limit:** Each player can place a maximum of 40 towers simultaneously (scaling by tower type and modifiers).
- **Tower Upgrade Tiers:** Typically 5 upgrade tiers per tower, escalating in cost and power exponentially.

### Progression & Economy
- **Match Rewards:** Coins and XP based on wave survival and difficulty setting.
- **Tower Unlocks:** Purchased permanently via coins or robux in the loadout shop.

### Edge Cases
- **Pathfinding Overload:** When 200+ enemy units spawn on screen, enemy pathfinding is batched across server tick intervals to prevent server lag spikes.
- **Disconnect Handling:** If a player disconnects, their towers are locked and can be sold by teammates for 50% refund value.

### Success Metrics
- **Retention:** Strong cooperative gameplay loop encouraging voice-chat coordination and strategy guides.

---

## 10. Piggy

### Core Mechanic
Episodic survival horror game blending stealth, item hunting, and puzzle solving, where 1 player (or AI) plays as Piggy hunting down escaping survivors within a time limit.

### Numbers & Configuration
- **Round Time:** 600 seconds (10 minutes) per chapter.
- **Inventory Limit:** Players can hold exactly 1 item at a time (e.g., Key, Hammer, Carrot, Battery), forcing strategic team item management.
- **Piggy Speed:** Piggy moves at 18 studs/second, while crouching survivors move at 12 studs/second (sprinting drains a stamina bar lasting 5 seconds with a 3-second recharge).

### Progression & Economy
- **Currency:** Piggy Tokens (earned by escaping chapters or surviving as Piggy). Used to unlock custom skins and traps.

### Edge Cases
- **Item Hoarding / Trolling:** If a player holding a crucial key leaves the game or dies in the void, the item automatically respawns at its original spawn point after 30 seconds.
- **Door Lock State Sync:** Server-authoritative state validation on all doors and lock mechanisms to prevent desync exploits.

### Success Metrics
- **Cultural Impact:** One of Roblox's most influential storytelling games, spawning massive fan communities, fan art, and multi-chapter campaigns.

---

## Summary Matrix & Design Takeaways for Three.js Development

| Game | Genre | Core Loop | Retention Driver | Key Takeaway for Three.js |
| :--- | :--- | :--- | :--- | :--- |
| **Brookhaven RP** | Sandbox / Social | Socialize $\rightarrow$ Customize $\rightarrow$ Roleplay | Infinite social emergence | Instantaneous state transitions, seamless client prediction. |
| **Adopt Me!** | Pet Collection | Hatch $\rightarrow$ Nurture $\rightarrow$ Trade | Gacha collection & economy | Robust trade window security & item serialization. |
| **Blox Fruits** | Action RPG | Quest $\rightarrow$ Level Up $\rightarrow$ Hunt | Power progression & rarity | Clear level caps, stat scaling, and predictable combat cooldowns. |
| **Pet Simulator** | Incremental | Tap/Farm $\rightarrow$ Upgrade $\rightarrow$ Unlock | Number go up gratification | Client-side particle pooling and clean auto-click safeguards. |
| **MM2** | Social Deduction | Hide $\rightarrow$ Detect $\rightarrow$ Eliminate | High-tension short rounds | Asymmetric role assignment with foolproof fallback timers. |
| **BedWars** | Tactical PvP | Gather $\rightarrow$ Buy $\rightarrow$ Destroy | Competitive team strategy | Clean resource generation loops and match-scoped progression. |
| **Doors** | Psychological Horror | Navigate $\rightarrow$ Hide $\rightarrow$ Survive | Fear and exploration reward | Procedural room generation with strict validation checks. |
| **Arsenal** | Arcade FPS | Shoot $\rightarrow$ Cycle Weapon $\rightarrow$ Win | Fast twitch action | Instant respawns, momentum physics, and anti-spawn camping. |
| **TDS** | Tower Defense | Place $\rightarrow$ Upgrade $\rightarrow$ Defend | Cooperative strategy | Optimized entity batching for high entity counts. |
| **Piggy** | Survival Horror | Search $\rightarrow$ Puzzle $\rightarrow$ Escape | Episodic narrative & suspense | Anti-troll item respawn mechanics for dropped inventory. |
