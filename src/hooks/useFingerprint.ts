import { useState, useEffect } from 'react';

interface FingerprintData {
  fingerprint: string;
  components: {
    userAgent: string;
    language: string;
    colorDepth: number;
    screenResolution: string;
    timezone: string;
    sessionStorage: boolean;
    localStorage: boolean;
    platform: string;
    cpuClass: string | undefined;
    canvas: string;
    webgl: string;
  };
}

// Generate a simple hash from string
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

// Get canvas fingerprint
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas', 4, 17);
    
    return simpleHash(canvas.toDataURL());
  } catch {
    return 'canvas-error';
  }
};

// Get WebGL fingerprint
const getWebGLFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return simpleHash(`${vendor}~${renderer}`);
    }
    return 'webgl-no-debug';
  } catch {
    return 'webgl-error';
  }
};

export const generateFingerprint = (): FingerprintData => {
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sessionStorage: !!window.sessionStorage,
    localStorage: !!window.localStorage,
    platform: navigator.platform,
    cpuClass: (navigator as any).cpuClass,
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
  };
  
  // Create fingerprint from components
  const fingerprintString = [
    components.userAgent,
    components.language,
    components.colorDepth,
    components.screenResolution,
    components.timezone,
    components.platform,
    components.canvas,
    components.webgl,
  ].join('|');
  
  const fingerprint = simpleHash(fingerprintString);
  
  return { fingerprint, components };
};

export const useFingerprint = () => {
  const [fingerprintData, setFingerprintData] = useState<FingerprintData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate fingerprint on mount
    const data = generateFingerprint();
    setFingerprintData(data);
    setLoading(false);
  }, []);

  return { fingerprintData, loading };
};
