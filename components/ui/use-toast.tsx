import { useToast as useHookToast } from "@/components/ui/toast"

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const hookToast = useHookToast()
  
  return {
    toast: ({ title, description, variant = 'default' }: Toast) => {
      hookToast({
        title,
        description,
        variant,
      })
    },
  }
}
