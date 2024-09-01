
import { faker } from '@faker-js/faker';
import { Person } from './models/Person';
import { randomInt, randomUUID } from 'crypto';
import { MRecord } from './models/MarriageRecord';
import { NoMalesFound } from './exceptions/noMalesFound.error';
import { NoFemalesFound } from './exceptions/noFemalesFound.error';
import { NoPairFound } from './exceptions/noPairFound.error';
import { RandomGenService } from './randomGen.service';

interface Bucket {

    males: Person[];
    females: Person[];

}

export class GeneratorService {


    static readonly seedsCount = 1000;
    static readonly malesRate = 0.4;
    static readonly avgAge = 60;
    static readonly maxNextSiblingDuration = 3 //years
    static readonly startYear: number = 1940;
    static readonly generationRounds: number = 3;
    static readonly yearsPerBucket: number = 8;
    static readonly averageMarriageAge: number = 20;


    buckets: Bucket[] = [];
    childrenBuckets: Bucket[] = [];


    constructor(){
        
        let i = GeneratorService.startYear;
        const currentYear = new Date().getFullYear();
        while(i < currentYear){
            this.buckets.push({
                males:[],
                females: []
            });

            this.childrenBuckets.push({
                males: [],
                females: []
            });

            i += GeneratorService.yearsPerBucket;
        }

    }


    async generateSeeds(){
        
        for(let i =0; i< GeneratorService.seedsCount; i++){
            console.log("generating ", i);
            let gender : "male" | "female"
                = RandomGenService.generateDiscreteRV({ x: [0, 1], y:[GeneratorService.malesRate, 1] }) == 1 ? "male": "female";
    
    
            let p: Person = new Person();
            p.firstName  = faker.person.firstName(gender);
            p.middleName = faker.person.middleName(gender);
            p.lastName = faker.person.lastName(gender);
            p.gender =  gender == "male" ? true : false;
            p.ssn = faker.string.alphanumeric(10);
            p.address= faker.location.streetAddress({ useFullAddress: true});
            p.birthDate= faker.date.between(
                {
                    "from": `${GeneratorService.startYear}-01-01`, 
                    "to": `${GeneratorService.startYear + GeneratorService.yearsPerBucket}-01-01`
                }
            );

    
            //generate age 
            let age = RandomGenService.generateSymExpRV(GeneratorService.avgAge, 0.2);
            let deathDate = new Date(p.birthDate);
            deathDate.setFullYear(deathDate.getFullYear() + age);
    
            if(Date.now() > deathDate.getTime()  ){
                //person has died
                p.deathDate = deathDate
            }
    
            
            //save in a bucket
            let bucketIndex = Math.floor(
                (   p.birthDate.getFullYear() - GeneratorService.startYear )
                / GeneratorService.yearsPerBucket
            );
            if(p.gender)
                this.buckets[bucketIndex].males.push(p);
            else 
                this.buckets[bucketIndex].females.push(p);
    
            await p.save();
        
        }


    }


    async generateRound(){

        //loop over all buckets and exhaust them

        for(let i = 0; i< this.buckets.length; i++){

            try {

                while(true){
                    let [male, female] = this.extractPair(i);    
                
                    let mRecord: MRecord = new MRecord();
                    mRecord.publicId = randomUUID();
                    mRecord.husbandId = male.id;
                    mRecord.wifeId = female.id;
                    mRecord.rType = 1 ; //marriage / divorce
                    
                    //generate marriage date
                    let marriageAge = Math.floor( RandomGenService.generateSymExpRV(25, 0.3) );
                    
                    let marriageDate = new Date(
                        Math.min(
                            male.birthDate.getFullYear(),
                            female.birthDate.getFullYear()
                        ) + marriageAge,
                        randomInt(0, 11),
                        randomInt(5, 25)
                    );
    
                    mRecord.mDate = marriageDate;
                    if(marriageDate > new Date())
                        continue;

                    await mRecord.save();


                    //generate children
                    await this.generateChildren(male, female, marriageDate);
    
                }

            } catch (error) {
                console.log(error);
            }

        }

        //substitute buckets with children
        this.buckets = this.childrenBuckets;

        this.resetChildrenBuckets();


    }



    extractPair(bucketIndex: number): [Person, Person]{

        let tries = 0;

        if(!this.buckets[bucketIndex].males.length )
            throw new NoMalesFound();
        
        if(!this.buckets[bucketIndex].females.length )
            throw new NoFemalesFound();

        while(tries < 10){
            let maleIndex = 
                this.buckets[bucketIndex].males.length > 1 ? 
                    randomInt(0, this.buckets[bucketIndex].males.length -1)
                    :0;

            let femaleIndex = 
            this.buckets[bucketIndex].females.length > 1 ? 
                    randomInt(0, this.buckets[bucketIndex].females.length -1)
                    :0;
    
            //validate pair
            if(! this.areELigibleToMarry(
                this.buckets[bucketIndex].males[maleIndex], 
                this.buckets[bucketIndex].females[femaleIndex]
            )){
                tries++;
                continue;
            }
                
    
            //remove pairs from buckets first
            let male: Person = this.buckets[bucketIndex].males[maleIndex];
            let female: Person = this.buckets[bucketIndex].females[femaleIndex];
            
            this.buckets[bucketIndex].males.splice(
                this.buckets[bucketIndex].males.findIndex((p)=> p.id == male.id ),1
            );

            this.buckets[bucketIndex].females.splice(
                this.buckets[bucketIndex].females.findIndex((p)=> p.id == female.id ),1
            )


            return [
                male, 
                female
            ];
        }
    
        throw new NoPairFound();
    }


    areELigibleToMarry(male: Person, female: Person): boolean {
    
        if(
            (
                male.mother_id && female.mother_id &&
                male.mother_id == female.mother_id 
            ) || (
                male.father_id && female.father_id &&
                male.father_id == female.father_id
            )
             
        )
            return false;

    
        return true;
    }

    async generateChildren(male: Person, female: Person, mDate: Date) {

        let childCount = randomInt(0, 7);
        let lastSiblingBirthYear:number = mDate.getFullYear();

        for(let i = 0;i<childCount; i++){

            let p: Person = new Person();

            let gender : "male" | "female"
                = RandomGenService.generateDiscreteRV({ x: [0, 1], y:[GeneratorService.malesRate, 1] }) == 1 ? "male": "female";

            p.firstName  = faker.person.firstName(gender);
            p.middleName = male.firstName;
            p.lastName = male.middleName;
            p.gender =  gender == "male" ? true : false;
            p.ssn = faker.string.alphanumeric(10);
            p.father_id = male.id;
            p.mother_id = female.id;
            p.address= faker.location.streetAddress({ useFullAddress: true});
            p.birthDate= 
                new Date( 
                    randomInt(
                        lastSiblingBirthYear + 1,
                        lastSiblingBirthYear + GeneratorService.maxNextSiblingDuration
                    ),
                    randomInt(0,11),
                    randomInt(1, 28)
                );
            lastSiblingBirthYear = p.birthDate.getFullYear();

            if(p.birthDate > new Date())
                continue;

            //generate age 
            let age = RandomGenService.generateSymExpRV(GeneratorService.avgAge, 0.2);
            let deathDate = new Date(p.birthDate);
            deathDate.setFullYear(deathDate.getFullYear() + age);

            if(Date.now() > deathDate.getTime()  ){
                //person has died
                p.deathDate = deathDate
            }

            let bucketIndex: number = 
            Math.floor(
                (   p.birthDate.getFullYear() - GeneratorService.startYear )
                / GeneratorService.yearsPerBucket
            );
            

            if(p.gender)
                this.childrenBuckets[bucketIndex].males.push(p);
            else
                this.childrenBuckets[bucketIndex].females.push(p);

            await p.save();

        }
    }

    resetChildrenBuckets(){
        this.childrenBuckets = [];

        let i = GeneratorService.startYear;
        const currentYear = new Date().getFullYear();
        while(i < currentYear){

            this.childrenBuckets.push({
                males: [],
                females: []
            });

            i += GeneratorService.yearsPerBucket;
        }
    }
}
