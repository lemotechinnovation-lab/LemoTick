import { useEffect, useRef, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import {
  Chart,
  Filler,
  LinearScale,
  LineController, LineElement,
  PointElement,
  TimeScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { chartColors } from './ChartjsConfig';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);

function LineChart01({
  data,
  width,
  height
}) {

  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx || !ctx.parentNode) return;

    let newChart = null;
    try {
      newChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          layout: {
            padding: 20,
          },
          scales: {
            y: {
              display: false,
              beginAtZero: true,
            },
            x: {
              type: 'time',
              time: {
                parser: 'MM-DD-YYYY',
                unit: 'month',
              },
              display: false,
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: () => '', // Disable tooltip title
                label: (context) => formatValue(context.parsed.y),
              },
              bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
              backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
              borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
            },
            legend: {
              display: false,
            },
          },
          interaction: {
            intersect: false,
            mode: 'nearest',
          },
          maintainAspectRatio: false,
          resizeDelay: 200,
          responsive: true,
        },
      });
      setChart(newChart);
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    return () => {
      if (newChart && canvas.current && canvas.current.parentNode) {
        try {
          // Stop all animations and unbind events before destroying
          newChart.stop();
          newChart.options.responsive = false;
          newChart.options.animation = false;
          newChart.destroy();
        } catch (error) {
          // Silently catch errors during cleanup
          console.debug('Chart cleanup error (safe to ignore):', error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chart || !canvas.current) return;

    try {
      // Check if chart is still mounted and canvas exists
      if (!chart.canvas || !chart.canvas.parentNode) return;

      if (darkMode) {
        chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark;
        chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark;
        chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark;
      } else {
        chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light;
        chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light;
        chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light;
      }
      chart.update('none');
    } catch (error) {
      console.debug('Chart theme update error (safe to ignore):', error);
    }
  }, [currentTheme, chart, darkMode, tooltipBodyColor, tooltipBgColor, tooltipBorderColor]);

  // Update chart data when data prop changes
  useEffect(() => {
    if (!chart || !canvas.current) return;

    try {
      // Check if chart is still mounted and canvas exists
      if (!chart.canvas || !chart.canvas.parentNode) return;

      chart.data = data;
      chart.update('none');
    } catch (error) {
      console.debug('Chart data update error (safe to ignore):', error);
    }
  }, [data, chart]);

  return (
    <canvas ref={canvas} width={width} height={height}></canvas>
  );
}

export default LineChart01;