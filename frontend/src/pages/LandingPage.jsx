import { useEffect, useRef, useState } from 'react';

export default function LandingPage({ onStart }) {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const [showInteraction, setShowInteraction] = useState(true);
  const [fadeInteraction, setFadeInteraction] = useState(false);

  // WebGL Shader Animation initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = v_texCoord;
    
    // Vignette
    float vig = 16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vig = pow(vig, 0.25);
    
    // Grain
    float grain = hash(uv + fract(u_time)) * 0.08;
    
    // Deep Noir Background
    vec3 color = vec3(0.04, 0.04, 0.05);
    
    // Subtle overhead light cone
    vec2 lightPos = vec2(0.5, 0.9);
    float d = length(uv - lightPos);
    float light = smoothstep(0.8, 0.2, d);
    color += vec3(0.1, 0.08, 0.05) * light;
    
    color *= vig;
    color += grain;
    
    gl_FragColor = vec4(color, 1.0);
}`;

    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Title Mouse Tracking Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const title = titleRef.current;
      if (!title) return;
      const moveX = (e.clientX - window.innerWidth / 2) / 100;
      const moveY = (e.clientY - window.innerHeight / 2) / 100;
      title.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative h-screen w-full bg-surface overflow-hidden">
      
      {/* Immersive Layer 0: The WebGL Shader */}
      <div className="absolute inset-0 w-full h-full opacity-60" style={{ display: 'block' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* Layer 1: Background Scenery (City Windows) */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay overflow-hidden">
        <img
          className="w-full h-full object-cover filter brightness-[0.2] contrast-150 grayscale"
          alt="A dark, moody, cinematic 1940s film noir city skyline seen through massive office windows"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUV1uS_7mld1M851wN938nhwx92_MhFYBrtrvCKa_y3epB9i2lZnHHm3AD_fe--ZmiSHHdAzrKe9v5r-LCj7rDRCKu-OTSytHcfSJ7PKVrXMmAXMMdVZcjgrt39mcuNMHg7As4rMEKeP99c9DdNHa2ief45Okz5C1NMiTOeFmNEpLcqbiJ_Q0x8gFFQydo-C8lib4qxkdvJMBLF4NxavygtDkF0l8ytZBri7Na-W0roXahYpVgg_igYRBZnZ-eB0XHVlycBLJjnm0"
        />
        {/* Rain Streaks Overlay */}
        <div className="absolute inset-0">
          <div className="rain-streak" style={{ left: '10%', animationDelay: '0.1s', opacity: 0.4 }} />
          <div className="rain-streak" style={{ left: '30%', animationDelay: '0.5s', opacity: 0.2 }} />
          <div className="rain-streak" style={{ left: '55%', animationDelay: '1.2s', opacity: 0.3 }} />
          <div className="rain-streak" style={{ left: '80%', animationDelay: '0.8s', opacity: 0.5 }} />
          <div className="rain-streak" style={{ left: '95%', animationDelay: '2s', opacity: 0.1 }} />
        </div>
      </div>

      {/* Layer 2: Grain & Vignette Overlay */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      {/* Layer 3: The Detective Desk (Foreground) */}
      <main className="relative z-30 h-full w-full flex flex-col items-center justify-center light-flicker">
        {/* Desk surface */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-surface-container-low opacity-90 border-t border-outline-variant shadow-2xl" />

        {/* Hero Content Area */}
        <div className="relative z-40 flex flex-col items-center text-center max-w-[640px] animate-fade-in-up">
          {/* Title */}
          <h1
            ref={titleRef}
            className="font-display text-[48px] leading-[56px] font-bold text-secondary text-stamp mb-2 tracking-[0.2em] uppercase mix-blend-screen opacity-90"
          >
            DECEIVER
          </h1>
          {/* Subtitle */}
          <p className="font-label text-[12px] leading-[16px] font-semibold text-on-secondary-fixed-variant tracking-[0.4em] mb-8 opacity-80 uppercase">
            TRUST NO ONE. FIND THE TRAITOR.
          </p>
        </div>

        {/* Big CTA Button (positioned absolutely on the desk surface below the line) */}
        <div className="absolute bottom-[16%] z-45 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={onStart}
            className="dymo-button group relative px-24 py-8 bg-surface-container-highest border-2 border-secondary text-secondary font-label text-[18px] leading-[20px] font-bold uppercase tracking-widest hover:text-on-tertiary-fixed-variant hover:border-on-tertiary-fixed-variant transition-all duration-500 shadow-[8px_8px_0px_#000] cursor-pointer"
          >
            <span className="relative z-10">BEGIN INVESTIGATION</span>
            <div className="absolute inset-0 bg-on-tertiary-fixed-variant/0 group-hover:bg-on-tertiary-fixed-variant/10 transition-colors duration-500" />
            <div className="absolute -inset-1 bg-on-tertiary-fixed-variant/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Desk Items (Visual Props) */}
        <div className="absolute bottom-0 w-full h-1/3 flex justify-between items-end px-16 pb-16 pointer-events-none select-none">
          {/* Left Side: Folder and Glass */}
          <div className="flex items-end gap-12 pointer-events-auto">
            <div className="rotate-[-1.5deg] bg-[#d1c2a4] w-48 h-64 p-4 shadow-2xl border border-black/10 rounded-sm hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="border-b border-black/20 pb-2 mb-4">
                <span className="font-label text-[10px] text-black/60 uppercase font-semibold">Dossier: SV-402</span>
              </div>
              <div className="w-full h-32 bg-black/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-black/20 text-4xl">folder_shared</span>
              </div>
            </div>
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
              <div className="w-16 h-4 bg-secondary/20 rounded-full blur-sm mt-8" />
            </div>
          </div>

          {/* Right Side: Ashtray and Smoke */}
          <div className="flex items-end gap-8 pointer-events-auto">
            <div className="rotate-[2deg] w-32 h-16 bg-surface-variant border border-outline rounded-lg flex items-center justify-center shadow-lg hover:rotate-0 transition-all duration-300 cursor-pointer">
              <div className="w-1 h-8 bg-primary/40 rounded-full -rotate-45 relative">
                <div className="absolute top-0 w-1 h-1 bg-error rounded-full blur-[2px] animate-pulse" />
              </div>
            </div>
            <div className="font-body text-[14px] text-on-surface-variant/40 tracking-tighter mix-blend-color-dodge uppercase font-semibold">
              CASE NO. 0047 — CLASSIFIED
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-4 left-0 right-0 text-center z-50 pointer-events-auto">
          <p className="font-label text-[11px] font-semibold text-on-surface-variant/40 tracking-widest uppercase">
            Made with <span className="text-tertiary animate-pulse">❤️</span> by Gurkirat
          </p>
        </div>
      </main>

      {/* Invisible Layer for Audio Interaction (Standard Game UX) */}
      {showInteraction && (
        <div
          onClick={() => {
            setFadeInteraction(true);
            setTimeout(() => setShowInteraction(false), 1000);
          }}
          className={`fixed inset-0 z-[100] cursor-pointer group flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-1000 ${
            fadeInteraction ? 'opacity-0' : 'opacity-100'
          }`}
          id="interaction-layer"
        >
          <div className="text-secondary font-label text-[12px] font-semibold uppercase tracking-[0.5em] animate-pulse group-hover:scale-110 transition-transform">
            CLICK TO INITIALIZE
          </div>
        </div>
      )}
    </div>
  );
}
