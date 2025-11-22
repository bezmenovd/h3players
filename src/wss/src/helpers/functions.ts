
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

export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    interval: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timer: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        const remaining = interval - (now - lastCall);
        lastArgs = args;

        if (remaining <= 0) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastCall = now;
            fn(...lastArgs);
            lastArgs = null;
        } else if (!timer) {
            timer = setTimeout(() => {
                lastCall = Date.now();
                fn(...(lastArgs as Parameters<T>));
                lastArgs = null;
                timer = null;
            }, remaining);
        }
    };
}
