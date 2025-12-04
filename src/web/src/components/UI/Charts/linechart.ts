
export function generateYLabels(maxValue: number, minValue: number = 0, count: number = 5): number[] {
    const range = maxValue - minValue;
    if (range <= 0) return [minValue]; 
    
    const idealStep = range / (count - 1);
    
    const powerOfTen = Math.pow(10, Math.floor(Math.log10(idealStep)));
    const niceMultipliers = [1, 2, 2.5, 5, 10]; 
    
    let niceStep = powerOfTen;
    
    for (const mult of niceMultipliers) {
        const candidateStep = mult * powerOfTen;
        
        if (candidateStep >= idealStep) {
            niceStep = candidateStep;
            break;
        }
    }
    
    if (niceStep > idealStep * 1.5 && niceStep !== 1) { 
        const currentIndex = niceMultipliers.indexOf(niceStep / powerOfTen);
        
        if (currentIndex > 0) {
            const previousMultiplier = niceMultipliers[currentIndex - 1];
            niceStep = previousMultiplier * powerOfTen;
        }
    }
    
    const labels: number[] = [];
    
    let currentTick = Math.floor(minValue / niceStep) * niceStep;

    if (minValue === 0) {
        currentTick = 0;
    } else {
        currentTick = Math.floor(minValue / niceStep) * niceStep;
    }

    if (currentTick < minValue) {
        currentTick += niceStep;
    }
    
    while (currentTick <= maxValue) {
        labels.push(currentTick);
        currentTick += niceStep;
    }
    
    if (labels[labels.length - 1] < maxValue) {
        labels.push(labels[labels.length - 1] + niceStep);
    } 
    
    if (minValue <= 0 && labels[0] > 0) {
        labels.unshift(0);
    }

    if (labels[0] !== 0 && Math.abs(labels[0]) < niceStep * 0.001) {
        labels[0] = 0;
    }

    return labels.map(t => parseFloat(t.toFixed(4)));
}
