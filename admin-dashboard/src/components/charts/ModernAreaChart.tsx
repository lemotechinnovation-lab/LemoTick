import { useEffect, useRef } from 'react';

interface ModernAreaChartProps {
    data: number[];
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    height?: number;
    showGrid?: boolean;
    animate?: boolean;
    xLabels?: string[];
    yAxisLabel?: string;
    xAxisLabel?: string;
}

/**
 * Modern 3D area chart with gradient fill, depth shadows, and smooth animations
 * Features:
 * - 3D depth effect with shadows
 * - Smooth gradient fills
 * - Animated path drawing
 * - Responsive design
 * - Glow effects
 * - X and Y axis with labels
 */
export default function ModernAreaChart({
    data,
    color = '#2F6BFF',
    gradientFrom = '#2F6BFF',
    gradientTo = '#FFA62B',
    height = 200,
    showGrid = true,
    animate = true,
    xLabels,
    yAxisLabel = 'Value',
    xAxisLabel = 'Time',
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

        // Calculate data points with more padding for axes
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const paddingLeft = 60;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 50;
        const chartWidth = width - paddingLeft - paddingRight;
        const availableHeight = chartHeight - paddingTop - paddingBottom;

        const points = data.map((value, index) => ({
            x: paddingLeft + (index / (data.length - 1)) * chartWidth,
            y: paddingTop + availableHeight - ((value - min) / range) * availableHeight,
        }));

        // Animation function
        const draw = (progress: number) => {
            ctx.clearRect(0, 0, width, chartHeight);

            // Set font
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
            const ySteps = 5;
            for (let i = 0; i <= ySteps; i++) {
                const y = paddingTop + (availableHeight / ySteps) * i;
                const value = max - (range / ySteps) * i;

                // Grid line
                if (showGrid && i < ySteps) {
                    ctx.strokeStyle = 'rgba(47, 107, 255, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(paddingLeft, y);
                    ctx.lineTo(width - paddingRight, y);
                    ctx.stroke();
                }

                // Y-axis label
                ctx.fillStyle = '#9CA3AF';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toLocaleString('en-US', { maximumFractionDigits: 0 }), paddingLeft - 10, y);
            }

            // Draw X-axis labels
            const xStep = Math.ceil(data.length / 6);
            data.forEach((_, index) => {
                if (index % xStep === 0 || index === data.length - 1) {
                    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
                    const label = xLabels && xLabels[index] ? xLabels[index] : `Day ${index + 1}`;

                    ctx.fillStyle = '#9CA3AF';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(label, x, chartHeight - paddingBottom + 10);
                }
            });

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

            const visiblePoints = Math.floor(points.length * progress);
            if (visiblePoints < 2) return;

            // Draw 3D shadow/depth layer
            ctx.save();
            ctx.translate(5, 5);
            ctx.globalAlpha = 0.25;

            ctx.beginPath();
            ctx.moveTo(points[0].x, chartHeight - paddingBottom);
            ctx.lineTo(points[0].x, points[0].y);

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
                ctx.lineTo(last.x, chartHeight - paddingBottom);
            } else {
                const last = points[visiblePoints - 1];
                ctx.lineTo(last.x, last.y);
                ctx.lineTo(last.x, chartHeight - paddingBottom);
            }

            ctx.closePath();
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.restore();

            // Create gradient with 3D depth
            const gradient = ctx.createLinearGradient(0, paddingTop, 0, chartHeight - paddingBottom);
            gradient.addColorStop(0, `${gradientFrom}95`);
            gradient.addColorStop(0.3, `${gradientFrom}70`);
            gradient.addColorStop(0.7, `${gradientFrom}40`);
            gradient.addColorStop(1, `${gradientTo}15`);

            // Draw main area
            ctx.beginPath();
            ctx.moveTo(points[0].x, chartHeight - paddingBottom);
            ctx.lineTo(points[0].x, points[0].y);

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
                ctx.lineTo(last.x, chartHeight - paddingBottom);
            } else {
                const last = points[visiblePoints - 1];
                ctx.lineTo(last.x, last.y);
                ctx.lineTo(last.x, chartHeight - paddingBottom);
            }

            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Add inner highlight for 3D effect
            const highlightGradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + 80);
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(points[0].x, chartHeight - paddingBottom);
            ctx.lineTo(points[0].x, points[0].y);

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
                ctx.lineTo(last.x, chartHeight - paddingBottom);
            } else {
                const last = points[visiblePoints - 1];
                ctx.lineTo(last.x, last.y);
                ctx.lineTo(last.x, chartHeight - paddingBottom);
            }

            ctx.closePath();
            ctx.fillStyle = highlightGradient;
            ctx.fill();

            // Draw shadow line
            ctx.save();
            ctx.translate(3, 3);
            ctx.globalAlpha = 0.35;
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

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.restore();

            // Draw main line with glow
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

            ctx.shadowColor = color;
            ctx.shadowBlur = 18;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // Draw dots with 3D effect
            ctx.shadowBlur = 0;
            points.slice(0, visiblePoints).forEach((point) => {
                // 3D shadow
                ctx.beginPath();
                ctx.arc(point.x + 2.5, point.y + 2.5, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.fill();

                // Outer glow
                ctx.beginPath();
                ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
                ctx.fillStyle = `${color}45`;
                ctx.fill();

                // Main dot with radial gradient
                const dotGradient = ctx.createRadialGradient(
                    point.x - 1.5, point.y - 1.5, 0,
                    point.x, point.y, 5
                );
                dotGradient.addColorStop(0, '#ffffff');
                dotGradient.addColorStop(0.25, color);
                dotGradient.addColorStop(1, `${color}DD`);

                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = dotGradient;
                ctx.fill();

                // Highlight
                ctx.beginPath();
                ctx.arc(point.x - 1.5, point.y - 1.5, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
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
    }, [data, color, gradientFrom, gradientTo, showGrid, animate, xLabels, yAxisLabel, xAxisLabel]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: `${height}px` }}
            className="rounded-lg"
        />
    );
}


