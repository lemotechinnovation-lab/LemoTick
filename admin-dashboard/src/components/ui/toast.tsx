import { cn } from "@/lib/utils"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { AlertTriangle, Check, Info, Loader2, X } from "lucide-react"
import * as React from "react"

const ToastProvider = ToastPrimitives.Provider

// Custom animated success icon
const SuccessIcon = () => (
    <div className="relative">
        <motion.div
            className="absolute inset-0 rounded-full bg-green-400/30"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
        />
        <motion.div
            className="relative bg-green-500/30 rounded-full p-1.5 border border-green-400/50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Check className="h-3 w-3 text-green-400" />
            </motion.div>
        </motion.div>
    </div>
)

// Custom animated error icon
const ErrorIcon = () => (
    <div className="relative">
        <motion.div
            className="absolute inset-0 rounded-full bg-red-400/30"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
        />
        <motion.div
            className="relative bg-red-500/30 rounded-full p-1.5 border border-red-400/50"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <X className="h-3 w-3 text-red-400" />
            </motion.div>
        </motion.div>
    </div>
)

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed top-6 right-6 z-[200] flex max-h-screen w-full flex-col p-4 md:max-w-[380px]",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-2xl backdrop-blur-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
    {
        variants: {
            variant: {
                default: "border-[#2F6BFF]/40 bg-gradient-to-r from-[#0F0A2B]/95 via-[#16124A]/95 to-[#1A1450]/95 text-[#efdede] shadow-[#2F6BFF]/30",
                destructive:
                    "border-red-400/40 bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-900/90 text-red-100 shadow-red-500/30",
                success:
                    "border-green-400/40 bg-gradient-to-r from-green-900/90 via-green-800/90 to-green-900/90 text-green-100 shadow-green-500/30",
                warning:
                    "border-[#FFA62B]/40 bg-gradient-to-r from-orange-900/90 via-orange-800/90 to-orange-900/90 text-orange-100 shadow-[#FFA62B]/30",
                info:
                    "border-[#2F6BFF]/40 bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-blue-900/90 text-blue-100 shadow-[#2F6BFF]/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
        loading?: boolean
    }
>(({ className, variant, loading, children, ...props }, ref) => {
    const getIcon = () => {
        if (loading) return (
            <div className="relative">
                <motion.div
                    className="absolute inset-0 rounded-full bg-[#2F6BFF]/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative bg-[#2F6BFF]/20 rounded-full p-1.5 border border-[#2F6BFF]/50">
                    <Loader2 className="h-3 w-3 animate-spin text-[#2F6BFF]" />
                </div>
            </div>
        )

        switch (variant) {
            case "success":
                return <SuccessIcon />
            case "destructive":
                return <ErrorIcon />
            case "warning":
                return (
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 rounded-full bg-[#FFA62B]/30"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                        />
                        <div className="relative bg-[#FFA62B]/30 rounded-full p-1.5 border border-[#FFA62B]/50">
                            <AlertTriangle className="h-3 w-3 text-[#FFA62B]" />
                        </div>
                    </div>
                )
            case "info":
                return (
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 rounded-full bg-[#2F6BFF]/30"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                        />
                        <div className="relative bg-[#2F6BFF]/30 rounded-full p-1.5 border border-[#2F6BFF]/50">
                            <Info className="h-3 w-3 text-[#2F6BFF]" />
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="relative">
                        <div className="bg-[#2F6BFF]/30 rounded-full p-1.5 border border-[#2F6BFF]/50">
                            <Info className="h-3 w-3 text-[#2F6BFF]" />
                        </div>
                    </div>
                )
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -50, scale: 0.95, x: 50 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.4
            }}
            className="mb-2"
            whileHover={{ scale: 1.02 }}
        >
            <ToastPrimitives.Root
                ref={ref}
                className={cn(toastVariants({ variant }), className)}
                {...props}
            >
                {/* Background glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2F6BFF]/5 via-transparent to-[#FFA62B]/5 opacity-50"></div>

                {/* Animated border for success and error */}
                {(variant === "success" || variant === "destructive") && (
                    <motion.div
                        className={`absolute inset-0 rounded-xl border-2 ${variant === "success" ? "border-green-400/50" : "border-red-400/50"
                            }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    />
                )}

                <div className="flex items-start gap-3 w-full relative z-10">
                    {getIcon() && (
                        <motion.div
                            className="flex-shrink-0 mt-0.5"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {getIcon()}
                        </motion.div>
                    )}
                    <motion.div
                        className="flex-1 min-w-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </ToastPrimitives.Root>
        </motion.div>
    )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#2F6BFF]/30 bg-transparent px-3 text-xs font-medium text-[#efdede] transition-colors hover:bg-[#2F6BFF]/20 hover:border-[#2F6BFF]/50 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] disabled:pointer-events-none disabled:opacity-50",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            "absolute right-2 top-2 rounded-md p-1 text-[#efdede]/50 opacity-0 transition-all hover:text-[#efdede] hover:bg-[#2F6BFF]/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] group-hover:opacity-100",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-sm font-bold text-[#efdede] drop-shadow-sm", className)}
        {...props}
    />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn("text-xs text-[#efdede]/80 mt-1", className)}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
    Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, type ToastActionElement, type ToastProps
}



