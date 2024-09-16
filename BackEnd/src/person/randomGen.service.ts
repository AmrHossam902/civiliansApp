import { randomInt } from "crypto";


export type Cdf = {
    x: number[],
    y: number[]
}


export class RandomGenService {


    //using inverse transform method
    static generateSymExpRV(mean: number, lambda: number){
    
        let leftOrRight = randomInt(0, 100) > 50 ? 1: -1;
        let u = randomInt(0, 100) / 100;
        return mean + leftOrRight * Math.log( 1 - u ) / (-lambda) ;

    }

    static generateDiscreteRV(cdf: Cdf){
    
        let u = randomInt(0, 100) / 100;

        let i =0; 
        while(i< cdf.y.length ){
            if(u < cdf.y[i])
                return cdf.x[i];
            i++;
        }
    }


}