import Person from './Person';

export interface marriedTo {
    spouse: Person, 
    marriageDate: string,
    children?: Person[]
}