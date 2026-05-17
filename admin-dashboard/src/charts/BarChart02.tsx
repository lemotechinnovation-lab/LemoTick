import { useEffect, useRef, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import {
  BarController, BarElement,
  Chart,
  Legend,
  LinearScale, TimeScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { chartColors } from './ChartjsConfig';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend);

function BarChart02({
  data,
  width,
  height
}) {

  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx || !ctx.parentNode) return;

    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        layout: {
          padding: {
            top: 12,
            bottom: 16,
            left: 20,
            right: 20,
          },
        },
        scales: {
          y: {
            stacked: true,
            border: {
              display: false,
            },
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 5,
              callback: (value) => formatValue(value),
              color: darkMode ? textColor.dark : textColor.light,
            },
            grid: {
              color: darkMode ? gridColor.dark : gridColor.light,
            },
          },
          x: {
            stacked: true,
            type: 'time',
            time: {
              parser: 'MM-DD-YYYY',
              unit: 'month',
              displayFormats: {
                month: 'MMM YY',
              },
            },
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              autoSkipPadding: 48,
              maxRotation: 0,
              color: darkMode ? textColor.dark : textColor.light,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: () => '', // Disable tooltip title
              label: (context) => formatValue(context.parsed.y),
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 200,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });
    setChart(newChart);
    return () => {
      if (newChart && canvas.current && canvas.current.parentNode) {
        try {
          newChart.destroy();
        } catch (error) {
          console.debug('Chart cleanup error (safe to ignore):', error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chart || !canvas.current || !canvas.current.parentNode) return;

    try {
      if (darkMode) {
        chart.options.scales.x.ticks.color = textColor.dark;
        chart.options.scales.y.ticks.color = textColor.dark;
        chart.options.scales.y.grid.color = gridColor.dark;
        chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark;
        chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark;
        chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark;
      } else {
        chart.options.scales.x.ticks.color = textColor.light;
        chart.options.scales.y.ticks.color = textColor.light;
        chart.options.scales.y.grid.color = gridColor.light;
        chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light;
        chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light;
        chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light;
      }
      chart.update('none');
    } catch (error) {
      console.debug('Chart theme update error (safe to ignore):', error);
    }
  }, [currentTheme]);

  return (
    <canvas ref={canvas} width={width} height={height}></canvas>
  );
}

export default BarChart02;

