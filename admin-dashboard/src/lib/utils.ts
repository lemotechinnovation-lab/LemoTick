import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicate/conflicting classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Get initials from a full name
 * @param name - Full name string
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
    if (!name || typeof name !== 'string') return 'U'

    const parts = name.trim().split(/\s+/)

    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

    // Get first letter of first name and first letter of last name
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
