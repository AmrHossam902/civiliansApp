import Person from "@/dtos/Person";
import InputState from "@/types/inputState";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./personDropDown.styles.css";


type Props = {
    label: string;
    setSelectedPerson: (p?: Person) => void,
    inputState: InputState,
    setInputState: (input: InputState) => void
    onInputBlur: () => void,
    onInputChange: (v: string) => void
}

export function PersonDropDownComponent({
    label,
    setSelectedPerson,
    inputState,
    setInputState,
    onInputBlur,
    onInputChange
}: Props) {

    const peopleFetchTimeout = useRef<NodeJS.Timeout>();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dropdownItems, setDropdownItems] = useState<Person[]>([]);


    const getPerson = useCallback((search: string) => {

        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            cache: 'no-cache',
            body: JSON.stringify({
                query: `query people($limit: Int, $search: String){
                    people(search: $search, limit: $limit) {
                        people {
                            id
                            firstName
                            middleName
                            lastName
                            birthDate
                            ssn
                            gender
                        }

                    }
                }`,
                variables: {
                    limit: 20,
                    search: search
                }
            })
        })

    }, []);


    const onKeyUp = useCallback((e: any) => {
        e.continuePropagation();

        console.log(inputState.value);
        setDropdownItems([]);

        if (inputState.value) {
            setIsLoading(true);
            clearTimeout(peopleFetchTimeout.current);
            peopleFetchTimeout.current = setTimeout(() => {
                getPerson(inputState.value as string)
                    .then((res) => res.json())
                    .then((res) => {
                        setIsLoading(false);
                        console.log(res)
                        if (!res.errors) {
                            setDropdownItems([...res.data.people.people]);
                        }
                    })
                    .catch((err) => { console.error(err) });

            }, 1000);
        }
        else {
            clearTimeout(peopleFetchTimeout.current);
            setIsLoading(false);
        }
    }, [inputState]);

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
        inputValue={inputState.value as string}
        onInputChange={onInputChange}
        onKeyUp={onKeyUp}
        onSelectionChange={(key) => {

            const selectedPerson = dropdownItems.find((item) => item.id == key);
            setSelectedPerson(selectedPerson);

        }}

        listboxProps={{
            emptyContent: isLoading ? "searching..." : "nothing found"
        }}


        isInvalid={!inputState.isValid}
        errorMessage={inputState.errorMessage}
        onBlur={onInputBlur}
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