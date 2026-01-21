'use client';

import React, { useEffect, useRef } from 'react';

type AetherBackgroundProps = {
    overlayGradient?: string; // e.g. 'linear-gradient(180deg, #00000080, #00000020 40%, transparent)'

    /* ---------- Canvas/shader ---------- */
    variant?: 'default' | 'grid' | 'orb'; // Added variant prop
    dprMax?: number; // cap DPR (default 2)
    clearColor?: [number, number, number, number];

    /* ---------- Misc ---------- */
    className?: string;
    ariaLabel?: string;
};

/* Monochrome fragment shader (default smoke/light) */
const MONOCHROME_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define S smoothstep
#define MN min(R.x,R.y)
float pattern(vec2 uv) {
  float d=.0;
  for (float i=.0; i<3.; i++) {
    uv.x+=sin(T*(1.+i)+uv.y*1.5)*.2;
    d+=.005/abs(uv.x);
  }
  return d;	
}
vec3 scene(vec2 uv) {
  vec3 col=vec3(0);
  uv=vec2(atan(uv.x,uv.y)*2./6.28318,-log(length(uv))+T);
  for (float i=.0; i<3.; i++) {
    float p = pattern(uv+i*6./MN);
    col += vec3(p) * 0.4;
  }
  return col;
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  float s=12., e=9e-4;
  col+=e/(sin(uv.x*s)*cos(uv.y*s));
  uv.y+=R.x>R.y?.5:.5*(R.y/R.x);
  col+=scene(uv);
  col *= vec3(0.9, 0.95, 1.0); 
  O=vec4(col,1.);
}`;

/* Grid fragment shader (tech/geometric) */
const GRID_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time

void main() {
    vec2 uv = (FC - 0.5 * R) / min(R.x, R.y);
    // Rotating perspective plane
    float t = T * 0.1;
    vec3 dir = normalize(vec3(uv, 1.0));
    vec3 pos = vec3(0.0, 1.0, t);
    
    // Simple floor grid
    float p = 0.0;
    if (dir.y < 0.0) {
       float dist = 0.5 / -dir.y;
       vec2 p2 = pos.xz + dir.xz * dist;
       p2 *= 2.0; // Scale
       // Grid pattern
       vec2 grid = abs(fract(p2 - 0.5) - 0.5) / fwidth(p2);
       float line = min(grid.x, grid.y);
       p = 1.0 - min(line, 1.0);
       p *= smoothstep(4.0, 0.0, dist); // Fade distance
    }
    
    // Abstract flowing lines on top
    for(float i=1.0; i<4.0; i++) {
        uv.y += sin(uv.x * 2.3 + T * 0.2 + i) * 0.1;
        float width = 0.002 / abs(uv.y);
        p += width * 0.3;
    }

    vec3 col = vec3(p) * 0.3; // Dim monochrome
    col *= vec3(0.9, 0.95, 1.0); // Slight customization
    O = vec4(col, 1.0);
}`;

/* Orb fragment shader (soft/flow/testimonials) */
const ORB_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time

void main() {
    vec2 uv = (FC - 0.5 * R) / min(R.x, R.y);
    vec3 col = vec3(0.0);
    
    // Moving orbs
    for(float i = 0.0; i < 5.0; i++) {
        float t = T * 0.2 + i * 2.0;
        vec2 pos = vec2(sin(t * 0.7), cos(t * 0.5)) * 0.5;
        // Wobbly orbit
        pos += vec2(sin(t * 1.5), cos(t * 1.2)) * 0.2;
        
        float d = length(uv - pos);
        // Soft glow
        float glow = 0.02 / (d * d + 0.01);
        
        // Varying intensity
        glow *= 0.1 + 0.1 * sin(t);
        col += vec3(glow);
    }
    
    // Noise/grain overlay for texture
    float noise = fract(sin(dot(uv + T * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    col += noise * 0.02;

    col *= vec3(0.9, 0.95, 1.0); // Monochrome tint
    O = vec4(col, 1.0);
}`;

/* Minimal passthrough vertex shader */
const VERT_SRC = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

export default function AetherBackground({
    overlayGradient = 'linear-gradient(180deg, #000000 0%, transparent 50%, #000000 100%)',
    variant = 'default',
    dprMax = 2,
    clearColor = [0, 0, 0, 1],
    className = '',
    ariaLabel = 'Background animation',
}: AetherBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const bufRef = useRef<WebGLBuffer | null>(null);
    const uniTimeRef = useRef<WebGLUniformLocation | null>(null);
    const uniResRef = useRef<WebGLUniformLocation | null>(null);
    const rafRef = useRef<number | null>(null);

    // Compile helpers
    const compileShader = (gl: WebGL2RenderingContext, src: string, type: number) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(sh) || 'Unknown shader error';
            gl.deleteShader(sh);
            throw new Error(info);
        }
        return sh;
    };
    const createProgram = (gl: WebGL2RenderingContext, vs: string, fs: string) => {
        const v = compileShader(gl, vs, gl.VERTEX_SHADER);
        const f = compileShader(gl, fs, gl.FRAGMENT_SHADER);
        const prog = gl.createProgram()!;
        gl.attachShader(prog, v);
        gl.attachShader(prog, f);
        gl.linkProgram(prog);
        gl.deleteShader(v);
        gl.deleteShader(f);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(prog) || 'Program link error';
            gl.deleteProgram(prog);
            throw new Error(info);
        }
        return prog;
    };

    // Init GL
    useEffect(() => {
        const canvas = canvasRef.current!;
        const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
        if (!gl) return;
        glRef.current = gl;

        // Select Shader Source
        let fragSource = MONOCHROME_FRAG;
        if (variant === 'grid') fragSource = GRID_FRAG;
        if (variant === 'orb') fragSource = ORB_FRAG;

        // Program
        let prog: WebGLProgram;
        try {
            prog = createProgram(gl, VERT_SRC, fragSource);
        } catch (e) {
            console.error(e);
            return;
        }
        programRef.current = prog;

        // Buffer
        const verts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
        const buf = gl.createBuffer()!;
        bufRef.current = buf;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        // Attributes/uniforms
        gl.useProgram(prog);
        const posLoc = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        uniTimeRef.current = gl.getUniformLocation(prog, 'time');
        uniResRef.current = gl.getUniformLocation(prog, 'resolution');

        // Clear color
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

        // Size & DPR
        const fit = () => {
            const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, dprMax));
            const rect = canvas.getBoundingClientRect();
            const cssW = Math.max(1, rect.width);
            const cssH = Math.max(1, rect.height);
            const W = Math.floor(cssW * dpr);
            const H = Math.floor(cssH * dpr);
            if (canvas.width !== W || canvas.height !== H) {
                canvas.width = W; canvas.height = H;
            }
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        fit();
        const onResize = () => fit();
        const ro = new ResizeObserver(fit);
        ro.observe(canvas);
        window.addEventListener('resize', onResize);

        // RAF
        const loop = (now: number) => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(prog);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            if (uniResRef.current) gl.uniform2f(uniResRef.current, canvas.width, canvas.height);
            if (uniTimeRef.current) gl.uniform1f(uniTimeRef.current, now * 1e-3);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        // Cleanup
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (bufRef.current) gl.deleteBuffer(bufRef.current);
            if (programRef.current) gl.deleteProgram(programRef.current);
        };
    }, [dprMax, clearColor, variant]);

    return (
        <div
            className={`absolute inset-0 z-0 pointer-events-none ${className}`}
            aria-hidden="true"
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
            />
            {/* Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: overlayGradient,
                }}
            />
        </div>
    );
}
