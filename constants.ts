
import { AspectRatio, ModelType } from './types';

export const QUICK_TAGS = [
  {
    category: "Slots: Torso & Head",
    tags: ["Royal Tiara", "Plate Pauldrons", "Underboob Bikini Armor", "Gothic Choker", "Lace Bodice", "Valkyrie Helm", "Capelet", "Boobplate"]
  },
  {
    category: "Slots: Arms & Legs",
    tags: ["Thigh-High Armor Boots", "Silk Stockings", "Garter Straps", "Gauntlets", "Detached Sleeves", "Arm-warmers", "Gladiator Sandals"]
  },
  {
    category: "Materiales JRPG",
    tags: ["Polished Damascus", "Glossy Black Latex", "Ornate Gold Filigree", "Translucent Silk", "Dragon Leather", "Crimson Velvet"]
  },
  {
    category: "Aesthetics",
    tags: ["Queen's Blade Style", "Death Metal Fantasy", "Cyber-Gothic Anime", "Sacred Knight", "Dark Succubus", "Battle Damaged"]
  },
  {
    category: "VFX / Detalles",
    tags: ["Glowing Runes", "Floating Gems", "Feather Particles", "Shadow Aura", "Lightning Sparks", "Petal Wind"]
  }
];

export const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export const MODEL_OPTIONS: { id: ModelType; label: string; color: string }[] = [
  { id: 'gemini-2.5-flash-image', label: 'NEURAL FLASH', color: 'indigo' },
  { id: 'gemini-3-pro-image-preview', label: 'NEURAL PRO', color: 'purple' }
];
