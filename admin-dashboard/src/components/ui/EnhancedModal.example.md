# EnhancedModal - Reusable Modal Component

A premium, reusable modal component with glass-morphism effects, animated backgrounds, and gradient styling that matches the design system.

## Components

### 1. EnhancedModal
The main modal wrapper with animated background, glass effects, and header.

### 2. ModalSectionCard
Colored section cards for organizing content within modals.

### 3. ModalActions
Container for action buttons at the bottom of modals.

### 4. ModalButton
Styled buttons with variants (primary, secondary, danger).

## Usage Example

```tsx
import {
    EnhancedModal,
    ModalSectionCard,
    ModalActions,
    ModalButton,
} from '@/components/ui/EnhancedModal';

function MyModal({ isOpen, onClose }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        onClose();
    };

    return (
        <EnhancedModal
            isOpen={isOpen}
            onClose={onClose}
            title="My Modal Title"
            maxWidth="xl" // sm, md, lg, xl, 2xl
            showCloseButton={true}
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Blue Section */}
                <ModalSectionCard
                    title="SECTION TITLE"
                    colorScheme="blue" // blue, orange, red, green, purple
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                >
                    {/* Your form fields here */}
                    <div className="space-y-1.5">
                        <label className="block text-xs text-gray-300 font-semibold">Field Label</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-gradient-to-br from-[#2F6BFF]/15 to-purple-500/10 hover:from-[#2F6BFF]/25 hover:to-purple-500/20 border-2 border-[#2F6BFF]/40 hover:border-[#2F6BFF]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/30 transition-all duration-300 text-sm smooth-hover font-medium"
                            placeholder="Enter value"
                        />
                    </div>
                </ModalSectionCard>

                {/* Orange Section */}
                <ModalSectionCard
                    title="ANOTHER SECTION"
                    colorScheme="orange"
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                >
                    {/* More form fields */}
                </ModalSectionCard>

                {/* Action Buttons */}
                <ModalActions>
                    <ModalButton type="button" onClick={onClose} variant="secondary">
                        Cancel
                    </ModalButton>
                    <ModalButton type="submit" variant="primary">
                        Save Changes
                    </ModalButton>
                </ModalActions>
            </form>
        </EnhancedModal>
    );
}
```

## Color Schemes

Available color schemes for `ModalSectionCard`:
- **blue**: Primary brand blue (#2F6BFF)
- **orange**: Accent orange (#FFA62B)
- **red**: Error/warning red
- **green**: Success green
- **purple**: Purple accent

## Input Field Styling

For consistent styling, use these classes for input fields based on the section color:

### Blue Section Inputs
```tsx
className="w-full px-3 py-2 bg-gradient-to-br from-[#2F6BFF]/15 to-purple-500/10 hover:from-[#2F6BFF]/25 hover:to-purple-500/20 border-2 border-[#2F6BFF]/40 hover:border-[#2F6BFF]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/30 transition-all duration-300 text-sm smooth-hover font-medium"
```

### Orange Section Inputs
```tsx
className="w-full px-3 py-2 bg-gradient-to-br from-[#FFA62B]/15 to-yellow-500/10 hover:from-[#FFA62B]/25 hover:to-yellow-500/20 border-2 border-[#FFA62B]/40 hover:border-[#FFA62B]/70 rounded-lg text-white focus:outline-none focus:border-[#FFA62B] focus:ring-2 focus:ring-[#FFA62B]/30 transition-all duration-300 text-sm cursor-pointer smooth-hover font-medium"
```

### Red Section Inputs
```tsx
className="w-full px-3 py-2 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 text-sm smooth-hover font-medium"
```

## Button Variants

- **primary**: Blue gradient button for main actions
- **secondary**: Gray button for cancel/back actions
- **danger**: Red button for destructive actions

## Props

### EnhancedModal
- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Close handler
- `title`: string - Modal title
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' - Modal width (default: 'xl')
- `showCloseButton`: boolean - Show/hide close button (default: true)
- `children`: ReactNode - Modal content

### ModalSectionCard
- `title`: string (optional) - Section title
- `icon`: ReactNode (optional) - Icon component
- `colorScheme`: 'blue' | 'orange' | 'red' | 'green' | 'purple' - Color theme
- `className`: string (optional) - Additional classes
- `children`: ReactNode - Section content

### ModalButton
- `type`: 'button' | 'submit' | 'reset' - Button type
- `onClick`: () => void (optional) - Click handler
- `variant`: 'primary' | 'secondary' | 'danger' - Button style
- `disabled`: boolean - Disabled state
- `className`: string (optional) - Additional classes
- `children`: ReactNode - Button content
