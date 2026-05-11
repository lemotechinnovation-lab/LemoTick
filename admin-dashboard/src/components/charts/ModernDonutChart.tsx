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
 * Modern donut chart with gradient segments and hover effects
 * Perfect for showing proportional data
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

                // Draw segment with glow
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                ctx.lineWidth = thickness + (hoveredIndex === index ? 4 : 0);
                ctx.strokeStyle = segment.color;

                // Add glow effect
                if (hoveredIndex === index) {
                    ctx.shadowColor = segment.color;
                    ctx.shadowBlur = 20;
                } else {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = segment.color;
                }

                ctx.stroke();
                ctx.shadowBlur = 0;

                // Draw inner gradient overlay
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, radius - thickness / 2,
                    centerX, centerY, radius + thickness / 2
                );
                gradient.addColorStop(0, `${segment.color}FF`);
                gradient.addColorStop(1, `${segment.color}CC`);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                ctx.lineWidth = thickness;
                ctx.strokeStyle = gradient;
                ctx.stroke();

                currentAngle = endAngle;
            });

            // Draw center circle (background)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - thickness / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#0B0633';
            ctx.fill();

            // Draw center text
            if (centerText && progress === 1) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (centerValue) {
                    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(centerValue, centerX, centerY - 8);

                    ctx.font = '12px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#9CA3AF';
                    ctx.fillText(centerText, centerX, centerY + 12);
                } else {
                    ctx.font = '14px Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(centerText, centerX, centerY);
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
