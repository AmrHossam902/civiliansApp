import Person from "./Person";

export interface MarriageRecord {

    id?: string;
    husband?: Person;
    mDate: string;
    rTye: number;
    wife?: Person;
    children?: Person[];
}