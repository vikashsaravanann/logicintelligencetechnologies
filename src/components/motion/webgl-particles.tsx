"use client";

import { useEffect, useRef } from "react";

/**
 * Tiny WebGL point field. No Three.js — one buffer, one program.
 * Skips when WebGL is missing or the user prefers reduced motion.
 */
export default function WebGLParticles({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vs = `
      attribute vec2 a_pos;
      attribute float a_size;
      uniform float u_t;
      varying float v_a;
      void main() {
        float y = a_pos.y + 0.04 * sin(u_t * 0.35 + a_pos.x * 6.0);
        float x = a_pos.x + 0.025 * cos(u_t * 0.22 + a_pos.y * 5.0);
        gl_Position = vec4(x, y, 0.0, 1.0);
        gl_PointSize = a_size;
        v_a = 0.35 + 0.45 * sin(u_t * 0.5 + a_pos.x * 8.0);
      }
    `;
    const fs = `
      precision mediump float;
      varying float v_a;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float d = dot(p, p);
        if (d > 1.0) discard;
        float glow = exp(-d * 3.2);
        gl_FragColor = vec4(mix(vec3(0.48, 0.82, 1.0), vec3(0.93, 0.76, 0.28), glow * 0.55), glow * v_a * 0.8);
      }
    `;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vsh = compile(gl.VERTEX_SHADER, vs);
    const fsh = compile(gl.FRAGMENT_SHADER, fs);
    if (!vsh || !fsh) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const COUNT = 140;
    const pos = new Float32Array(COUNT * 2);
    const size = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 2] = Math.random() * 2 - 1;
      pos[i * 2 + 1] = Math.random() * 2 - 1;
      size[i] = 1.5 + Math.random() * 3.2;
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const sizeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl.STATIC_DRAW);
    const aSize = gl.getAttribLocation(prog, "a_size");
    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, "u_t");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}
