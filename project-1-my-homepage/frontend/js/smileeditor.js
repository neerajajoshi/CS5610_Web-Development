// Interactive dental slider canvas

export class SmileEditor {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.container = document.getElementById(containerId);

    // Initial slider values
    this.brightness = 85;
    this.alignment = 0.9;
    this.smileWidth = 1.0;

    // Initial split X position
    this.splitX = 250;
    this.isDraggingSplit = false;

    // Preset cases
    this.currentPreset = "patient-1";
    this.presetData = {
      "patient-1": { skin: "hsl(25, 40%, 80%)", lips: "hsl(350, 60%, 55%)", gender: "F" },
      "patient-2": { skin: "hsl(30, 35%, 65%)", lips: "hsl(355, 55%, 45%)", gender: "M" },
      "patient-3": { skin: "hsl(20, 45%, 90%)", lips: "hsl(340, 65%, 60%)", gender: "F" },
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupListeners();
    this.render();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Center divider on load
    this.splitX = this.canvas.width / window.devicePixelRatio / 2;
  }

  setupListeners() {
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.render();
    });

    // Sync slider controls
    const brightnessInput = document.getElementById("smile-brightness");
    const alignmentInput = document.getElementById("smile-alignment");
    const widthInput = document.getElementById("smile-width");

    if (brightnessInput) {
      brightnessInput.addEventListener("input", (e) => {
        this.brightness = parseInt(e.target.value);
        this.render();
      });
    }
    if (alignmentInput) {
      alignmentInput.addEventListener("input", (e) => {
        this.alignment = parseFloat(e.target.value);
        this.render();
      });
    }
    if (widthInput) {
      widthInput.addEventListener("input", (e) => {
        this.smileWidth = parseFloat(e.target.value);
        this.render();
      });
    }

    // Preset toggle buttons
    const cards = document.querySelectorAll(".preset-card");
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        cards.forEach((c) => c.classList.remove("active"));
        const activeCard = e.currentTarget;
        activeCard.classList.add("active");
        this.currentPreset = activeCard.dataset.preset;
        this.render();
      });
    });

    // Handle mouse dragging
    this.canvas.addEventListener("mousedown", (e) => {
      const mousePos = this.getMousePos(e);
      // Drag range boundary
      if (Math.abs(mousePos.x - this.splitX) < 25) {
        this.isDraggingSplit = true;
        this.canvas.style.cursor = "ew-resize";
      }
    });

    window.addEventListener("mouseup", () => {
      if (this.isDraggingSplit) {
        this.isDraggingSplit = false;
        this.canvas.style.cursor = "default";
      }
    });

    window.addEventListener("mousemove", (e) => {
      const mousePos = this.getMousePos(e);

      // Set cursor type near divider
      if (!this.isDraggingSplit) {
        if (Math.abs(mousePos.x - this.splitX) < 25) {
          this.canvas.style.cursor = "ew-resize";
        } else {
          this.canvas.style.cursor = "default";
        }
      }

      if (this.isDraggingSplit) {
        const width = this.canvas.width / window.devicePixelRatio;
        this.splitX = Math.max(20, Math.min(width - 20, mousePos.x));
        this.render();
      }
    });

    // Touch screen dragging
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        const mousePos = this.getMousePos(e.touches[0]);
        if (Math.abs(mousePos.x - this.splitX) < 40) {
          this.isDraggingSplit = true;
        }
      }
    });

    this.canvas.addEventListener("touchmove", (e) => {
      if (this.isDraggingSplit && e.touches.length === 1) {
        const mousePos = this.getMousePos(e.touches[0]);
        const width = this.canvas.width / window.devicePixelRatio;
        this.splitX = Math.max(20, Math.min(width - 20, mousePos.x));
        this.render();
      }
    });

    this.canvas.addEventListener("touchend", () => {
      this.isDraggingSplit = false;
    });
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  render() {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Render before state
    this.drawScene(width, height, false);

    // Clip and render after state
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.splitX, 0, width - this.splitX, height);
    this.ctx.clip();

    this.drawScene(width, height, true);
    this.ctx.restore();

    // Divider line
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.splitX, 0);
    this.ctx.lineTo(this.splitX, height);
    this.ctx.stroke();

    // Central handle bubble
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(this.splitX, height / 2, 18, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Inside indicator arrows
    this.ctx.fillStyle = "black";
    this.ctx.font = "bold 14px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("↔", this.splitX, height / 2);
  }

  // Render mouth face elements
  drawScene(width, height, isAfter) {
    const preset = this.presetData[this.currentPreset];
    const isDark = !document.body.classList.contains("light-theme");

    // Reset base canvas
    this.ctx.fillStyle = isDark ? "#0d0f14" : "#f1f3f7";
    this.ctx.fillRect(0, 0, width, height);

    // Center pivot coordinates
    const cx = width / 2;
    const cy = height / 2;

    // Face base circle
    this.ctx.fillStyle = preset.skin;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - 20, 100, 0, Math.PI * 2);
    this.ctx.fill();

    // Neck base block
    this.ctx.fillStyle = preset.skin;
    this.ctx.fillRect(cx - 30, cy + 40, 60, 60);

    // Shoulders base shape
    this.ctx.fillStyle = isDark ? "#1b202e" : "#ccd1db";
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + 150, 140, 60, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = isDark ? "#1e293b" : "#475569";
    this.ctx.beginPath();
    this.ctx.arc(cx - 35, cy - 40, 8, 0, Math.PI * 2);
    this.ctx.arc(cx + 35, cy - 40, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner mouth cavity
    const mouthW = 100 * (isAfter ? this.smileWidth : 0.85);
    const mouthH = 35;

    this.ctx.fillStyle = "#1e0c0e";
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + 30, mouthW / 2, mouthH / 2, 0, 0, Math.PI);
    this.ctx.fill();

    // Teeth row layout
    const numTeeth = 8;
    const toothW = (mouthW / numTeeth) * 0.95;
    const toothH = 15;

    // Bright HSL for after, yellow HSL for before
    const brightness = isAfter ? this.brightness : 65;
    const saturation = isAfter ? 0 : 40;
    const hue = 48;
    this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${brightness}%)`;

    this.ctx.strokeStyle = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)";
    this.ctx.lineWidth = 1;

    for (let i = 0; i < numTeeth; i++) {
      const fraction = i / (numTeeth - 1); // 0.0 to 1.0
      const xOffset = -mouthW / 2 + fraction * mouthW;

      // Arch curve offset
      const angle = (fraction - 0.5) * Math.PI * 0.8;
      let yOffset = Math.cos(angle) * 8 - 4;

      // Misalign only on before state
      if (!isAfter) {
        yOffset += (i % 2 === 0 ? 3.5 : -2) * (1 - this.alignment);
      }

      this.ctx.save();
      this.ctx.translate(cx + xOffset + toothW / 4, cy + 20 + yOffset);

      // Tooth shape block
      this.ctx.beginPath();
      this.ctx.roundRect(0, 0, toothW, toothH, [1, 1, 4, 4]);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Lip framing curves
    this.ctx.strokeStyle = preset.lips;
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = "round";

    // Upper lip path
    this.ctx.beginPath();
    this.ctx.moveTo(cx - mouthW / 2, cy + 22);
    this.ctx.quadraticCurveTo(cx, cy + 18, cx + mouthW / 2, cy + 22);
    this.ctx.stroke();

    // Lower lip path
    this.ctx.beginPath();
    this.ctx.moveTo(cx - mouthW / 2, cy + 22);
    this.ctx.quadraticCurveTo(cx, cy + 45, cx + mouthW / 2, cy + 22);
    this.ctx.stroke();
  }
}
