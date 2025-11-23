"use client";
import { useEffect, useState } from "react";

interface VideoRectanglesProps {
  videos: string[];
}

export default function VideoRectangles({ videos }: VideoRectanglesProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-8">
      <div className="relative flex items-end justify-center gap-1 max-w-6xl">
        {videos.map((video, index) => {
          const isLeft = index === 0;
          const isMiddle = index === 1;
          const isRight = index === 2;

          return (
            <div 
              key={index} 
              className={`relative transform transition-all duration-1000 ease-out ${
                isLoaded 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-20 opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 200}ms`,
                zIndex: isMiddle ? 30 : 20,
                transform: isLoaded 
                  ? `${isLeft ? 'rotate(-15deg) translateY(40px) translateX(40px)' : isRight ? 'rotate(15deg) translateY(40px) translateX(-40px)' : 'translateY(0px)'}`
                  : 'translateY(20px)'
              }}
            >
              {/* Glowing border effect - removed goofy colors, just clean shadow */}
              <div className="absolute -inset-1 bg-gray-300 rounded-2xl blur-sm opacity-50"></div>
              
              {/* Main container */}
              <div className={`relative bg-gray-100 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 ${
                isMiddle ? 'w-80 h-[28rem]' : 'w-56 h-80'
              }`}>
                {/* Holographic overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 z-10"></div>
                
                {/* Scan line effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-0 hover:opacity-100 animate-pulse z-20"></div>
                
                <video
                  src={`/videos/${video}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover relative z-0"
                  style={{ 
                    filter: 'brightness(0.9) contrast(1.1) saturate(1.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1) contrast(1.2) saturate(1.4)';
                    e.currentTarget.style.transform = 'scale(1.05) rotateY(2deg)';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.style.transform = 'translateY(-8px)';
                      e.currentTarget.parentElement.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.9) contrast(1.1) saturate(1.2)';
                    e.currentTarget.style.transform = 'scale(1) rotateY(0deg)';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.style.transform = 'translateY(0px)';
                      e.currentTarget.parentElement.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                />
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-gray-400/60 rounded-full animate-ping"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '3s'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Data stream effect */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-60 animate-pulse"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
