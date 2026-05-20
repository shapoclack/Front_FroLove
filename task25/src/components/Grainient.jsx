import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uSpeed;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uGrainAmount;
  uniform float uGrainScale;
  varying vec2 vUv;

  float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uSpeed;
    
    float n = noise(uv * uFrequency + t);
    float mask = smoothstep(0.2, 0.8, n * uAmplitude + uv.y);
    
    vec3 color = mix(uColor1, uColor2, mask);
    color = mix(color, uColor3, smoothstep(0.1, 0.9, noise(uv * 2.0 - t)));

    float grain = (random(uv * uGrainScale + t) - 0.5) * uGrainAmount;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const Grainient = ({
  colors = ['#360e35', '#731680', '#1a051d'],
  speed = 0.2,
  amplitude = 1.0,
  frequency = 2.0,
  grainAmount = 0.05,
  grainScale = 2.0,
  className = ""
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new Color(colors[0]) },
        uColor2: { value: new Color(colors[1]) },
        uColor3: { value: new Color(colors[2]) },
        uSpeed: { value: speed },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uGrainAmount: { value: grainAmount },
        uGrainScale: { value: grainScale },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', resize, false);
    resize();

    let requestId;
    function update(t) {
      requestId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    requestId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestId);
      if (containerRef.current && gl.canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, [colors, speed, amplitude, frequency, grainAmount, grainScale]);

  return <div ref={containerRef} className={`grainient-container ${className}`} />;
};

export default Grainient;
