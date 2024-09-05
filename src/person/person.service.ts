import { Op } from "sequelize";
import { Person } from "./models/Person";
import { PeoplePage } from "./interfaces/PeoplePage.interface";

export class PersonService {

    private static instance: PersonService;
    static getInstance(): PersonService{

        if(PersonService.instance)
            return PersonService.instance;

        PersonService.instance = new PersonService();
        return PersonService.instance;
    }


    private constructor(){}

    getPersonBySSN(ssn: String){
        return Person.findOne({
            where: {
                ssn
            }
        });
    }

    getAllPeople(
            after: string, //json
            before: string, //json
            sort:[string, string][],  // [[first, "ali"], [last, "salem"], [id, "asc"]]
            limit: number
        ): Promise<PeoplePage>{
        

        let whereCondition = {}; 
        let cursorObj;
        if(after){
            this.validateCursorParams(after, sort);
            cursorObj = JSON.parse( after );

            whereCondition = {
                [Op.or]: sort.map(([sortField, dir], index: number)=>{
                    let clause = {};
                    for(let i=0; i< index; i++){
                        clause[sort[i][0]] = cursorObj[sort[i][0]];
                    }

                    clause[sortField] = 
                        ( dir.toLocaleLowerCase() == "asc" ) ?
                            { [Op.gt]: cursorObj[sortField] }:
                            { [Op.lt]: cursorObj[sortField] }

                    return clause;
                })
            };
        }
        else{
            this.validateCursorParams(before, sort);
            cursorObj = JSON.parse( before );

            whereCondition = {
                [Op.or]: sort.map(([sortField, dir], index: number)=>{
                    let clause = {};
                    for(let i=0; i< index; i++){
                        clause[sort[i][0]] = cursorObj[sort[i][0]];
                    }

                    clause[sortField] = 
                        ( dir.toLocaleLowerCase() == "asc" ) ?
                            { [Op.lt]: cursorObj[sortField] }:
                            { [Op.gt]: cursorObj[sortField] }
                    
                    return clause;
                })
            };

            //reverse sort direction
            sort = sort.map( ([field, dir]) => {
                return [field, (dir.toLowerCase() == "asc") ? "desc" : "asc"]
            });
        }

        



   
        return Person.findAll({
            where: {
                ...whereCondition
            },
            order: [...sort],
            limit: limit,
            logging:true
        })
        .then((people: Person[])=>{

            let firstCursor:Record<string,any> = {}, endCursor:Record<string,any> = {};
            
            if(before)
                people = people.reverse();

            sort.forEach( ([field, dir]: [string, string])=>{
                
                firstCursor[field] = people[0][field];
                endCursor[field] = people[people.length -1][field];
                
            });
            firstCursor["id"] = people[0]["id"]; 
            endCursor["id"] = people[people.length -1]["id"];

            return {
                people,
                firstCursor : JSON.stringify(firstCursor),
                endCursor: JSON.stringify(endCursor),
                total: 100
            }
        });
    }

    getPersonSiblings(p: Person): Promise<Person[]> {

        let mother_id = p.mother_id ? p.mother_id : "";
        let father_id = p.father_id ? p.father_id : "";

        return Person.findAll({
            where: {
                [Op.or]: [
                    {
                        mother_id
                    },
                    {
                        father_id
                    }
                ],
                id: { [Op.not] : p.id }
            }
        })
        .catch(()=>{
            return [];
        })
    }


    getPersonParents(p: Person): Promise<Person[]> {
        let fatherId = p.father_id ? p.father_id: -2;
        let motherId = p.mother_id ? p.mother_id: -2;

        return Person.findAll({
            where: {
                [Op.or]: [
                    {
                        id: fatherId
                    },
                    {
                        id: motherId
                    }
                ]
            }
        })
        .catch(()=>{
            return [];
        })
    }


    private validateCursorParams( cursor: string, sort: [string, string][]){

        if(!cursor)
            throw Error("Invalid cursor, must be a valid string");

        let cursorObj: any;
        try {     
            cursorObj = JSON.parse(cursor);
        } catch (error) {
            console.log(error);
            throw Error("Invalid cursor, must be a valid json")    
        }

        if(! Number(cursorObj.id) && cursorObj.id !=0 )
            throw Error("Invalid cursor, id field must be a valid int")


        sort.forEach(( [field, dir]: [string, string]) => {
            
            if(! (field in cursorObj))
                throw Error("Invalid cursor, every sort key must be included in the cursor");

            if( cursorObj[field] == null || cursorObj[field] == undefined)
                throw Error("Invalid cursor, each cursor field must be a non nullish value");

            if( dir.toLowerCase() != "asc" && dir.toLowerCase() != "desc" )
                throw Error(`Invalid sort direction for field: ${field}, it must be "asc" or "desc"`);

        });


    }


    

}