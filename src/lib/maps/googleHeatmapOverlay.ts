/**
 * High-performance Google Maps Canvas Heatmap Overlay.
 *
 * Implements a 2-pass Gaussian density accumulation & gradient colorization
 * on top of google.maps.OverlayView.
 * 
 * Works seamlessly with Google Maps JavaScript API (any version, including 3.65+),
 * immune to legacy HeatmapLayer deprecation, and hardware accelerated.
 */

export interface HeatPoint {
  lat: number;
  lng: number;
  weight: number; // 0..1
}

export interface HeatmapOptions {
  radius?: number;
  blur?: number;
  opacity?: number;
  maxIntensity?: number;
  gradient?: Record<number, string>;
}

const DEFAULT_GRADIENT: Record<number, string> = {
  0.15: "rgba(22, 163, 74, 0.45)",   // Green (Low risk)
  0.40: "rgba(132, 204, 22, 0.65)",  // Lime
  0.60: "rgba(245, 158, 11, 0.80)",  // Amber (Med risk)
  0.78: "rgba(249, 115, 22, 0.90)",  // Orange
  0.95: "rgba(220, 38, 38, 0.98)",   // Crimson Red (High risk)
  1.00: "rgba(153, 27, 27, 1.00)",   // Deep Crimson
};

export class GoogleHeatmapOverlay {
  private overlay: google.maps.OverlayView | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private points: HeatPoint[] = [];
  private map: google.maps.Map | null = null;

  private radius: number = 42;
  private blur: number = 24;
  private opacity: number = 0.78;
  private maxIntensity: number = 1.0;
  private gradientTable: Uint8ClampedArray | null = null;
  private circleCanvas: HTMLCanvasElement | null = null;

  constructor(options?: HeatmapOptions) {
    if (options?.radius) this.radius = options.radius;
    if (options?.blur) this.blur = options.blur;
    if (options?.opacity) this.opacity = options.opacity;
    if (options?.maxIntensity) this.maxIntensity = options.maxIntensity;
    this.createGradient(options?.gradient ?? DEFAULT_GRADIENT);
    this.createCircle();
  }

  private createGradient(grad: Record<number, string>) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 256;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const g = ctx.createLinearGradient(0, 0, 0, 256);
    for (const stop in grad) {
      g.addColorStop(Number(stop), grad[stop]!);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1, 256);
    this.gradientTable = ctx.getImageData(0, 0, 1, 256).data;
  }

  private createCircle() {
    const r = this.radius;
    const blur = this.blur;
    const totalR = r + blur;
    const c = (this.circleCanvas = document.createElement("canvas"));
    c.width = c.height = totalR * 2;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.shadowOffsetX = ctx.shadowOffsetY = totalR * 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = "black";

    ctx.beginPath();
    ctx.arc(-totalR, -totalR, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  public setMap(map: google.maps.Map | null) {
    if (this.map === map) return;

    if (this.overlay) {
      this.overlay.setMap(null);
      this.overlay = null;
    }

    this.map = map;
    if (!map || !window.google?.maps?.OverlayView) return;

    const self = this;
    const CustomOverlay = class extends window.google.maps.OverlayView {
      override onAdd() {
        const canvas = (self.canvas = document.createElement("canvas"));
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "10";
        self.ctx = canvas.getContext("2d", { willReadFrequently: true });
        this.getPanes()?.overlayLayer.appendChild(canvas);
      }

      override draw() {
        self.drawOverlay();
      }

      override onRemove() {
        if (self.canvas && self.canvas.parentNode) {
          self.canvas.parentNode.removeChild(self.canvas);
        }
        self.canvas = null;
        self.ctx = null;
      }
    };

    this.overlay = new CustomOverlay();
    this.overlay.setMap(map);
  }

  public setData(points: HeatPoint[]) {
    this.points = points;
    if (this.overlay) {
      this.drawOverlay();
    }
  }

  public setOptions(opts: HeatmapOptions) {
    if (opts.radius !== undefined) this.radius = opts.radius;
    if (opts.blur !== undefined) this.blur = opts.blur;
    if (opts.opacity !== undefined) this.opacity = opts.opacity;
    if (opts.maxIntensity !== undefined) this.maxIntensity = opts.maxIntensity;
    if (opts.gradient) this.createGradient(opts.gradient);
    this.createCircle();
    this.drawOverlay();
  }

  private drawOverlay() {
    if (!this.overlay || !this.canvas || !this.ctx || !this.map || !this.circleCanvas || !this.gradientTable) {
      return;
    }

    const projection = this.overlay.getProjection();
    if (!projection) return;

    const bounds = this.map.getBounds();
    if (!bounds) return;

    const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
    const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
    if (!ne || !sw) return;

    const padding = (this.radius + this.blur) * 2;
    const left = Math.min(sw.x, ne.x) - padding;
    const top = Math.min(sw.y, ne.y) - padding;
    const width = Math.abs(ne.x - sw.x) + padding * 2;
    const height = Math.abs(sw.y - ne.y) + padding * 2;

    if (width <= 0 || height <= 0) return;

    this.canvas.style.left = `${left}px`;
    this.canvas.style.top = `${top}px`;
    this.canvas.width = Math.round(width);
    this.canvas.height = Math.round(height);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const totalR = this.radius + this.blur;
    const zoom = this.map.getZoom() ?? 12;
    const zoomScale = Math.max(0.65, Math.min(1.8, Math.pow(1.15, zoom - 12)));

    // Pass 1: Draw grayscale Gaussian circles weighted by risk score
    for (const pt of this.points) {
      const pos = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(pt.lat, pt.lng));
      if (!pos) continue;

      const x = pos.x - left;
      const y = pos.y - top;

      if (x < -totalR || x > this.canvas.width + totalR || y < -totalR || y > this.canvas.height + totalR) {
        continue;
      }

      const weight = Math.max(0.05, Math.min(1.0, pt.weight / this.maxIntensity));
      ctx.globalAlpha = weight;
      
      const drawSize = totalR * 2 * zoomScale;
      ctx.drawImage(
        this.circleCanvas,
        x - drawSize / 2,
        y - drawSize / 2,
        drawSize,
        drawSize,
      );
    }

    // Pass 2: Colorize pixels via Gradient Lookup Table
    try {
      const img = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = img.data;
      const grad = this.gradientTable;
      const baseOpacity = this.opacity;

      for (let i = 0, len = data.length; i < len; i += 4) {
        const a = data[i + 3]!;
        if (a > 0) {
          const offset = a * 4;
          data[i] = grad[offset]!;       // R
          data[i + 1] = grad[offset + 1]!; // G
          data[i + 2] = grad[offset + 2]!; // B
          data[i + 3] = Math.round(a * baseOpacity); // A
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.putImageData(img, 0, 0);
    } catch {
      // In case of cross-origin or canvas read issues, fallback gracefully
    }
  }
}
