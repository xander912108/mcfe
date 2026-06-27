export function drawPremiumCanvasLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    hovered?: boolean;
    darkMode?: boolean;
    font?: string;
    textColor?: string;
    mutedTextColor?: string;
    background?: string;
  } = {}
) {
  const {
    hovered = false,
    darkMode: _darkMode = true,
    font = '9px Inter, system-ui, sans-serif',
    textColor,
    mutedTextColor,
    background,
  } = options;

  ctx.save();
  ctx.font = font;
  const width = ctx.measureText(text).width;
  const paddingX = 4;
  const height = 14;
  const radius = 3;

  ctx.beginPath();
  ctx.roundRect(x - width / 2 - paddingX, y - height / 2, width + paddingX * 2, height, radius);
  void _darkMode;
  ctx.fillStyle = background ?? (hovered ? 'rgba(255,255,255,0.96)' : 'rgba(243,239,232,0.92)');
  ctx.fill();

  ctx.fillStyle = textColor ?? (hovered ? '#4f4638' : (mutedTextColor ?? '#555'));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawPremiumCanvasMetaLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  options: { font?: string } = {}
) {
  ctx.save();
  ctx.font = options.font ?? '8px Inter, system-ui, sans-serif';
  const width = ctx.measureText(text).width;
  const paddingX = 3;
  ctx.beginPath();
  ctx.roundRect(x - width / 2 - paddingX, y - 6, width + paddingX * 2, 12, 3);
  ctx.fillStyle = color + '20';
  ctx.fill();
  ctx.strokeStyle = color + '35';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.fillStyle = color + 'cc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}
