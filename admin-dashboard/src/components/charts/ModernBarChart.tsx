import { useEffect, useRef } from 'react';

interface ModernBarChartProps {
    data: { label: string; value: number; color?: string }[];
    height?: number;
    showValues?: boolean;
    animate?: boolean;
}

/**
 * Modern bar chart with gradient fills and animations
 * Perfect for comparing categorical data
 */
export default function ModernBarChart({
    data,
    height = 200,
    showValues = true,
    animate = true,
}: ModernBarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const progressRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length === 0) return;

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

        const padding = 40;
        const barSpacing = 12;
        const chartWidth = width - padding * 2;
        const availableHeight = chartHeight - padding * 2;
        const barWidth = (chartWidth - barSpacing * (data.length - 1)) / data.length;

        const maxValue = Math.max(...data.map(d => d.value));

        const draw = (progress: number) => {
            ctx.clearRect(0, 0, width, chartHeight);

            // Set font for labels
            ctx.font = '12px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';

            data.forEach((item, index) => {
                const x = padding + index * (barWidth + barSpacing);
                const barHeight = (item.value / maxValue) * availableHeight * progress;
                const y = chartHeight - padding - barHeight;

                // Create gradient for bar
                const gradient = ctx.createLinearGradient(x, y, x, chartHeight - padding);
                const color = item.color || '#2F6BFF';
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, `${color}80`);

                // Draw bar with rounded top
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeight, [8, 8, 0, 0]);
                ctx.fill();

                // Add glow effect
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
                ctx.fillStyle = `${color}20`;
                ctx.beginPath();
                ctx.roundRect(x - 2, y - 2, barWidth + 4, barHeight + 4, [8, 8, 0, 0]);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw value on top
                if (showValues && progress === 1) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
                    ctx.fillText(
                        item.value.toLocaleString(),
                        x + barWidth / 2,
                        y - 8
                    );
                }

                // Draw label at bottom
                ctx.fillStyle = '#9CA3AF';
                ctx.font = '11px Inter, system-ui, sans-serif';
                ctx.fillText(
                    item.label,
                    x + barWidth / 2,
                    chartHeight - padding + 20
                );
            });
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
    }, [data, showValues, animate]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: `${height}px` }}
            className="rounded-lg"
        />
    );
}
