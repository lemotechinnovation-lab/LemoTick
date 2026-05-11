import { useEffect, useRef } from 'react';

interface ModernAreaChartProps {
    data: number[];
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    height?: number;
    showGrid?: boolean;
    animate?: boolean;
}

/**
 * Modern area chart with gradient fill and smooth animations
 * Inspired by modern dashboard design patterns (2024-2026)
 * 
 * Features:
 * - Smooth gradient fills
 * - Animated path drawing
 * - Responsive design
 * - Glow effects on hover
 */
export default function ModernAreaChart({
    data,
    color = '#2F6BFF',
    gradientFrom = '#2F6BFF',
    gradientTo = '#FFA62B',
    height = 200,
    showGrid = false,
    animate = true,
}: ModernAreaChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const progressRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length < 2) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const chartHeight = rect.height;

        // Calculate data points
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const padding = 20;
        const chartWidth = width - padding * 2;
        const availableHeight = chartHeight - padding * 2;

        const points = data.map((value, index) => ({
            x: padding + (index / (data.length - 1)) * chartWidth,
            y: padding + availableHeight - ((value - min) / range) * availableHeight,
        }));

        // Animation function
        const draw = (progress: number) => {
            ctx.clearRect(0, 0, width, chartHeight);

            // Draw grid if enabled
            if (showGrid) {
                ctx.strokeStyle = 'rgba(47, 107, 255, 0.1)';
                ctx.lineWidth = 1;
                for (let i = 0; i <= 4; i++) {
                    const y = padding + (availableHeight / 4) * i;
                    ctx.beginPath();
                    ctx.moveTo(padding, y);
                    ctx.lineTo(width - padding, y);
                    ctx.stroke();
                }
            }

            // Create gradient
            const gradient = ctx.createLinearGradient(0, padding, 0, chartHeight - padding);
            gradient.addColorStop(0, `${gradientFrom}80`); // 50% opacity
            gradient.addColorStop(0.5, `${gradientFrom}40`); // 25% opacity
            gradient.addColorStop(1, `${gradientTo}10`); // 6% opacity

            // Draw area with animation
            const visiblePoints = Math.floor(points.length * progress);
            if (visiblePoints < 2) return;

            ctx.beginPath();
            ctx.moveTo(points[0].x, chartHeight - padding);
            ctx.lineTo(points[0].x, points[0].y);

            // Draw smooth curve using quadratic curves
            for (let i = 0; i < visiblePoints - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }

            // Complete the last segment
            if (visiblePoints === points.length) {
                const last = points[points.length - 1];
                ctx.lineTo(last.x, last.y);
                ctx.lineTo(last.x, chartHeight - padding);
            } else {
                const last = points[visiblePoints - 1];
                ctx.lineTo(last.x, last.y);
                ctx.lineTo(last.x, chartHeight - padding);
            }

            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw line with glow effect
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 0; i < visiblePoints - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }

            if (visiblePoints === points.length) {
                const last = points[points.length - 1];
                ctx.lineTo(last.x, last.y);
            }

            // Glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Draw dots at data points
            ctx.shadowBlur = 0;
            points.slice(0, visiblePoints).forEach((point, index) => {
                // Outer glow
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = `${color}40`;
                ctx.fill();

                // Inner dot
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // White center
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            });
        };

        // Animation loop
        if (animate && progressRef.current < 1) {
            const animateChart = () => {
                progressRef.current += 0.02;
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
    }, [data, color, gradientFrom, gradientTo, showGrid, animate]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: `${height}px` }}
            className="rounded-lg"
        />
    );
}
