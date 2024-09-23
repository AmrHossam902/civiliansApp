export default interface Person {

    id?: string;
    
    firstName?: string;
    lastName?: string;
    middleName?: string;
    birthDate?: string;
    gender?: string;

    siblings?: Person[]
    parents?: Person[]
    marriedTo?: { spouse: Person, children?: Person[]}[]


}