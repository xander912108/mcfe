import { useCallback } from 'react';

// Shared caches across all topologies
const globalAvatarCache = new Map<string, HTMLCanvasElement>();
const globalPhotoCache = new Map<string, HTMLImageElement>();

// Generate deterministic gradient color from string
export function getAvatarColors(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash % 360);
  const h2 = (h + 30) % 360;
  return [`hsl(${h}, 55%, 35%)`, `hsl(${h2}, 50%, 25%)`];
}

// Generate gradient placeholder avatar (fallback when no photo)
export function getPlaceholderAvatar(
  nodeId: string,
  name: string,
  radius: number
): HTMLCanvasElement {
  const key = `${nodeId}_${radius}`;
  let canvas = globalAvatarCache.get(key);
  if (canvas) return canvas;

  const size = Math.ceil(radius * 2) + 4;
  canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext('2d')!;
  const cx = size / 2;

  // Gradient background
  const [c1, c2] = getAvatarColors(name);
  const grad = c.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  c.fillStyle = grad;
  c.beginPath();
  c.arc(cx, cx, radius, 0, Math.PI * 2);
  c.fill();

  // Initials
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.font = `bold ${Math.max(10, radius * 0.55)}px Inter, system-ui, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(initials, cx, cx + 1);

  globalAvatarCache.set(key, canvas);
  return canvas;
}

// Load photo avatar (with global caching)
export function loadPhoto(avatarUrl: string): HTMLImageElement | null {
  if (!avatarUrl) return null;
  if (globalPhotoCache.has(avatarUrl)) {
    const img = globalPhotoCache.get(avatarUrl)!;
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => globalPhotoCache.set(avatarUrl, img);
  img.onerror = () => globalPhotoCache.set(avatarUrl, new Image());
  img.src = avatarUrl;
  return null;
}

// Draw circular avatar inside node — photo if available, gradient placeholder otherwise
export function drawNodeAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  nodeId: string,
  name: string,
  avatar?: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, radius - 1), 0, Math.PI * 2);
  ctx.clip();

  // Try photo first
  const photo = avatar ? loadPhoto(avatar) : null;
  if (photo && photo.complete && photo.naturalWidth > 0) {
    const s = (radius - 1) * 2;
    ctx.drawImage(photo, x - radius + 1, y - radius + 1, s, s);
  } else {
    // No photo or not loaded yet — gradient placeholder
    const placeholder = getPlaceholderAvatar(nodeId, name, radius);
    ctx.drawImage(placeholder, x - radius - 2, y - radius - 2);
  }

  ctx.restore();
}

// Hook for topology components — returns draw function with caches
export function useNodeAvatars() {
  const drawAvatar = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      nodeId: string,
      name: string,
      avatar?: string
    ) => {
      drawNodeAvatar(ctx, x, y, radius, nodeId, name, avatar);
    },
    []
  );

  return { drawAvatar, drawNodeAvatar, getPlaceholderAvatar, loadPhoto, getAvatarColors };
}
// v1781934105
