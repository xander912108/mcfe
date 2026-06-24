import { useRef, useCallback } from 'react';

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export function useCamera(canvasWidth: number, canvasHeight: number, initialZoom = 1) {
  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: initialZoom });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const cameraStartRef = useRef<Camera>({ x: 0, y: 0, zoom: initialZoom });

  const screenToWorld = useCallback(
    (sx: number, sy: number) => {
      const cam = cameraRef.current;
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      return {
        x: (sx - cx - cam.x) / cam.zoom + cx,
        y: (sy - cy - cam.y) / cam.zoom + cy,
      };
    },
    [canvasWidth, canvasHeight]
  );

  const applyTransform = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const cam = cameraRef.current;
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      ctx.translate(cam.x + cx, cam.y + cy);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cx, -cy);
    },
    [canvasWidth, canvasHeight]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent, canvas: HTMLCanvasElement | null) => {
      e.preventDefault();
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      const cam = cameraRef.current;
      const worldBefore = screenToWorld(sx, sy);

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.3, Math.min(3.0, cam.zoom * delta));

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      cam.x = sx - cx - (worldBefore.x - cx) * newZoom;
      cam.y = sy - cy - (worldBefore.y - cy) * newZoom;
      cam.zoom = newZoom;
    },
    [screenToWorld, canvasWidth, canvasHeight]
  );

  const startPan = useCallback((clientX: number, clientY: number) => {
    isPanningRef.current = true;
    panStartRef.current = { x: clientX, y: clientY };
    cameraStartRef.current = { ...cameraRef.current };
  }, []);

  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanningRef.current) return false;
    const dx = clientX - panStartRef.current.x;
    const dy = clientY - panStartRef.current.y;
    cameraRef.current.x = cameraStartRef.current.x + dx;
    cameraRef.current.y = cameraStartRef.current.y + dy;
    return true;
  }, []);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const wasDrag = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - panStartRef.current.x;
    const dy = clientY - panStartRef.current.y;
    return Math.hypot(dx, dy) > 5;
  }, []);

  const zoomIn = useCallback(() => {
    const cam = cameraRef.current;
    cam.zoom = Math.min(3.0, cam.zoom * 1.2);
  }, []);

  const zoomOut = useCallback(() => {
    const cam = cameraRef.current;
    cam.zoom = Math.max(0.3, cam.zoom / 1.2);
  }, []);

  const reset = useCallback(() => {
    cameraRef.current = { x: 0, y: 0, zoom: initialZoom };
  }, [initialZoom]);

  return {
    cameraRef,
    isPanningRef,
    screenToWorld,
    applyTransform,
    handleWheel,
    startPan,
    updatePan,
    endPan,
    wasDrag,
    zoomIn,
    zoomOut,
    reset,
  };
}
