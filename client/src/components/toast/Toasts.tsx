import React, { useEffect, useState } from "react"
import { AlertCircle, X } from "lucide-react"

interface ToastProps {
    message: string
    isVisible: boolean
    onClose: () => void
    duration?: number
}

export const Toast: React.FC<ToastProps> = ({
    message,
    isVisible,
    onClose,
    duration = 3000,
}) => {
    const [isShowing, setIsShowing] = useState(false)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        let progressInterval: NodeJS.Timeout
        let hideTimeout: NodeJS.Timeout

        if (isVisible) {
            setIsShowing(true)
            setProgress(100)

            const startTime = Date.now()
            const updateInterval = 10 // Update progress every 10ms

            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
                setProgress(remaining)

                if (remaining <= 0) {
                    clearInterval(progressInterval)
                }
            }, updateInterval)

            hideTimeout = setTimeout(() => {
                setIsShowing(false)
                onClose()
            }, duration)
        }

        return () => {
            clearInterval(progressInterval)
            clearTimeout(hideTimeout)
        }
    }, [isVisible, duration, onClose])

    if (!isShowing) return null

    return (
        <div className="animate-fade-in fixed right-4 top-4 w-full max-w-sm">
            <div className="rounded-lg bg-red-500 px-4 py-3 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <p className="pr-4">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsShowing(false)
                            onClose()
                        }}
                        className="text-white transition-colors hover:text-red-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-red-600">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
