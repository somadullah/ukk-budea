import type { Engine, ISourceOptions } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useCallback } from "react";

interface ParticlesBackgroundProps {
  variant?: 'network' | 'bubbles' | 'snow' | 'fire';
}

const ParticlesBackground = ({ variant = 'network' }: ParticlesBackgroundProps) => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const getOptions = () => {
        const baseOptions: ISourceOptions = {
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            detectRetina: true,
        };

        if (variant === 'bubbles') {
            return {
                ...baseOptions,
                particles: {
                    color: { value: "#ffffff" },
                    move: { enable: true, speed: 2, direction: "top" },
                    number: { value: 30, density: { enable: true, area: 800 } },
                    opacity: { value: 0.2 },
                    shape: { type: "circle" },
                    size: { value: { min: 5, max: 15 } },
                },
            };
        }

        if (variant === 'snow') {
            return {
                ...baseOptions,
                particles: {
                    color: { value: "#ffffff" },
                    move: { enable: true, speed: 1, direction: "bottom" },
                    number: { value: 100, density: { enable: true, area: 800 } },
                    opacity: { value: 0.5 },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 5 } },
                },
            };
        }

        if (variant === 'fire') {
            return {
                ...baseOptions,
                particles: {
                    color: { value: "#ff4500" },
                    move: { enable: true, speed: 3, direction: "top", random: true },
                    number: { value: 60 },
                    opacity: { value: 0.4 },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 4 } },
                },
            };
        }

        // Default: network / constellation
        return {
            ...baseOptions,
            interactivity: {
                events: {
                    onHover: { enable: true, mode: "grab" },
                    resize: true,
                },
                modes: {
                    grab: { distance: 140, links: { opacity: 0.5 } },
                },
            },
            particles: {
                color: { value: "#ffffff" },
                links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.2, width: 1 },
                move: { enable: true, speed: 1.5, direction: "none", outModes: { default: "bounce" } },
                number: { value: 50, density: { enable: true, area: 800 } },
                opacity: { value: 0.3 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 3 } },
            },
        };
    };

    return (
        <Particles
            id={`tsparticles-${variant}`}
            init={particlesInit}
            options={getOptions()}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: -1,
            }}
        />
    );
};

export default ParticlesBackground;
