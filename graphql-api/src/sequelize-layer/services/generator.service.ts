
import { faker } from '@faker-js/faker';
import { PersonModel } from '../models/Person';
import { randomInt, randomUUID } from 'crypto';
import { MarriageRecordModel } from '../models/MarriageRecord';
import { NoMalesFound } from '../../gql-layer/exceptions/noMalesFound.error';
import { NoFemalesFound } from '../../gql-layer/exceptions/noFemalesFound.error';
import { NoPairFound } from '../../gql-layer/exceptions//noPairFound.error';
import { RandomGenService } from './randomGen.service';


interface Bucket {

    males: PersonModel[];
    females: PersonModel[];

}

export class GeneratorService {


    readonly seedsCount = 1000;
    readonly malesRate = 0.4;
    readonly avgAge = 60;
    readonly maxNextSiblingDuration = 3 //years
    readonly startYear: number = 1940;
    readonly generationRounds: number = 3;
    readonly yearsPerBucket: number = 8;
    readonly averageMarriageAge: number = 20;


    buckets: Bucket[] = [];
    childrenBuckets: Bucket[] = [];


    constructor(){
        
        let i = this.startYear;
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

            i += this.yearsPerBucket;
        }

    }

    /**
     * populates the database with fake people from 
     * start year till now 
     */
    populateDB(){

        this.generateSeeds()
        .then(async ()=>{

            while(!this.bucketsAreEmpty()){
                await this.generateRound()
            }
        })
    }

    async generateSeeds(){
        
        for(let i =0; i< this.seedsCount; i++){

            try {
                let gender : "male" | "female"
                    = RandomGenService.generateDiscreteRV({
                        x: [0, 1], 
                        y:[1- this.malesRate, 1] 
                    }) == 1 ? 
                        "male": "female";
        
        
                let p: PersonModel = new PersonModel();
                p.firstName  = faker.person.firstName(gender).substring(0, 40);
                p.middleName = faker.person.middleName(gender).substring(0, 40);
                p.lastName = faker.person.lastName(gender).substring(0, 40);
                p.gender =  gender == "male"? 1: 0;
                p.ssn = faker.string.alphanumeric(10);
                p.address= faker.location.streetAddress({ useFullAddress: true});
                p.birthDate= faker.date.between(
                    {
                        "from": `${this.startYear}-01-01`, 
                        "to": `${this.startYear + this.yearsPerBucket}-01-01`
                    }
                );

        
                //generate age 
                let age = RandomGenService.generateSymExpRV(this.avgAge, 0.2);
                let deathDate = new Date(p.birthDate);
                deathDate.setFullYear(deathDate.getFullYear() + age);
        
                if(Date.now() > deathDate.getTime()  ){
                    //person has died
                    p.deathDate = deathDate
                }
        
                
                //save in a bucket
                let bucketIndex = Math.floor(
                    (   p.birthDate.getFullYear() - this.startYear )
                    / this.yearsPerBucket
                );
                if(p.gender)
                    this.buckets[bucketIndex].males.push(p);
                else 
                    this.buckets[bucketIndex].females.push(p);
        

                await p.save();
                console.log("saving seed ", p.id);
            } catch (error) {
                console.log(error);
            }


        
        }


    }

        
    async generateRound(){

        //loop over all buckets and exhaust them

        for(let i = 0; i< this.buckets.length; i++){

            try {

                //exhaust the bucket
                while(true){
                    let [male, female] = this.extractPair(i);    
                
                    let mRecord: MarriageRecordModel = new MarriageRecordModel();
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
                    console.log(`saving marriage record, male = ${male.id}, female=${female.id}`);

                    //generate children
                    await this.generateChildren(male, female, marriageDate);
    
                }

            } catch (error) {
                if(error instanceof NoMalesFound ||
                    error instanceof NoFemalesFound ||
                    error instanceof NoPairFound
                )    
                console.log(error.message);
            }

        }

        //substitute buckets with children
        this.buckets = this.childrenBuckets;

        this.resetChildrenBuckets();


    }


    extractPair(bucketIndex: number): [PersonModel, PersonModel]{

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
            let male: PersonModel = this.buckets[bucketIndex].males[maleIndex];
            let female: PersonModel = this.buckets[bucketIndex].females[femaleIndex];
            
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


    areELigibleToMarry(male: PersonModel, female: PersonModel): boolean {
    
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

    async generateChildren(male: PersonModel, female: PersonModel, mDate: Date) {

        let childCount = randomInt(0, 7);
        let lastSiblingBirthYear:number = mDate.getFullYear();

        for(let i = 0;i<childCount; i++){

            let p: PersonModel = new PersonModel();

            let gender : "male" | "female"
                = RandomGenService.generateDiscreteRV({ x: [0, 1], y:[1- this.malesRate, 1] }) == 1 ? "male": "female";

            p.firstName  = faker.person.firstName(gender).substring(0, 40);
            p.middleName = male.firstName;
            p.lastName = male.middleName;
            p.gender =  gender == "male"? 1: 0;
            p.ssn = faker.string.alphanumeric(10);
            p.father_id = male.id;
            p.mother_id = female.id;
            p.address= faker.location.streetAddress({ useFullAddress: true});
            p.birthDate= 
                new Date( 
                    randomInt(
                        lastSiblingBirthYear + 1,
                        lastSiblingBirthYear + this.maxNextSiblingDuration
                    ),
                    randomInt(0,11),
                    randomInt(1, 28)
                );
            lastSiblingBirthYear = p.birthDate.getFullYear();

            if(p.birthDate > new Date())
                continue;

            //generate age 
            let age = RandomGenService.generateSymExpRV(this.avgAge, 0.2);
            let deathDate = new Date(p.birthDate);
            deathDate.setFullYear(deathDate.getFullYear() + age);

            if(Date.now() > deathDate.getTime()  ){
                //person has died
                p.deathDate = deathDate
            }

            let bucketIndex: number = 
            Math.floor(
                (   p.birthDate.getFullYear() - this.startYear )
                / this.yearsPerBucket
            );
            

            if(p.gender)
                this.childrenBuckets[bucketIndex].males.push(p);
            else
                this.childrenBuckets[bucketIndex].females.push(p);

            await p.save();
            console.log(`saving new born ${p.id}, mother=${female.id}, father=${male.id}`);

        }
    }

    resetChildrenBuckets(){
        this.childrenBuckets = [];

        let i = this.startYear;
        const currentYear = new Date().getFullYear();
        while(i < currentYear){

            this.childrenBuckets.push({
                males: [],
                females: []
            });

            i += this.yearsPerBucket;
        }
    }

    /**returns true if all buckets are empty
     * indicating no need for more rounds
     */
    bucketsAreEmpty(){
  
        return this.buckets.every( (bucket: Bucket)=>{
            return ! bucket.males.length && ! bucket.females.length  
        })

    }
}
