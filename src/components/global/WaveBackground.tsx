import { onCleanup, onMount } from "solid-js";

const vsSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  
  // Arrays para almacenar las posiciones y tiempos de los goteos del mouse
  uniform vec2 u_drips[15];
  uniform float u_dripTimes[15];

  // Funciones de ruido para generar señales aleatorias (simulando audio/frecuencias)
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(float x) {
      float i = floor(x);
      float f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(hash(i), hash(i + 1.0), f);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // 1. Efecto Drips (Interacción con el mouse, estilo glitch/digital)
    vec2 mouseOffset = vec2(0.0);
    for(int i = 0; i < 15; i++) {
        float age = u_time - u_dripTimes[i];
        
        if (age > 0.0 && age < 4.0) {
            vec2 diff = uv - u_drips[i];
            diff.x *= u_resolution.x / u_resolution.y; 
            
            // Distorsionar el borde del goteo para un look electromagnético
            float angle = atan(diff.y, diff.x);
            float dist = length(diff) + noise(angle * 15.0 + u_time * 10.0) * 0.015;
            
            float radius = age * 0.25;
            float thickness = 0.08; 
            float distToRing = abs(dist - radius);
            
            if (distToRing < thickness) {
                float strength = (1.0 - distToRing / thickness) * max(0.0, 1.0 - age / 4.0);
                
                // Un pulso cortante y eléctrico en lugar de onda suave
                float ripple = sin((dist - radius) * 80.0);
                ripple = smoothstep(0.8, 1.0, ripple) * 0.03 * strength;
                
                mouseOffset += normalize(diff) * ripple;
            }
        }
    }
    
    // Distorsión del espacio base con el paso del mouse
    vec2 distUv = uv + mouseOffset;
    
    // 2. Base del Espectrograma
    // Discretizar el eje X para crear "bandas/bins" del ecualizador
    float numBands = 90.0;
    float bandX = floor(distUv.x * numBands) / numBands;
    
    float intensity = 0.0;
    
    // 3. Trazar líneas múltiples superpuestas (tipo osciloscopio de audio 3D)
    for (float i = 0.0; i < 10.0; i++) {
        // Distribuir las líneas uniformemente en el eje Y
        float lineY = -0.1 + i * 0.12; 
        
        // Generar señal de "audio" específica para cada línea
        float bass = noise(bandX * (10.0 + i) + u_time * (2.0 + i * 0.2)) * 0.15;
        float treble = noise(bandX * (50.0 - i * 2.0) - u_time * 6.0) * 0.08;
        // Simular picos bruscos como golpes de batería (beats)
        float drum = step(0.92, noise(bandX * (5.0 + i) + u_time * 3.0)) * 0.2;
        
        float audioSignal = bass + treble + drum;
        
        // Base fluida que viaja de un lado al otro
        float wave = sin(distUv.x * 8.0 - u_time * (1.0 + i * 0.1)) * 0.02;
        
        // Posición final deformada en Y
        float finalY = lineY + audioSignal + wave;
        
        // Calcular la distancia desde el pixel actual hasta la línea generada
        float dist = abs(distUv.y - finalY);
        
        // Generar un brillo (glow) concentrado cerca del centro de la línea
        float glow = 0.0012 / (dist + 0.0001);
        
        // Atenuar visualmente las líneas en los extremos superior e inferior
        float fade = sin((i / 9.0) * 3.1415);
        intensity += glow * fade;
    }
    
    // 4. Detalles menores de ruido estilo Matriz en el fondo
    float bgNoise = noise(distUv.x * 120.0) * noise(distUv.y * 40.0 + u_time * 5.0);
    intensity += bgNoise * 0.12;
    
    // Divisores verticales tenues (marca los carriles de frecuencia)
    intensity += step(0.9, fract(distUv.x * numBands)) * 0.03;

    // 5. Paleta de Colores Solicitada
    // #92fba4 (Verde Claro)  -> Normalizado: vec3(0.57, 0.98, 0.64)
    // #429d51 (Verde Medio)  -> Normalizado: vec3(0.26, 0.62, 0.32)
    // #3d5c43 (Verde Oscuro) -> Normalizado: vec3(0.24, 0.36, 0.26)
    vec3 cLight = vec3(0.57, 0.98, 0.64); 
    vec3 cMid   = vec3(0.26, 0.62, 0.32); 
    vec3 cDark  = vec3(0.24, 0.36, 0.26); 
    vec3 cBg    = vec3(0.04, 0.06, 0.04); // Fondo base negro/verdoso profundo
    
    vec3 color = cBg;
    
    // Mapeo topográfico del calor de las frecuencias
    color = mix(color, cDark, smoothstep(0.05, 0.3, intensity));
    color = mix(color, cMid,  smoothstep(0.3, 0.7, intensity));
    color = mix(color, cLight, smoothstep(0.7, 1.5, intensity));
    
    // Scanlines sutiles para reforzar la estética de terminal
    color *= (1.0 - sin(uv.y * 1000.0) * 0.05);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Drip = { x: number; y: number; time: number };

export default function WaveBackground() {
  let canvas!: HTMLCanvasElement;

  const drips: Drip[] = new Array(15).fill(null).map(() => ({
    x: -2,
    y: -2,
    time: -10,
  }));
  let currentDripIdx = 0;
  let lastMousePos = { x: -1, y: -1 };

  onMount(() => {
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let animationId = 0;

    const createShader = (
      context: WebGLRenderingContext,
      type: number,
      source: string
    ) => {
      const shader = context.createShader(type);
      if (!shader) return null;
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        console.error(context.getShaderInfoLog(shader));
        context.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const dripsLoc = gl.getUniformLocation(program, "u_drips");
    const dripTimesLoc = gl.getUniformLocation(program, "u_dripTimes");

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth;
      canvas.height = clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq > 900) {
        lastMousePos = { x: e.clientX, y: e.clientY };

        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;

        drips[currentDripIdx] = {
          x,
          y,
          time: performance.now() * 0.001,
        };

        currentDripIdx = (currentDripIdx + 1) % 15;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const render = (time: number) => {
      gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeLoc, time * 0.001);

      const dripsData = new Float32Array(30);
      const dripsTimeData = new Float32Array(15);

      drips.forEach((drip, i) => {
        dripsData[i * 2] = drip.x;
        dripsData[i * 2 + 1] = drip.y;
        dripsTimeData[i] = drip.time;
      });

      gl.uniform2fv(dripsLoc, dripsData);
      gl.uniform1fv(dripTimesLoc, dripsTimeData);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };
    animationId = requestAnimationFrame(render);

    onCleanup(() => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
    });
  });

  return (
    <canvas
      ref={canvas}
      class="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
