import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import "./personDropDown.styles.css";
import { FaSearch } from "react-icons/fa";
import { useCallback, useState } from "react";
import Person from "@/dtos/Person";
import { getPeople } from "@/services/person.service";
import InputState from "@/types/inputState";


interface Props {
    filters : {gender?: "MALE" | "FEMALE"};
    inputState: InputState;
    label: string;
    setInputState: (input: InputState) => void;
    validateInput: () => void;
}

export default function PersonAutoComplete({ 
    filters, 
    inputState,
    label, 
    setInputState, 
    validateInput 
}: Props){

    const [dropdownItems, setDropdownItems] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");

    return <Autocomplete
                classNames={{
                    popoverContent: "popover"
                }}
                label={label}
                labelPlacement="outside"
                placeholder="Name / National Id"
                startContent={<FaSearch className="text-primary-darker" />}
                variant="bordered"
                className="textInput pb-4 block"
                isRequired
                defaultItems={dropdownItems}
                isLoading={isLoading}
                menuTrigger="input"
                inputValue={inputValue}
                onInputChange={(value) => {
                    console.log("input change....")
                    setInputValue(value);

                    if(!value)
                        return;

                    setIsLoading(true);
                    
                    getPeople(value, filters)
                    .then((result)=>{
                        console.log(result.people);
                        setDropdownItems( result.people );
                        setIsLoading(false);
                    })
                }}
                /* onKeyUp={(key)=>{ console.log("key Up, " , key)}}  */
                onSelectionChange={
                    (key) => {
                        () => console.log("selection change ....")
                    
                        const selectedPerson = dropdownItems.find((item) => item.id == key);
                        setInputState({ 
                            ...inputState,
                            value: selectedPerson || null
                        });
                }}

                listboxProps={{
                    emptyContent: isLoading ? "searching..." : "nothing found"
                }}


                isInvalid={!inputState.isValid}
                errorMessage={inputState.errorMessage}
                onBlur={()=> {
                    console.log("input blurr ....");
                    if(!inputValue){
                        setInputState({
                            ...inputState,
                            isValid: false,
                            errorMessage: "field required please"
                        });
                        return;
                    }
                    validateInput();
                }}
                onFocus={()=>{
                    
                    setInputState({
                        ...inputState,
                        isValid: true,
                        errorMessage: ""
                    });
                }}
            >
                {
                    (item: Person) => (
                        <AutocompleteItem key={item.id as string} textValue={`${item.firstName} ${item.middleName} ${item.lastName}`}>
                            <div>
                                <h2>{`${item.firstName} ${item.middleName} ${item.lastName}`}</h2>
                                <h4>{item.ssn}</h4>
                            </div>
                        </AutocompleteItem>
                    )
                }
            </Autocomplete> 
}