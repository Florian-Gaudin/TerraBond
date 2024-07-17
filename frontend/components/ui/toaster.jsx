"use client";

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider className="text-lg bg-gradient-to-r from-purple to-red text-transparent bg-clip-text bg-white border-2 border-white">
            {toasts.map(function ({
                id,
                title,
                description,
                action,
                ...props
            }) {
                return (
                    <Toast
                        key={id}
                        {...props}
                        className="text-lg font-extrabold bg-gradient-to-r from-purple to-red text-transparent bg-clip-text bg-white"
                    >
                        <div className="grid gap-1">
                            {title && (
                                <ToastTitle className="text-lg font-extrabold bg-gradient-to-r from-purple to-red text-transparent bg-clip-text bg-white">
                                    {title}
                                </ToastTitle>
                            )}
                            {description && (
                                <ToastDescription className="text-xl font-extrabold rounded-md bg-gradient-to-r from-purple to-red text-transparent bg-clip-text bg-white">
                                    {description}
                                </ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport className="bg-gradient-to-r from-purple to-red text-transparent bg-clip-text bg-white" />
        </ToastProvider>
    );
}
