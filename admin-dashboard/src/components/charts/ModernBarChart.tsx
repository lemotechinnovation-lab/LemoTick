import { useEffect, useRef } from 'react';

interface ModernBarChartProps {
    data: { label: string; value: number; color?: string }[];
    height?: number;
    showValues?: boolean;
    animate?: boolean;
    yAxisLabel?: string;
    xAxisLabel?: string;
}

/**
 * Modern 3D bar chart with gradient fills, depth panels, and animations
 * Perfect for comparing categorical data with enhanced visual depth
 * 
 * 3D Features v2.0:
 * - Side and top depth panels
 * - Inner highlight gradient
 * - Enhanced shadows and glow
 * - Values displayed above 3D structure
 */
export default function ModernBarChart({
    data,
    height = 200,
    showValues = true,
    animate = true,
    yAxisLabel = 'Value',
    xAxisLabel = 'Category',
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

        const paddingLeft = 60;
        const paddingRight = 20;
        const paddingTop = 40;
        const paddingBottom = 50;
        const barSpacing = 12;
        const chartWidth = width - paddingLeft - paddingRight;
        const availableHeight = chartHeight - paddingTop - paddingBottom;
        const barWidth = (chartWidth - barSpacing * (data.length - 1)) / data.length;

        const maxValue = Math.max(...data.map(d => d.value));
        const ySteps = 5;
        const yStepValue = Math.ceil(maxValue / ySteps);
        const adjustedMaxValue = yStepValue * ySteps;

        const draw = (progress: number) => {
            ctx.clearRect(0, 0, width, chartHeight);

            // Set font for labels
            ctx.font = '11px Inter, system-ui, sans-serif';
            ctx.fillStyle = '#9CA3AF';

            // Draw Y-axis
            ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, paddingTop);
            ctx.lineTo(paddingLeft, chartHeight - paddingBottom);
            ctx.stroke();

            // Draw X-axis
            ctx.beginPath();
            ctx.moveTo(paddingLeft, chartHeight - paddingBottom);
            ctx.lineTo(width - paddingRight, chartHeight - paddingBottom);
            ctx.stroke();

            // Draw Y-axis labels and grid
            for (let i = 0; i <= ySteps; i++) {
                const y = chartHeight - paddingBottom - (availableHeight / ySteps) * i;
                const value = (adjustedMaxValue / ySteps) * i;

                // Grid line
                ctx.strokeStyle = 'rgba(47, 107, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(paddingLeft, y);
                ctx.lineTo(width - paddingRight, y);
                ctx.stroke();

                // Y-axis label
                ctx.fillStyle = '#9CA3AF';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toLocaleString(), paddingLeft - 10, y);
            }

            // Draw axis labels
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Inter, system-ui, sans-serif';

            // Y-axis label (rotated)
            ctx.save();
            ctx.translate(15, chartHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText(yAxisLabel, 0, 0);
            ctx.restore();

            // X-axis label
            ctx.textAlign = 'center';
            ctx.fillText(xAxisLabel, paddingLeft + chartWidth / 2, chartHeight - 10);

            // Draw bars with 3D effect
            data.forEach((item, index) => {
                const x = paddingLeft + index * (barWidth + barSpacing);
                const barHeight = (item.value / adjustedMaxValue) * availableHeight * progress;
                const y = chartHeight - paddingBottom - barHeight;

                const color = item.color || '#2F6BFF';

                // 3D depth effect - draw side panel (right side)
                const depth = 8;
                ctx.fillStyle = `${color}40`;
                ctx.beginPath();
                ctx.moveTo(x + barWidth, y);
                ctx.lineTo(x + barWidth + depth, y - depth);
                ctx.lineTo(x + barWidth + depth, chartHeight - paddingBottom - depth);
                ctx.lineTo(x + barWidth, chartHeight - paddingBottom);
                ctx.closePath();
                ctx.fill();

                // 3D depth effect - draw top panel
                ctx.fillStyle = `${color}60`;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + depth, y - depth);
                ctx.lineTo(x + barWidth + depth, y - depth);
                ctx.lineTo(x + barWidth, y);
                ctx.closePath();
                ctx.fill();

                // Create gradient for main bar (front face)
                const gradient = ctx.createLinearGradient(x, y, x, chartHeight - paddingBottom);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, `${color}80`);

                // Draw main bar with rounded top
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeight, [8, 8, 0, 0]);
                ctx.fill();

                // Add inner highlight for 3D effect
                const highlightGradient = ctx.createLinearGradient(x, y, x + barWidth / 3, y);
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = highlightGradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth / 3, barHeight, [8, 0, 0, 0]);
                ctx.fill();

                // Add glow effect
                ctx.shadowColor = color;
                ctx.shadowBlur = 20;
                ctx.fillStyle = `${color}15`;
                ctx.beginPath();
                ctx.roundRect(x - 3, y - 3, barWidth + 6, barHeight + 6, [8, 8, 0, 0]);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw value on top
                if (showValues && progress === 1) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(
                        item.value.toLocaleString(),
                        x + barWidth / 2 + depth / 2,
                        y - depth - 8
                    );
                    ctx.shadowBlur = 0;
                }

                // Draw label at bottom
                ctx.fillStyle = '#9CA3AF';
                ctx.font = '11px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(
                    item.label,
                    x + barWidth / 2,
                    chartHeight - paddingBottom + 20
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
    }, [data, showValues, animate, yAxisLabel, xAxisLabel]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: `${height}px` }}
            className="rounded-lg"
        />
    );
}


