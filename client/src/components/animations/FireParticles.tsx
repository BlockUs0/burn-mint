import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

export function FireParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev];

        // Add new particles
        if (newParticles.length < 30) {
          const colors = [
            'rgb(255, 159, 28)', // Orange
            'rgb(255, 88, 33)',  // Bright orange
            'rgb(255, 61, 0)',   // Red-orange
            'rgb(255, 207, 51)'  // Yellow
          ];

          newParticles.push({
            id: Date.now(),
            x: 35 + Math.random() * 30, // Centered more
            y: 100 + Math.random() * 20,
            size: 3 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360
          });
        }

        // Update and filter particles
        return newParticles
          .filter(p => p.id > Date.now() - 1500)
          .map(p => ({
            ...p,
            y: p.y - (1 + Math.random()), // Varying speeds
            x: p.x + (Math.sin(p.y / 30) * 0.5), // Sideways motion
            size: p.size * 0.97,
            rotation: p.rotation + 2
          }));
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent" />

      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          initial={{ opacity: 0.9, scale: 1.2 }}
          animate={{
            opacity: 0,
            scale: 0.5,
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            rotate: particle.rotation
          }}
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}