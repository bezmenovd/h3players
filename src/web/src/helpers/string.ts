

/**
 * 
 * @param count - число
 * @param var1 - именительный падеж (минута)
 * @param var2 - родительный падеж, единственное число (минуты)
 * @param var5 - родительный падеж, множественное число (минут)
 */
export const pluralize = (count: number, var1: string, var2: string, var5: string): string => {
    const n = Math.abs(count)
    const mod10 = n % 10
    const mod100 = n % 100

    if (mod100 < 10 || mod100 > 20) {
        if (mod10 === 1) {
            return var1
        }
        if (mod10 < 5 && mod10 > 0) {
            return var2
        }
    }

    return var5
}
