import React, { useEffect, useRef, useState } from 'react';
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
import { formatThousands } from '../utils/Utils';

Chart.register(BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend);

function BarChart03({
  data,
  width,
  height
}) {

  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const legend = useRef(null);
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
              callback: (value) => formatThousands(value),
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
                month: 'MMM',
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
              label: (context) => formatThousands(context.parsed.y),
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
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
      plugins: [{
        id: 'htmlLegend',
        afterUpdate(c) {
          const ul = legend.current
          if (!ul) return
          // Remove old legend items
          while (ul.firstChild) {
            ul.firstChild.remove()
          }
          // Reuse the built-in legendItems generator
          const items = c.options.plugins.legend.labels.generateLabels(c)
          items.forEach((item) => {
            const li = document.createElement('li')
            // Button element
            const button = document.createElement('button')
            button.style.display = 'inline-flex';
            button.style.alignItems = 'center';
            button.style.opacity = item.hidden ? '.3' : '';
            button.onclick = () => {
              c.setDatasetVisibility(item.datasetIndex, !c.isDatasetVisible(item.datasetIndex))
              c.update()
            };
            // Color box
            const box = document.createElement('span')
            box.style.display = 'block';
            box.style.width = '12px';
            box.style.height = '12px';
            box.style.borderRadius = 'calc(infinity * 1px)';
            box.style.marginRight = '8px';
            box.style.borderWidth = '3px';
            box.style.borderColor = typeof item.fillStyle === 'string' ? item.fillStyle : '#efdede';
            box.style.pointerEvents = 'none';
            // Label
            const label = document.createElement('span')
            label.classList.add('text-gray-300', 'dark:text-gray-200');
            label.style.fontSize = '14px';
            label.style.lineHeight = 'calc(1.25 / 0.875)';
            const labelText = document.createTextNode(item.text)
            label.appendChild(labelText)
            li.appendChild(button)
            button.appendChild(box)
            button.appendChild(label)
            ul.appendChild(li)
          })
        },
      }],
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
    <React.Fragment>
      <div className="px-5 py-4">
        <div className="grow mb-1">
          <ul ref={legend} className="flex flex-wrap gap-x-4"></ul>
        </div>
      </div>
      <div className="grow">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </React.Fragment>
  );
}

export default BarChart03;
