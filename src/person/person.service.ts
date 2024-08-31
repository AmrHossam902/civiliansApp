import { randomUUID } from "crypto";
import { connectionPool } from "../database/db-client";
import { Person } from "./models/Person";

export class PersonService {


    private constructor(){

    }

    private static serviceInstance: PersonService;

    static getInstance(): PersonService {
        if(!PersonService.serviceInstance){
            PersonService.serviceInstance = new PersonService();
        }

        return PersonService.serviceInstance;
    }

    createNewPerson(p: Person){
        return connectionPool.getConnection()
        .then((connection)=>{
            p.publicId =  randomUUID();
            p.createdAt = new Date();
            p.ssn =  Buffer.from(randomUUID()).toString("base64").substring(0, 20)
            return connection.execute(
                `insert into person(
                    publicId, 
                    firstName,
                    lastName,
                    middleName,
                    ssn,
                    gender,
                    birthDate,
                    address,
                    createdAt ) 
                value(?,?,?,?,?,?,?,?,?)` , 
                [
                    p.publicId,
                    p.firstName,
                    p.lastName,
                    p.middleName,
                    p.ssn,
                    p.gender,
                    p.birthDate,
                    p.address,
                    p.createdAt
                ] 
            ).then(([qRes, fields])=>{
                console.log(qRes);
                console.log(fields);
                connection.release();
                return "qRes";
            })
        })
    }

    getAllPersons(): Promise<Person[]>{
        return connectionPool.getConnection()
        .then((connection)=>{
            return connection.query("select * from person")
            .then(([rows, fields])=>{
                connection.release();
                return Promise.resolve(rows as Person[]);
            });
        })
    }

    getPersonBySSN(ssn: string): Promise<Person | undefined>{
        return connectionPool.getConnection()
        .then((connection)=>{
            return connection.query("select * from person where ssn=?;",[ssn])
            .then(([rows, fields])=>{
                connection.release();
                return Promise.resolve((rows as Person[])?.at(0));
            });
        })
    }

    getPersonSiblings(person: Person): Promise<Person[]> {

        return connectionPool.getConnection()
        .then((connection)=>{
            return connection.query(`
                select * from person 
                where 
                    id != ? and 
                    ( father_id = ? or 
                    mother_id = ? );
            `,[person.id, person.father_id, person.mother_id])
            .then(([rows, fields])=>{
                connection.release();
                return Promise.resolve(rows as Person[]);
            });
        })

    }
}