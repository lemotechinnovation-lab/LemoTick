import { useEffect, useRef } from 'react';

interface RadialProgressProps {
    value: number; // 0-100
    size?: number;
    thickness?: number;
    color?: string;
    backgroundColor?: string;
    showValue?: boolean;
    label?: string;
    animate?: boolean;
}

/**
 * Radial progress indicator with gradient and glow effects
 * Perfect for showing percentage-based metrics
 */
export default function RadialProgress({
    value,
    size = 120,
    thickness = 12,
    color = '#2F6BFF',
    backgroundColor = '#16124A',
    showValue = true,
    label,
    animate = true,
}: RadialProgressProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const progressRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = (size - thickness) / 2;

        const draw = (progress: number) => {
            ctx.clearRect(0, 0, size, size);

            // Draw background circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.lineWidth = thickness;
            ctx.strokeStyle = backgroundColor;
            ctx.stroke();

            // Draw progress arc
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (value / 100) * Math.PI * 2 * progress;

            // Create gradient
            const gradient = ctx.createLinearGradient(
                centerX - radius,
                centerY,
                centerX + radius,
                centerY
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, `${color}CC`);

            // Draw with glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineWidth = thickness;
            ctx.strokeStyle = gradient;
            ctx.lineCap = 'round';
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw center value
            if (showValue && progress === 1) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.font = 'bold 28px Inter, system-ui, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${Math.round(value)}%`, centerX, label ? centerY - 8 : centerY);

                if (label) {
                    ctx.font = '11px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#9CA3AF';
                    ctx.fillText(label, centerX, centerY + 14);
                }
            }

            // Draw end cap (dot)
            if (progress === 1) {
                const capX = centerX + radius * Math.cos(endAngle);
                const capY = centerY + radius * Math.sin(endAngle);

                ctx.beginPath();
                ctx.arc(capX, capY, thickness / 2 + 2, 0, Math.PI * 2);
                ctx.fillStyle = `${color}40`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(capX, capY, thickness / 2, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(capX, capY, thickness / 4, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        };

        // Animation loop
        if (animate && progressRef.current < 1) {
            const animateChart = () => {
                progressRef.current += 0.03;
                if (progressRef.current > 1) progressRef.current = 1;

                draw(progressRef.current);

                if (progressRef.current < 1) {
                    animationRef.current = requestAnimationFrame(animateChart);
                }
            };
            animateChart();
        } else {
            draw(1);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, size, thickness, color, backgroundColor, showValue, label, animate]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="mx-auto"
        />
    );
}
