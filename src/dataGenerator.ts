
import { faker } from '@faker-js/faker';
import { Person } from './person/models/Person';
import { randomInt, randomUUID } from 'crypto';
import { MarriageRecord } from './person/models/MarriageRecord';




export function generatePeople(count: number){
    

    //generate seeds 
    let seedsCount = 100;
    
    let marriedMales: Person[];
    let marriedFemales: Person[];
    let allPeople: Person[];
    let marriageRecords: MarriageRecord[];

    for(let i =0; i< seedsCount; i++){

        let gender : "male" | "female"
            = generateDiscreteRV({ x: [0, 1], y:[0.5, 0.5] }) == 1 ? "male": "female";

        let p: Person = {
            publicId: randomUUID(),
            firstName: faker.person.firstName(gender),
            middleName: faker.person.middleName(gender),
            lastName: faker.person.lastName(gender),
            gender: gender == "male" ? true : false,
            ssn: faker.string.alphanumeric(10),
            address: faker.location.streetAddress({ useFullAddress: true}),
            birthDate: faker.date.between({"from": "1950-01-01", "to": "1960-01-01"})
            
        };


        //generate age 
        let age = generateExpRV(60, 0.2);
        let deathDate = new Date(p.birthDate);
        deathDate.setFullYear(deathDate.getFullYear() + age);
        if(Date.now() > deathDate.getMilliseconds()  ){
            //person has died
            p.deathDate = deathDate
        }


        //generate isMarried
        let isMarried = generateDiscreteRV({ x: [0, 1], y: [0.3, 0.7] });
        
        if(!isMarried){
            allPeople.push(p);
        }
        else if(p.gender)
            marriedMales.push(p);
        else 
            marriedFemales.push(p);
    
    }

    //match pairs
    for(let i =0; i< marriedMales.length; i++){
        

        let tries = 0;

        while(tries < 10 ){

            let randomFemIndex = randomInt(0, marriedFemales.length -1);

            //check if not siblings
            if( marriedMales[i].mother_id != marriedFemales[randomFemIndex].mother_id &&
                marriedMales[i].father_id != marriedFemales[randomFemIndex].father_id 
            ){
                marriageRecords.push({
                    publicId: randomUUID(),
                    
                })
            }
                
            tries++;
        }
    }


}


//using inverse transform method
export function generateExpRV(mean: number, lambda: number){
    
    let leftOrRight = randomInt(0, 100) > 50 ? 1: -1;
    let u = randomInt(0, 100) / 100;
    return mean + leftOrRight * Math.log( 1 - u ) / (-lambda) ;

}

export type Cdf = {
    x: number[],
    y: number[]
}

export function generateDiscreteRV(cdf: Cdf){
    
    let u = randomInt(0, 100) / 100;

    let i =0; 
    while(i< cdf.y.length ){
        if(u < cdf.y[i])
            return cdf.x[i];
        i++;
    }
}
