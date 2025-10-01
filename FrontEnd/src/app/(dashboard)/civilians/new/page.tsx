'use client';
import { 
    Button, 
    DatePicker, 
    DateValue, 
    Input, 
    Radio, 
    RadioGroup
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import './new-citizen.css';
import Person from "@/dtos/Person";
import InputState from "@/types/inputState";
import { MarriageRecord } from "@/dtos/MarriageRecord";
import PersonAutoComplete from "@/components/personDropDown/comp";
import { getMarriageRecord } from "@/services/client-side/marriage-records.service";
import { Gender } from "@/types/gender";
import { createNewPerson } from "@/services/client-side/person.service";


enum PARENTS_STATE {
    EDITING,
    VALIDATING_PARENTS,
    MARRIAGE_FOUND,
    ERROR
}

enum PAGE_STATE {
    FILLING_FORM,
    SUBMTTING,
    SUBMISSION_FAILED,
    SUBMISSION_SUCCESS
}


export default function CreateNewPerson(){


    const [fatherInput, setFatherInput] = useState<InputState>({ value: null, isValid: true, isTouched: false, errorMessage: ""});
    const [motherInput, setMotherInput] = useState<InputState>({ value: null, isValid: true, isTouched: false, errorMessage: ""});
    const [marriageRecord, setMarriageRecord] = useState<MarriageRecord>();
    const [parentsState, setParentsState] = useState<PARENTS_STATE>(PARENTS_STATE.EDITING);
    const [validationError, setValidationError] = useState<string>();


    const [firstNameInput, setFirstNameInput] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});
    const [birthDateInput, setBirthDateInput] = useState<InputState>({ value: null, isValid: true, isTouched: false, errorMessage: ""});
    const [addressInput, setAddressInput] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});
    const [gender, setGender] = useState<Gender>("MALE");

    const [pageState, setPageState] = useState<PAGE_STATE>(PAGE_STATE.FILLING_FORM);

    const checkInputIsEmpty = useCallback(
        (inputState: InputState, setInput: (i: InputState)=> void) => {
            
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

    const checkBirthDateAgainstMarriageDate = useCallback(()=>{
        
        if(!birthDateInput?.value || !marriageRecord?.mDate)
            return;
        
        let marriageToBirthTimeMs = 
            new Date(birthDateInput.value.toString()).getTime() 
            - new Date(marriageRecord.mDate).getTime(); 
        
        if( marriageToBirthTimeMs < 6 * 30 * 24 * 60 * 60 * 1000 ){
            setBirthDateInput({
                ...birthDateInput,
                 isValid: false,
                 errorMessage: "birth date should be at least 6 months after marriage"
            });
        }
    },[birthDateInput, marriageRecord]);

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
        checkBirthDateAgainstMarriageDate();
        // if no errors, set page state to SUBMITTING 
        
        // call mutation
        setPageState(PAGE_STATE.SUBMTTING);
        createNewPerson({
            firstName: firstNameInput.value,
            middleName: (fatherInput.value as Person).firstName,
            lastName: (fatherInput.value as Person).middleName,
            address: addressInput.value,
            gender: gender,
            birthDate: birthDateInput.value.toString(),
            fatherSSN: (fatherInput.value as Person).ssn,
            motherSSN: (motherInput.value as Person).ssn
        })
        .then((res)=> res.json())
        .then((res)=>{

            if(res.errors){
                setPageState(PAGE_STATE.SUBMISSION_FAILED);
                console.log(res.errors);
                return;
            }
                
            setPageState(PAGE_STATE.SUBMISSION_SUCCESS);
        });
    }
 
    useEffect(()=>{

        if(fatherInput.value && motherInput.value){
            getMarriageRecord(
                (fatherInput.value as Person).ssn as string, 
                (motherInput.value as Person).ssn as string
            )
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

                        default:
                            setValidationError("unexpected error");
                            setFatherInput({
                                ...fatherInput, 
                                isValid: false,
                            });
                            setMotherInput({
                                ...motherInput, 
                                isValid: false,
                            });
                            break;
                            
                    }
                    setParentsState(PARENTS_STATE.ERROR);
                }
                else{
                    setParentsState(PARENTS_STATE.MARRIAGE_FOUND);
                    setMarriageRecord(data.data.marriage as MarriageRecord);
                }
            });

        }
        else {
            setMarriageRecord(undefined);
        }
    },[fatherInput.value, motherInput.value])

    useEffect(()=>{
        checkBirthDateAgainstMarriageDate();
    },[marriageRecord]);

    return <div className="text-primary-darker">
        <h1 className="text-2xl">Create new citizen</h1>

        <form className="pt-6">

            <fieldset className="border-t-primary-darker border-t-solid border-t-[2px] pt-4 mb-7">
                <legend className="ml-6">parents</legend>
                
                <div className="flex flex-wrap gap-6 ">
                    <div>
                        <PersonAutoComplete 
                            filters={ { gender: "MALE"}}
                            label="father"
                            inputState={fatherInput}
                            setInputState={setFatherInput}
                            validateInput={ () => checkInputIsEmpty(fatherInput, setFatherInput) }
                        />
                    </div>

                    <div>
                        <PersonAutoComplete 
                            filters={ { gender: "FEMALE"}}
                            label="mother"
                            inputState={motherInput}
                            setInputState={setMotherInput}
                            validateInput={ () => checkInputIsEmpty(motherInput, setMotherInput) }
                        />
                    </div>
                    
                </div>
                <div>
                {
                    parentsState == PARENTS_STATE.VALIDATING_PARENTS && 
                    "...validating parents"
                }
                {
                    (
                        parentsState == PARENTS_STATE.MARRIAGE_FOUND
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
                    parentsState == PARENTS_STATE.ERROR &&
                    <span className="text-red-500">{validationError}</span>
                }
            </div>

            </fieldset> 

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
                    isInvalid={!firstNameInput.isValid}
                    errorMessage={firstNameInput.errorMessage}

                    onValueChange={
                        (newValue)=> {
                            setFirstNameInput({
                                ...firstNameInput,
                                value: newValue
                            });
                        }
                    }
                    
                    onBlur={()=> checkInputIsEmpty(firstNameInput, setFirstNameInput)}
                    onFocus={() => {
                        setFirstNameInput({
                            ...firstNameInput,
                                isTouched: true,
                                isValid: true,
                                errorMessage: ""
                        });
                    }}
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
                    isInvalid={!birthDateInput.isValid}
                    errorMessage={birthDateInput.errorMessage}

                    onChange={(value)=>{
                        setBirthDateInput({
                            ...birthDateInput,
                            value                            
                        });
                    }}
                    onBlur={()=>{
                        checkInputIsEmpty(birthDateInput, setBirthDateInput);
                        checkBirthDateAgainstMarriageDate();
                    }}

                    onFocus={()=>{
                        setBirthDateInput({
                            ...birthDateInput,
                            isTouched: true,
                            isValid: true,
                            errorMessage: ""
                        });
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
                    defaultValue="MALE"
                    onValueChange={(val) =>{ setGender(val as Gender) }}
                >
                    <Radio value="MALE" classNames={{ label: "text-primary-darker"}}>Male</Radio>
                    <Radio value="FEMALE" classNames={{ label: "text-primary-darker"}}>Female</Radio>
                </RadioGroup>
                
                <Input
                    name="address"
                    label="Address"
                    labelPlacement="outside"
                    placeholder="enter address"
                    variant="bordered"
                    className="textInput pb-4"
                    isRequired

                    value={addressInput.value as string}
                    isInvalid={!addressInput.isValid}
                    errorMessage={addressInput.errorMessage}

                    onValueChange={
                        (newValue)=> {
                            setAddressInput({
                                ...addressInput,
                                value: newValue
                            });
                        }
                    }
                    
                    onBlur={()=> checkInputIsEmpty(addressInput, setAddressInput)}
                    onFocus={() => {
                        setAddressInput({
                            ...addressInput,
                                isTouched: true,
                                isValid: true,
                                errorMessage: ""
                        });
                    }}
                />

            </fieldset>
 
            <div>
                <Button 
                    className="bg-secondary text-primary-lighter"
                    isLoading={pageState == PAGE_STATE.SUBMTTING}
                    onClick={ onSubmit }
                    >Submit
                </Button>
                { 
                    pageState == PAGE_STATE.SUBMISSION_SUCCESS &&
                    <div className="font-bold text-success py-2"> Submission Succeeded </div>
                }
                {
                    pageState == PAGE_STATE.SUBMISSION_FAILED &&
                    <div className="font-bold text-danger py-2"> Submission Failed ! </div>
                }
            </div>

        </form>

    </div>;
}
