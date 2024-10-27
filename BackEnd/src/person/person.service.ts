import { Op, Sequelize } from "sequelize";
import { Person } from "./models/Person";
import { PeoplePage } from "./interfaces/PeoplePage.interface";
import { MarriageRecord } from "./models/MarriageRecord";
import { MarriedTo } from "./interfaces/marriedTo.interface";
export class PersonService {

    private static instance: PersonService;
    static getInstance(): PersonService{

        if(PersonService.instance)
            return PersonService.instance;

        PersonService.instance = new PersonService();
        return PersonService.instance;
    }

    private constructor(){}

    getPersonById(id: number): Promise<Person>{
        return Person.findOne({
            where: {
                id
            }
        });

    }

    getPersonBySSN(ssn: String): Promise<Person>{
        return Person.findOne({
            where: {
                ssn
            }
        });
    }

    getAllPeople(
            after: string, //json
            before: string, //json
            sort:[string, string][],
            limit: number,
            filters: Record<string, any>,
            search: string
        ): Promise<PeoplePage>{
        
        //validate limit
        if(!limit || !(+limit) )
            limit = 10;
        if(limit < 1)
            throw Error("limit should be a valid positive integer");

        if(limit > 100)
            throw Error("limit can only be less than 100")

        //validate sort array
        sort = this.validateSortArray(sort);

        
        //building pagination clause
        let paginationCondition; 
        let cursorObj;
        if(after){
            cursorObj = this.validateCursorParams(after, sort);
            paginationCondition = {
                [Op.or] : sort.map(([sortField, dir], index: number)=>{
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
        else if(before){
            cursorObj = this.validateCursorParams(before, sort);
            paginationCondition = {
                [Op.or] : sort.map(([sortField, dir], index: number)=>{
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
        else{
            //fetch first page
            cursorObj = {};
            paginationCondition = {};
        }


        //building filter clause
        let filterCondition = {};
        if(filters){

            Object.keys(filters).forEach((key)=>{
                if(filters[key] != undefined){
                    filterCondition[key] = filters[key];
                }
            });
        }

        //building search clause
        let searchCondition = {};
        if(search)
        {
            searchCondition = {
                [Op.or] : [
                    {
                        "firstName" : { [Op.like] : search + "%" }
                    },
                    {
                        "lastName" : { [Op.like] : search + "%" }
                    },
                    {
                        "middleName" : { [Op.like] : search + "%" }
                    },
                    {
                        "ssn" : { [Op.like] : search + "%" }
                    },
                    {
                        "firstAndLastNameQuery" : Sequelize.where(
                            Sequelize.fn(
                                'concat', 
                                Sequelize.col("firstName"),
                                " ",
                                Sequelize.col("lastName")
                            )
                            , 
                            {
                                [Op.like] : search + "%"
                            }
                        )
                    },
                    {
                        "fullNameQuery" : Sequelize.where(
                            Sequelize.fn(
                                'concat', 
                                Sequelize.col("firstName"),
                                " ",
                                Sequelize.col("middleName"),
                                " ",
                                Sequelize.col("lastName")
                            )
                            , 
                            {
                                [Op.like] : search + "%"
                            }
                        )
                    }
                ],
            };
        }
            
        let whereCondition = {
            [Op.and]: [
                filterCondition,
                searchCondition,
                paginationCondition
            ]
        }
        console.log(whereCondition);
   
        return Person.findAll({
            where: {
                ...whereCondition
            },
            order: [...sort],
            limit: limit + 1,
            logging:true
        })
        .then((people: Person[])=>{

            let firstCursor:Record<string,any> = {} 
            let endCursor:Record<string,any> = {};
            let hasMore: boolean = false;
            
            //remove the extra element
            if(people.length > limit){
                people.pop();
                hasMore = true;
            }
            
            //revese the order again in case of before
            if(before && !after){
                people = people.reverse();
            }
                
            //set page cursors
            if(people.length){

                sort.forEach( ([field, dir]: [string, string])=>{
                
                   
                    firstCursor[field] = people[0][field];
                    endCursor[field] = people[people.length -1][field];
                    
                });

                firstCursor["id"] = people[0]["id"]; 
                endCursor["id"] = people[people.length -1]["id"];
            }

            let response = {
                people
            }

            if(after){
                if(hasMore)
                    response["next"] = JSON.stringify(endCursor);
                response["prev"] = JSON.stringify(firstCursor)
                
            }
            else if(before){
                response["next"] = JSON.stringify(endCursor);
                if(hasMore)
                    response["prev"] = JSON.stringify(firstCursor);
            }
            else{
                //first page
                if(hasMore)
                    response["next"] = JSON.stringify(endCursor);
            }
              
            return response;
        });
    }

    private validateCursorParams( cursor: string, sort: [string, string][]): Record<string, any>{

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

        });

        return cursorObj;

    }

    private validateSortArray(sort: [string, string][]) : [string, string][]{
        
        if(!sort)
            return [["id", "asc"]];

        
        let tableCols = Object.keys(Person.getAttributes()); 

        sort.forEach(([item, dir]) =>{
            if(tableCols.indexOf(item) == -1)
                throw Error("invalid sort key");

            if(dir.toLowerCase() != "asc" && dir.toLowerCase() != "desc")
                throw Error("invalid sort direction, use 'asc' or 'desc'");
        });

        sort.push(["id", "asc"]);

        return sort;
    }

    /**
     * get all siblings of a person (full sibling / half sibling )
     * @param p person to get the siblings of
     * @returns 
     */
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


    getPersonFullSiblings(p: Person): Promise<Person[]> {
        let mother_id = p.mother_id ? p.mother_id : "";
        let father_id = p.father_id ? p.father_id : "";

        return Person.findAll({
            where: {
                [Op.and]: [
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

    marriedTo(p:Person): Promise<MarriedTo[]>{

        let condition = { rType: 1 }; //marriage not divorce
        if(p.gender == 1)
            condition["husbandId"] = p.id;
        else 
            condition["wifeId"] = p.id;

        return MarriageRecord.findAll({
            where: {
                ...condition 
            },
            include: [
                {
                    model: Person, 
                    as: "husband"
                },
                {
                    model: Person,
                    as: "wife"
                }
            ],
            logging: true
        })
        .then((records:MarriageRecord[])=>{
            let response: MarriedTo[] = [];
            records.forEach((record: MarriageRecord) =>{
                response.push({
                    spouse: (p.gender == 1) ? record.wife: record.husband,
                    marriageDate: record.mDate
                })
            });
            return response;
        })
        .catch((e)=>{
            console.error(e);
            return [];
        })
    }

    getChildren(parent1: Person, parent2: Person):Promise<Person[]>{

        if(parent1.gender == parent2.gender){
            console.log(parent1, parent2);
            throw Error("inappropiate genders for parents");
        } 
            


        let father = parent1.gender == 1 ? parent1: parent2;
        let mother = parent1.gender == 0 ? parent1: parent2;
    
        return Person.findAll({
            where: {
                father_id: father.id,
                mother_id: mother.id
            }
        })
        .catch((e)=>{ console.error(e); return []})
    }
    
    getMarriageRecord(maleId: number, femaleId: number){
        return MarriageRecord.findOne({
            where: {
                husbandId: maleId,
                wifeId: femaleId,
                rtype: 1 //marriage
            },
        })
       .catch(()=>{ return null })
    }

}