const { randomInt } = require("crypto");

//using inverse transform method
function generateExpRV(mean, lambda){
    
    let leftOrRight = randomInt(0, 100) > 50 ? 1: -1;
    let u = randomInt(0, 100) / 100;
    return [u, mean + leftOrRight * Math.log( 1 - u ) / (-lambda) ] ;

}



function generateDiscreteRV(cdf){
    
    let u = randomInt(0, 100) / 100;

    let i =0; 
    while(i< cdf.c.length ){
        if(u < cdf.c[i])
            return cdf.x[i];
        i++;
    }
}

let cdf = {
    x : [0, 1],
    c : [0.6, 0.4]
}

let count3 = 0;
let count5 = 0;
for(i=0; i< 1000; i++){
    let r = generateDiscreteRV(cdf);
    if(r == 3)
            count3++;
    else if(r == 5)
            count5++;
}

console.log("prop3 = ", count3/1000, " prob5 = ", count5 / 1000);
/* 
for(i=0; i< 300; i++){
    console.log(generateExpRV(60, 0.2));
} */