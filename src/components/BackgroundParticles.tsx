import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  alphaSpeed: number;
}

interface BackgroundParticlesProps {
  count?: number;
  colorScheme?: 'blue' | 'purple' | 'teal' | 'multi';
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
}

const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  count = 50,
  colorScheme = 'blue',
  density = 'medium',
  speed = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Get colors based on the chosen scheme
  const getColors = () => {
    switch (colorScheme) {
      case 'blue':
        return ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
      case 'purple':
        return ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];
      case 'teal':
        return ['#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4'];
      case 'multi':
        return ['#3B82F6', '#8B5CF6', '#14B8A6', '#F472B6', '#F59E0B'];
      default:
        return ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
    }
  };

  // Get speed multiplier based on speed setting
  const getSpeedMultiplier = () => {
    switch (speed) {
      case 'slow': return 0.5;
      case 'medium': return 1;
      case 'fast': return 1.5;
      default: return 1;
    }
  };

  // Get particle count based on density
  const getParticleCount = () => {
    const baseCount = count;
    switch (density) {
      case 'low': return Math.floor(baseCount * 0.5);
      case 'medium': return baseCount;
      case 'high': return Math.floor(baseCount * 2);
      default: return baseCount;
    }
  };

  const initializeParticles = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = getColors();
    const particles: Particle[] = [];
    const finalCount = getParticleCount();
    const speedMultiplier = getSpeedMultiplier();
    
    for (let i = 0; i < finalCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * speedMultiplier,
        speedY: (Math.random() - 0.5) * speedMultiplier,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
        alphaSpeed: Math.random() * 0.01
      });
    }
    
    particlesRef.current = particles;
  };

  const animate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Update alpha with pulsating effect
      particle.alpha += particle.alphaSpeed;
      if (particle.alpha <= 0.1 || particle.alpha >= 0.6) {
        particle.alphaSpeed = -particle.alphaSpeed;
      }
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      
      // Handle edge cases to keep particles on screen
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX = -particle.speedX;
      }
      
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY = -particle.speedY;
      }
    });
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    initializeParticles();
    animate();
    
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        initializeParticles();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [count, colorScheme, density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default BackgroundParticles; 