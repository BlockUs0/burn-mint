import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function FireParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev];
        
        // Add new particle
        if (newParticles.length < 20) {
          newParticles.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: 100 + Math.random() * 20,
            size: 2 + Math.random() * 4
          });
        }

        // Remove old particles
        return newParticles
          .filter(p => p.id > Date.now() - 1000)
          .map(p => ({
            ...p,
            y: p.y - 1,
            size: p.size * 0.95
          }));
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-orange-500/50"
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: 0,
            x: `${particle.x}%`,
            y: `${particle.y}%`,
          }}
          style={{
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
}
