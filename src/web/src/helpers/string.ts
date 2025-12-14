

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

export const pluralizeEn = (count: number, name: string): string => {
    if (count > 1) {
        return `${name}s`
    }
    return name
}

export const pluralizePl = (count: number, var1: string, var2_4: string, var5_inf: string): string => {
    const n = Math.abs(count);
    
    if (n === 1) {
        return var1;
    }
    
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod100 >= 12 && mod100 <= 14) {
        return var5_inf;
    }

    if (mod10 >= 2 && mod10 <= 4) {
        return var2_4;
    }

    return var5_inf;
}
