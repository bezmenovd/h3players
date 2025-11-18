
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null
    let latestArgs: Parameters<T> | null = null
  
    return (...args: Parameters<T>) => {
        latestArgs = args
    
        if (timer) {
            clearTimeout(timer)
        }
    
        timer = setTimeout(() => {
            if (latestArgs !== null) {
                fn(...latestArgs)
                latestArgs = null
            }
            timer = null
        }, delay)
    }
}
