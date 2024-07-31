import { Data } from './interfaces/dexTypes';

export class DexCalculators {
    data: Data;

    constructor(data: Data) {
        this.data = data;
    }

    calculateM5VolumeSum(): number {
        return this.data.pairs.reduce((sum, pair) => sum + pair.volume.m5, 0);
    }

    calculateAveragePriceUsd(): number {
        const totalPairs = this.data.pairs.length;
        if (totalPairs === 0) {
            return 0;
        }
        const totalPriceUsd = this.data.pairs.reduce((sum, pair) => {
            if (pair.priceUsd && !isNaN(parseFloat(pair.priceUsd))) {
                return sum + parseFloat(pair.priceUsd);
            }
            return sum;
        }, 0);
        return totalPriceUsd / totalPairs;
    };

    calculateTotalFdV(): number {
        return this.data.pairs.reduce((sum, pair) => {
            const fdv = pair.fdv;
            if (typeof fdv === 'number' && !isNaN(fdv)) {
                return sum + fdv;
            }
            return sum;
        }, 0);
    }

    calculateTotalLiquidityUsd(): number {
        return this.data.pairs.reduce((sum, pair) => {
            const liquidityUsd = pair.liquidity.usd;
            if (typeof liquidityUsd === 'number' && !isNaN(liquidityUsd)) {
                return Math.floor(sum) + Math.floor(liquidityUsd);
            }
            return Math.floor(sum);
        }, 0);
    }

    calculateVWAP(): number {
        let totalPriceVolume = 0;
        let totalVolume = 0;
        
        this.data.pairs.forEach(pair => {
            const priceUsd = parseFloat(pair.priceUsd);
            const volumeM5 = pair.volume.m5;
            
            if (!isNaN(priceUsd) && !isNaN(volumeM5) && volumeM5 > 0) {
                totalPriceVolume += priceUsd * volumeM5;
                totalVolume += volumeM5;
            }
        });
        
        if (totalVolume === 0) {
            return 0; // Return 0 to avoid division by zero
        }
        
        return totalPriceVolume / totalVolume;
    }

}