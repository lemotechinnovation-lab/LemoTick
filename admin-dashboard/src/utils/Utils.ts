export const formatValue = (value) => Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value);

export const formatThousands = (value) => Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value);

export const getCssVariable = (variable) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

  // If the CSS variable is not found or empty, return a fallback
  if (!value) {
    // Silently return fallback colors based on common variable names
    const fallbacks = {
      '--color-gray-100': '#efdede',
      '--color-gray-400': '#9ca3af',
      '--color-gray-500': '#6b7280',
      '--color-gray-700': '#374151',
      '--color-gray-800': '#1f2937',
      '--color-white': '#efdede',
      '--color-text-primary': '#FFFFFF',
      '--color-text-secondary': '#B9BDC7',
      '--color-card': '#35335e',
      '--color-border': 'rgba(47, 107, 255, 0.2)',
    };
    return fallbacks[variable] || '#efdede';
  }

  return value;
};

const adjustHexOpacity = (hexColor, opacity) => {
  // Remove the '#' if it exists
  hexColor = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const adjustRGBOpacity = (rgbColor, opacity) => {
  // Extract RGB values from rgb() or rgba() format
  const match = rgbColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return rgbColor;
};

const adjustHSLOpacity = (hslColor, opacity) => {
  // Convert HSL to HSLA
  return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
};

const adjustOKLCHOpacity = (oklchColor, opacity) => {
  // Add alpha value to OKLCH color
  return oklchColor.replace(/oklch\((.*?)\)/, (match, p1) => `oklch(${p1} / ${opacity})`);
};

export const adjustColorOpacity = (color, opacity) => {
  // Handle empty or invalid color
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color value:', color);
    return `rgba(0, 0, 0, ${opacity})`;
  }

  const trimmedColor = color.trim();

  if (trimmedColor.startsWith('#')) {
    return adjustHexOpacity(trimmedColor, opacity);
  } else if (trimmedColor.startsWith('rgb')) {
    return adjustRGBOpacity(trimmedColor, opacity);
  } else if (trimmedColor.startsWith('hsl')) {
    return adjustHSLOpacity(trimmedColor, opacity);
  } else if (trimmedColor.startsWith('oklch')) {
    return adjustOKLCHOpacity(trimmedColor, opacity);
  } else {
    // If it's a plain number like "229 231 235", assume it's RGB values
    const parts = trimmedColor.split(/\s+/);
    if (parts.length === 3 && parts.every(p => !isNaN(Number(p)))) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
    }

    // Return a fallback instead of throwing an error
    return `rgba(0, 0, 0, ${opacity})`;
  }
};

export const oklchToRGBA = (oklchColor) => {
  // Create a temporary div to use for color conversion
  const tempDiv = document.createElement('div');
  tempDiv.style.color = oklchColor;
  document.body.appendChild(tempDiv);

  // Get the computed style and convert to RGB
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  return computedColor;
};