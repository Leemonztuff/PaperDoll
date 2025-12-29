
import { NeuralNode, ForgeConfig, NeuralMacro } from './types';

export const ANATOMICAL_MACROS: NeuralMacro[] = [
  {
    id: 'macro-enhance',
    name: 'Enhance Volume',
    icon: 'ENHANCE',
    description: 'Unlock M4/M19 for anatomical expansion.',
    nodesToDisable: ['m4', 'm19'],
    mutationStrength: 85,
    promptSuffix: 'enhanced anatomical volume, curvy physique, expanded chest area',
    color: 'from-pink-600 to-indigo-600'
  },
  {
    id: 'macro-reduce',
    name: 'Slim / Reduce',
    icon: 'REDUCE',
    description: 'Unlock M4/M19 for anatomical reduction.',
    nodesToDisable: ['m4', 'm19'],
    mutationStrength: 75,
    promptSuffix: 'slender physique, reduced anatomical volume, thin waist',
    color: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'macro-lock',
    name: 'Production Lock',
    icon: 'LOCK',
    description: 'Relock all anatomical nodes for gear-only synthesis.',
    nodesToDisable: [],
    mutationStrength: 40,
    promptSuffix: '',
    color: 'from-slate-700 to-slate-900'
  }
];

export const INITIAL_NEURAL_CHAIN: NeuralNode[] = [
  // MODULES 1-8: ENGINE CORE
  { id: 'm1', label: '1. ENGINE CORE', description: 'Main evolution logic.', instruction: 'ROLE: SpriteForge RPG Engine. evolve existing pixel-art into new outfit version. Preserve identity/anatomy.', isActive: true, isLocked: true },
  { id: 'm2', label: '2. IDENTITY ANCHOR', description: 'Canonical lock.', instruction: 'Preserve face, eyes, hair, proportions, pose. Redesigning forbidden.', isActive: true },
  { id: 'm3', label: '3. STYLE DNA', description: 'Pixel logic.', instruction: 'Analyze pixel scale, shading, dithering, outline. Follow same pixel-art rules.', isActive: true },
  { id: 'm4', label: '4. ANATOMY CLAMP', description: 'Clothing only.', instruction: 'Do not modify chest, waist, hips, leg length, shoulder width. Only clothing changes.', isActive: true },
  { id: 'm5', label: '5. SILHOUETTE LOCK', description: 'Shape preservation.', instruction: 'Generated pixels must remain inside base silhouette. Distortion forbidden.', isActive: true },
  { id: 'm6', label: '6. OUTFIT OVERLAY', description: 'Gear logic.', instruction: 'Change clothing, armor, boots, gloves. Do not modify skin, face or hair.', isActive: true },
  { id: 'm7', label: '7. PALETTE BINDER', description: 'Color sync.', instruction: 'Extract original palette. Derive new colors from it. Max +2 tones per group.', isActive: true },
  { id: 'm8', label: '8. OUTPUT RULES', description: 'Final format.', instruction: 'Return only final pixel-art. Transparent background. No explanations.', isActive: true },

  // MODULES 9-14: PIXELGUARD™
  { id: 'm9', label: '9. BASE MASK', description: 'Silhouette mask.', instruction: 'Extract binary silhouette mask. White=character, Transparent=background.', isActive: true },
  { id: 'm11', label: '11. OUTPUT MASK', description: 'Mask validation.', instruction: 'Extract silhouette mask from generated sprite for comparison.', isActive: true },
  { id: 'm12', label: '12. CONTOUR COMP', description: 'Diff check.', instruction: 'Compare OUTPUT_MASK to BASE_MASK. Reject if deviation > 2 pixels.', isActive: true },
  { id: 'm14', label: '14. PIXELGUARD GATE', description: 'Gatekeeper.', instruction: 'Only allow outputs that pass silhouette validation.', isActive: true },

  // MODULES 15-18: IDENTITY DNA LOCK™
  { id: 'm15', label: '15. FACE ANCHOR', description: 'Facial pixels.', instruction: 'Lock eye shape, position, facial pixels and expression.', isActive: true },
  { id: 'm16', label: '16. HAIR LOCK', description: 'Style lock.', instruction: 'Lock hairstyle and hair silhouette.', isActive: true },
  { id: 'm17', label: '17. SKIN LOCK', description: 'Tone lock.', instruction: 'Lock base skin palette.', isActive: true },

  // MODULES 19-22: BODY MORPHOLOGY LOCK™
  { id: 'm19', label: '19. TORSO LOCK', description: 'Volume lock.', instruction: 'Preserve chest volume and ribcage curvature.', isActive: true },
  { id: 'm20', label: '20. HIP LOCK', description: 'Curvature lock.', instruction: 'Preserve hip width and waist curvature.', isActive: true },
  { id: 'm21', label: '21. LIMB LOCK', description: 'Mass lock.', instruction: 'Preserve arm and leg thickness.', isActive: true },

  // MODULES 24-29: 🎨 PIXEL HARMONIZER™
  { id: 'm24', label: '24. PALETTE EXTRACT', description: 'Final remap.', instruction: 'Extract exact color palette from base sprite as BASE_PALETTE.', isActive: true },
  { id: 'm25', label: '25. COLOR REMAP', description: 'Constraint.', instruction: 'Remap every generated pixel to the closest color in BASE_PALETTE.', isActive: true },
  { id: 'm26', label: '26. NOISE CLEANER', description: 'Cleanup.', instruction: 'Remove isolated pixels and micro-noise. Unify flat regions.', isActive: true },
  { id: 'm27', label: '27. OUTLINE UNIFY', description: 'Stroke lock.', instruction: 'Normalize outline thickness to match base sprite.', isActive: true },
  { id: 'm28', label: '28. TRANS PURITY', description: 'Alpha lock.', instruction: 'Ensure background is 100% transparent. Remove artifacts.', isActive: true }
];

export const DEFAULT_CONFIG: ForgeConfig = {
  model: 'gemini-2.5-flash-image',
  size: '1K',
  aspectRatio: '1:1',
  mutationStrength: 50,
  mode: 'Master',
  protocols: {
    backgroundStyle: 'magenta',
    pixelPerfect: true,
    strongOutline: true,
    hd2dStyle: true
  },
  neuralChain: INITIAL_NEURAL_CHAIN
};

export const QUICK_TAGS = [
  { category: "RPG Classes", tags: ["Heavy Knight", "Shadow Assassin", "High Mage", "Paladin", "Dragoon", "Necromancer"] },
  { category: "Theme", tags: ["Cyberpunk", "Medieval", "Ethereal", "Demonic", "Steampunk", "Norse Mythology"] },
  { category: "VFX", tags: ["Aura", "Particles", "Glowing Eyes", "Runes", "Lightning", "Ice Shards"] }
];
