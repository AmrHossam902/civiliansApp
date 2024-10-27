'use client';
import { 
    Button, 
    DatePicker, 
    DateValue, 
    Input, 
    Radio, 
    RadioGroup,
    Autocomplete,
    AutocompleteSection,
    AutocompleteItem 
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import './new-citizen.css';
import { FaSearch } from "react-icons/fa";
import Person from "@/dtos/Person";
import InputState from "@/types/inputState";
import { PersonDropDownComponent } from "@/components/personDropDown/personDropDownComponent";
import { MarriageRecord } from "@/dtos/MarriageRecord";



enum PAGE_STATE {
    FILLING_FORM,
    VALIDATING_INPUTS,
    VALLIDATION_SUCCESS,
    VALIDATION_FAILED,
    SUBMTTING,
    SUBMISSION_FAILED,
    SUBMISSION_SUCCESS
}


export default function createNewPerson(){


    const [firstNameInput, setFirstNameInput] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});
    const [birthDateInput, setBirthDateInput] = useState<InputState>({ value: null, isValid: true, isTouched: false, errorMessage: ""});
    const [fatherInput, setFatherInput] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});
    const [motherInput, setMotherInput] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});
    const [selectedFather,setSelectedFather] = useState<Person>();
    const [selectedMother,setSelectedMother] = useState<Person>();
    const [marriageRecord, setMarriageRecord] = useState<MarriageRecord>();
    const [validationError,setValidationError] = useState<string>();

    const [pageState, setPageState] = useState<PAGE_STATE>(PAGE_STATE.FILLING_FORM);

    const getMarriageRecord = useCallback(()=>{

        setPageState(PAGE_STATE.VALIDATING_INPUTS);
        return fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            cache: 'no-cache',
            body: JSON.stringify({
              query: `query marriage($fatherNatId: String!, $motherNatId: String!){ 
                    marriage(maleNatId: $fatherNatId, femaleNatId: $motherNatId) {
                        id
                        mDate
                        children {
                            id
                            firstName
                            birthDate
                        }
                    }
                }`,
                variables: {
                    fatherNatId: selectedFather?.ssn,
                    motherNatId: selectedMother?.ssn
                }
            })
        })
        .then((res)=> res.json())
        .then((data)=> {
            console.log(data);
            if(data.errors){
                
                switch (data.errors[0].extensions.type) {
                    case "HUSBAND_NOT_FOUND":
                        setFatherInput({
                            ...fatherInput, 
                            isValid: false,
                            errorMessage: data.errors[0].message,
                        });
                        break;
                    case "WIFE_NOT_FOUND":
                        setMotherInput({
                            ...motherInput, 
                            isValid: false,
                            errorMessage: data.errors[0].message,
                        });
                        break;

                    case "MARRIAGE_CASE_NOT_FOUND":
                        setFatherInput({
                            ...fatherInput, 
                            isValid: false,
                        });
                        setMotherInput({
                            ...motherInput, 
                            isValid: false,
                        });
                        setValidationError(data.errors[0].message);
                        break;
                }
                setPageState(PAGE_STATE.VALIDATION_FAILED);
            }
            else{
                setPageState(PAGE_STATE.VALLIDATION_SUCCESS);
                setMarriageRecord(data.data.marriage as MarriageRecord);
            }
        });

    }, [fatherInput, motherInput, selectedFather, selectedMother]);

    const createNewPerson = (person:any) => {
        fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            cache: 'no-cache',
            body: JSON.stringify({
                query: `mutation AddNewPerson($person: PersonData!) {
                            addNewPerson(person: $person){
                                firstName
                            }
                }`,
                variables: {
                    ...person
                }
            })

        })
    }

    const onInputChange = useCallback(
        (newValue: string | DateValue ,prevInputState: InputState, setInput: Dispatch<SetStateAction<InputState>>)=>{
            
            let isValid: boolean = prevInputState.isValid;
            let errorMessage: string = prevInputState.errorMessage;

            if(!newValue){
                isValid = false;
                errorMessage = "field required please";
            }
            else{
                isValid = true;
                errorMessage = "";
            }

            setInput({
                ...prevInputState,
                value: newValue,
                isValid,
                errorMessage 
            });

    },[]);

    const onInputBlur = useCallback(
        (inputState: InputState, setInput: Dispatch<SetStateAction<InputState>>) => {
            
            let isValid = inputState.isValid
            let errorMessage = inputState.errorMessage;
            
            if(!inputState.value){
                isValid = false;
                errorMessage = "field required please";
            }
            
            setInput({
                ...inputState,
                isTouched: true,
                isValid,
                errorMessage
            });
            
        }
    ,[]); 


    const onSubmit = ()=>{

        //validate all inputs 
        /**
         * 1- make sure all fields are non empty
         * 2- validate parents marriage certificate
         * 3- validate first name among children
         * 4- validate birth date > marraige date + 1
         */

        //1 make sure all fields are non empty
        if(!firstNameInput.value)
            setFirstNameInput({
                ...firstNameInput, 
                isValid: false,
                errorMessage: "field required please"
            })
        
        if(!birthDateInput.value)
            setBirthDateInput({
                ...birthDateInput, 
                isValid: false,
                errorMessage: "field required please"
            })

        if(!fatherInput.value)
            setFatherInput({
                ...fatherInput,
                isValid: false,
                errorMessage: "field required please"
            })

        if(!motherInput.value)
            setMotherInput({
                ...motherInput,
                isValid: false,
                errorMessage: "field required please"
            })

        if(
            !firstNameInput.value || 
            !birthDateInput.value || 
            !fatherInput.value || 
            !motherInput.value
        )
            return;
            
        //2 validate parents
        if(!marriageRecord)
            return;

        //3 validate fisrtname
        let hasSimilarName: number = 
            marriageRecord.children?.findIndex( 
                child => (
                    child.firstName?.toLowerCase() == 
                    (firstNameInput.value as string)?.toLowerCase()
                )
            ) || -1;

        if(hasSimilarName > -1){
            setFirstNameInput({
                ...firstNameInput,
                 isValid: false,
                 errorMessage: "select another name, a sibling has the same name already"
            });

            return -1;
        }
            

        //4 validate birth date > marraige date + 1
        let marriageToBirthTimeMs = 
            new Date(birthDateInput.value.toString()).getTime() - new Date(marriageRecord.mDate).getTime() 
        
        if( marriageToBirthTimeMs < 9 * 30 * 24 * 60 * 60 * 1000 ){
            setBirthDateInput({
                ...birthDateInput,
                 isValid: false,
                 errorMessage: "birth date should be at least 9 months after marriage"
            })
            return;
        }


        // if no errors, set page state to SUBMITTING 
        
        // call mutation
    }

    useEffect(()=>{
        if(selectedFather && selectedMother)
            getMarriageRecord();
    },[selectedFather, selectedMother])


    return <div className="text-primary-darker">
        <h1 className="text-2xl">Create new citizen</h1>

        <form className="pt-6">

            <fieldset className="border-t-primary-darker border-t-solid border-t-[2px] pt-4 mb-7">
                <legend className="ml-6">personal info</legend>
                <Input
                    name="name"
                    label="First Name"
                    labelPlacement="outside"
                    placeholder="enter first name"
                    variant="bordered"
                    className="textInput pb-4"
                    isRequired

                    value={firstNameInput.value as string}
                    onValueChange={
                        (v)=> {
                            onInputChange(v, firstNameInput, setFirstNameInput)
                        }
                    }
                    isInvalid={!firstNameInput.isValid}
                    errorMessage={firstNameInput.errorMessage}
                    onBlur={()=> onInputBlur(firstNameInput, setFirstNameInput)}
                />
                <DatePicker
                    name="birthdate"
                    label="Birth Date"
                    labelPlacement="outside"
                    variant="bordered"
                    showMonthAndYearPickers
                    className="dateInput pb-4"
                    isRequired

                    value={birthDateInput.value as DateValue}
                    onChange={
                        (v)=> { 
                            onInputChange(v, birthDateInput, setBirthDateInput);
                        }
                    }

                    isInvalid={!birthDateInput.isValid}
                    errorMessage={birthDateInput.errorMessage}

                    onBlur={()=>{
                        onInputBlur(birthDateInput, setBirthDateInput);
                    }}
                />
                <RadioGroup
                    name="gender"
                    label="Gender"
                    classNames={{
                        label: "text-primary-darker"
                    }}
                    className=" pb-4"
                    color="secondary"
                    defaultValue="male"
                >
                    <Radio value="male" classNames={{ label: "text-primary-darker"}}>Male</Radio>
                    <Radio value="female" classNames={{ label: "text-primary-darker"}}>Female</Radio>
                </RadioGroup>

            </fieldset>
 
            <fieldset className="border-t-primary-darker border-t-solid border-t-[2px] pt-4 mb-7">
                <legend className="ml-6">parents</legend>
                
                <div className="flex flex-wrap gap-6 ">
                    <div>
                        <PersonDropDownComponent 
                            label="father"
                            inputState={fatherInput}
                            setInputState={setFatherInput}
                            setSelectedPerson={setSelectedFather}
                            onInputBlur={() => onInputBlur(fatherInput, setFatherInput)}
                            onInputChange={(v)=> onInputChange(v, fatherInput, setFatherInput)}   
                        />
                    </div>

                    <div>
                        <PersonDropDownComponent 
                            label="mother"
                            inputState={motherInput}
                            setInputState={setMotherInput}
                            setSelectedPerson={setSelectedMother}
                            onInputBlur={() => onInputBlur(motherInput, setMotherInput)}
                            onInputChange={(v)=> onInputChange(v, motherInput, setMotherInput)}  
                        />
                    </div>
                </div>
                <div>
                {
                    pageState == PAGE_STATE.VALIDATING_INPUTS && 
                    "...validating parents"
                }
                {
                    (
                        pageState == PAGE_STATE.VALLIDATION_SUCCESS ||
                        pageState >= PAGE_STATE.SUBMTTING
                    )
                    && 
                    <div>
                        { <h3>{`married in : ${marriageRecord?.mDate}`}</h3> }
                        { !marriageRecord?.children?.length && <h3>have no children</h3> }
                        {    
                            marriageRecord?.children?.length && <div>
                                <h3>children</h3>
                                {
                                    marriageRecord?.children.map((child: Person) => {
                                        return <h5 
                                            key={child.ssn}
                                            className="ml-3">
                                                {child.firstName}, born in: {child.birthDate}
                                            </h5>
                                    })
                                }
                            </div>
                        }

                    </div>
                }
                {
                    pageState == PAGE_STATE.VALIDATION_FAILED && 
                    <span className="text-red-500">{validationError}</span>
                }
                
            </div>

            </fieldset> 
            <div>
                <Button 
                    className="bg-secondary text-primary-lighter"
                    isLoading={pageState == PAGE_STATE.SUBMTTING}
                    onClick={ onSubmit }
                    >Submit
                </Button>
            </div>

        </form>

    </div>;
}
