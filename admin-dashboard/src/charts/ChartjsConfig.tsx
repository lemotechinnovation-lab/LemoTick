import { Chart, Tooltip } from 'chart.js';
import { adjustColorOpacity, getCssVariable } from '../utils/Utils';

Chart.register(Tooltip);

// Global chart font
Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;

// Tooltip styling
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.displayColors = false;
Chart.defaults.plugins.tooltip.mode = 'nearest';
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.position = 'nearest';
Chart.defaults.plugins.tooltip.caretSize = 0;
Chart.defaults.plugins.tooltip.caretPadding = 16;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 10;

// Chart gradient generator
export const chartAreaGradient = (ctx, chartArea, colorStops) => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return 'transparent';
  }

  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });

  return gradient;
};

// LemoTick chart colors
export const chartColors = {

  textColor: {
    light: '#6B7280',
    dark: getCssVariable('--color-text-secondary'),
  },

  gridColor: {
    light: 'rgba(0,0,0,0.05)',
    dark: adjustColorOpacity(getCssVariable('--color-border'), 0.7),
  },

  backdropColor: {
    light: '#FFFFFF',
    dark: getCssVariable('--color-card'),
  },

  tooltipTitleColor: {
    light: '#111827',
    dark: getCssVariable('--color-text-primary'),
  },

  tooltipBodyColor: {
    light: '#6B7280',
    dark: getCssVariable('--color-text-secondary'),
  },

  tooltipBgColor: {
    light: '#FFFFFF',
    dark: getCssVariable('--color-card'),
  },

  tooltipBorderColor: {
    light: '#E5E7EB',
    dark: getCssVariable('--color-border'),
  },
};

