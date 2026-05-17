import { useEffect, useRef, useState } from 'react';

interface DonutSegment {
    label: string;
    value: number;
    color: string;
}

interface ModernDonutChartProps {
    data: DonutSegment[];
    size?: number;
    thickness?: number;
    showLegend?: boolean;
    animate?: boolean;
    centerText?: string;
    centerValue?: string;
}

/**
 * Modern 3D donut chart with gradient segments, depth shadows, and hover effects
 * Perfect for showing proportional data with enhanced visual depth
 * 
 * 3D Features:
 * - Multi-layer depth shadows (8 layers)
 * - Radial gradients for lighting effect
 * - Inner highlight for shine
 * - 3D inset center circle
 * - Text shadows for depth
 */
export default function ModernDonutChart({
    data,
    size = 200,
    thickness = 30,
    showLegend = true,
    animate = true,
    centerText,
    centerValue,
}: ModernDonutChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const progressRef = useRef<number>(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length === 0) return;

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

            let currentAngle = -Math.PI / 2; // Start at top

            data.forEach((segment, index) => {
                const segmentAngle = (segment.value / total) * Math.PI * 2 * progress;
                const endAngle = currentAngle + segmentAngle;

                // Draw 3D depth/shadow layer
                const depthLayers = 8;
                for (let d = depthLayers; d > 0; d--) {
                    ctx.save();
                    ctx.translate(0, d * 1);
                    ctx.globalAlpha = 0.18 - (d * 0.02);

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                    ctx.lineWidth = thickness;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();

                    ctx.restore();
                }

                // Draw segment with enhanced glow
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                ctx.lineWidth = thickness + (hoveredIndex === index ? 6 : 0);
                ctx.strokeStyle = segment.color;

                // Add glow effect
                if (hoveredIndex === index) {
                    ctx.shadowColor = segment.color;
                    ctx.shadowBlur = 25;
                } else {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = segment.color;
                }

                ctx.stroke();
                ctx.shadowBlur = 0;

                // Draw main gradient overlay with 3D effect
                const gradient = ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, radius - thickness / 2,
                    centerX, centerY, radius + thickness / 2
                );
                gradient.addColorStop(0, `${segment.color}FF`);
                gradient.addColorStop(0.5, `${segment.color}EE`);
                gradient.addColorStop(1, `${segment.color}BB`);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                ctx.lineWidth = thickness;
                ctx.strokeStyle = gradient;
                ctx.stroke();

                // Add inner highlight for 3D effect
                const highlightGradient = ctx.createRadialGradient(
                    centerX - radius * 0.4, centerY - radius * 0.4, radius - thickness,
                    centerX, centerY, radius
                );
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                ctx.lineWidth = thickness * 0.6;
                ctx.strokeStyle = highlightGradient;
                ctx.stroke();

                currentAngle = endAngle;
            });

            // Draw center circle with 3D inset effect
            // Inner shadow for depth
            const centerRadius = radius - thickness / 2;

            // Draw shadow gradient for inset effect
            const insetGradient = ctx.createRadialGradient(
                centerX, centerY, centerRadius * 0.7,
                centerX, centerY, centerRadius
            );
            insetGradient.addColorStop(0, '#0B0633');
            insetGradient.addColorStop(1, '#050318');

            ctx.beginPath();
            ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
            ctx.fillStyle = insetGradient;
            ctx.fill();

            // Add inner shadow ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Add subtle highlight on top-left for 3D effect
            const highlightGradient = ctx.createRadialGradient(
                centerX - centerRadius * 0.3, centerY - centerRadius * 0.3, 0,
                centerX, centerY, centerRadius
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
            ctx.fillStyle = highlightGradient;
            ctx.fill();

            // Draw center text with shadow for depth
            if (centerText && progress === 1) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (centerValue) {
                    // Text shadow for 3D effect
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;

                    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(centerValue, centerX, centerY - 8);

                    ctx.font = '12px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#9CA3AF';
                    ctx.fillText(centerText, centerX, centerY + 12);

                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                } else {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;

                    ctx.font = '14px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(centerText, centerX, centerY);

                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                }
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
    }, [data, size, thickness, hoveredIndex, animate, centerText, centerValue, total]);

    return (
        <div className="flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                style={{ width: `${size}px`, height: `${size}px` }}
                className="cursor-pointer"
                onMouseMove={(e) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    const distance = Math.sqrt(x * x + y * y);
                    const radius = (size - thickness) / 2;

                    if (distance >= radius - thickness / 2 && distance <= radius + thickness / 2) {
                        let angle = Math.atan2(y, x) + Math.PI / 2;
                        if (angle < 0) angle += Math.PI * 2;

                        let currentAngle = 0;
                        for (let i = 0; i < data.length; i++) {
                            const segmentAngle = (data[i].value / total) * Math.PI * 2;
                            if (angle >= currentAngle && angle < currentAngle + segmentAngle) {
                                setHoveredIndex(i);
                                return;
                            }
                            currentAngle += segmentAngle;
                        }
                    }
                    setHoveredIndex(null);
                }}
                onMouseLeave={() => setHoveredIndex(null)}
            />

            {showLegend && (
                <div className="grid grid-cols-2 gap-3 w-full">
                    {data.map((segment, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${hoveredIndex === index ? 'bg-[#16124A]' : 'hover:bg-[#16124A]/50'
                                }`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{
                                    backgroundColor: segment.color,
                                    boxShadow: `0 0 8px ${segment.color}80`,
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-400 truncate">{segment.label}</div>
                                <div className="text-sm font-semibold text-white">
                                    {((segment.value / total) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


