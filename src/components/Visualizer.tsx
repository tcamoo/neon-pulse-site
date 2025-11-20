
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let frame = 0;

    interface Shape {
        x: number;
        y: number;
        baseSize: number;
        size: number;
        color: string;
        speedX: number;
        speedY: number;
        offset: number;
    }

    const shapes: Shape[] = [];
    const colors = ['rgba(255, 0, 128, 0.15)', 'rgba(217, 249, 157, 0.15)', 'rgba(6, 182, 212, 0.15)'];
    
    // Use a larger buffer if possible from the analyser for better resolution
    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = analyser ? new Uint8Array(bufferLength) : null;

    for(let i=0; i<25; i++) {
        shapes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            baseSize: Math.random() * 60 + 40,
            size: 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            offset: Math.random() * 100
        })
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      frame += 0.01;

      // Get audio data if available
      let bassFactor = 0;
      let midFactor = 0;
      let highFactor = 0;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        
        // Assuming fftSize of 1024 (bin count 512). ~43Hz per bin at 44.1kHz
        // Bass: ~20-150Hz (Bins 0-4)
        // Mid: ~200-2000Hz (Bins 5-50)
        // High: ~2000Hz+ (Bins 50+)
        
        const bassRange = dataArray.slice(0, 5);
        const midRange = dataArray.slice(5, 40);
        const highRange = dataArray.slice(40, 100);
        
        const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;
        const midAvg = midRange.reduce((a, b) => a + b, 0) / midRange.length;
        const highAvg = highRange.reduce((a, b) => a + b, 0) / highRange.length;
        
        // Normalize 0-1 and apply non-linear curve for more "pop"
        bassFactor = Math.pow(bassAvg / 255, 1.5); 
        midFactor = Math.pow(midAvg / 255, 1.2);
        highFactor = highAvg / 255;
      }

      // Draw moving gradients blobs
      shapes.forEach((shape, index) => {
          // Speed modulation
          const speedMultiplier = 1 + (bassFactor * 3);
          
          shape.x += shape.speedX * speedMultiplier;
          shape.y += shape.speedY * speedMultiplier;
          
          if(shape.x < -150) shape.x = width + 150;
          if(shape.x > width + 150) shape.x = -150;
          if(shape.y < -150) shape.y = height + 150;
          if(shape.y > height + 150) shape.y = -150;

          // Audio Reactivity for Size
          let audioBoost = 0;
          if(analyser) {
             // Distribute frequency response across shapes
             if (index % 3 === 0) audioBoost = bassFactor * 150;
             else if (index % 3 === 1) audioBoost = midFactor * 120;
             else audioBoost = highFactor * 80;
          } else {
             // Idle breathing
             audioBoost = Math.sin(frame + shape.offset) * 20;
          }

          // Smooth transition for size (basic linear interpolation could be added here for smoother visuals, 
          // but for direct reactivity we use the calculated value)
          const targetSize = shape.baseSize + audioBoost;
          // Simple easing manually or just direct assignment for snappiness
          shape.size = shape.size + (targetSize - shape.size) * 0.2;

          ctx.beginPath();
          // Add some jitter on heavy bass
          const jitterX = bassFactor > 0.6 ? (Math.random() - 0.5) * 5 : 0;
          const jitterY = bassFactor > 0.6 ? (Math.random() - 0.5) * 5 : 0;

          ctx.arc(shape.x + jitterX, shape.y + jitterY, Math.max(0, shape.size), 0, Math.PI * 2);
          ctx.fillStyle = shape.color;
          
          // Dynamic Glow
          if (bassFactor > 0.4) {
              ctx.shadowBlur = 30 * bassFactor;
              ctx.shadowColor = shape.color;
          } else {
              ctx.shadowBlur = 0;
          }
          
          ctx.fill();
          ctx.shadowBlur = 0;
      });

      // Draw Geometric Grid Overlay (Subtle)
      // Pulse grid opacity and color with bass
      const gridOpacity = 0.03 + (midFactor * 0.08);
      ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`;
      ctx.lineWidth = 1 + (bassFactor * 2); // Thicken lines on beat
      
      const gridSize = 100;
      
      // Perspective / Moving Grid effect
      const gridOffset = (frame * 10) % gridSize;
      
      for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y + gridOffset);
          ctx.lineTo(width, y + gridOffset);
          ctx.stroke();
      }
      
      // Vertical lines (optional, less dense)
      for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
      }
      
      // Flash effect on heavy hits
      if (bassFactor > 0.85) {
          ctx.fillStyle = `rgba(255, 0, 128, ${bassFactor * 0.05})`;
          ctx.fillRect(0, 0, width, height);
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    }
  }, [analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default Visualizer;
