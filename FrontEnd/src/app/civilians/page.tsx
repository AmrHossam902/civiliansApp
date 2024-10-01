'use client'
import { SearchComponent } from "@/components/search/searchComponent";
import { SideBarComponent } from "@/components/sidebar/sideBarComponent";
import { Button, Input, Link, SortDescriptor, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Key, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";

type Col = {
    key: string;
    sortable?: boolean;
  }
  
const cols: Col[]= [
    {
        key: "firstName",
        sortable: true
    },{
        key:"lastName",
        sortable: true
    },{
        key: "middleName",
    },{
        key: "birthDate"
    },{
        key: "ssn"
    },{
        key: "gender"
    },{
        key: "family"
    }
]


type Row = {
    firstName: string;
    lastName: string;
    middleName: string;
    ssn: string;
    birthDate: string;
    gender: string;
}

/* type QueryResult = {
    people: Row[],
    next: string,
    prev: string
} */


enum PageState {
    IS_LOADING,
    LOADING_COMPLETE,
    LOADING_ERROR
}

export default function AllCivilians(){
    
    const [data, setData] = useState<Row[]>([]);
    const [pageState, setPageState] = useState<PageState>(PageState.IS_LOADING);
  
    const pagination = useRef<{next: string, prev:string}>({next: "", prev: ""});
    const sortDescriptor = useRef<SortDescriptor>({column: 'firstName', direction: 'ascending'});
    const searchVal = useRef<string>("");

    
    const fetchData = (dir: "after" | "before" | "")=>{ 
        
        setPageState(PageState.IS_LOADING);
        const sortArr:[string, string][] = [];
        
        sortDescriptor &&
          sortArr.push([
            sortDescriptor.current.column as string, 
            sortDescriptor.current.direction == "ascending" ? "asc" : "desc" 
        ]);

        fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          cache: 'no-cache',
          body: JSON.stringify({
            query: `query people($search: String, $limit: Int, $after: String, $before: String, $sort: [[String!]!]){
              people(search: $search, limit: $limit, after: $after, before: $before, sort: $sort) {
                people {
                  firstName
                  lastName
                  middleName
                  ssn
                  birthDate
                  gender
                }
                next
                prev
              }
          }`,
          variables: {
            "limit": 10,
            "after": dir == "after" ? pagination.current.next: "",
            "before": dir == "before" ? pagination.current.prev: "",
            "sort": sortArr,
            "search": searchVal.current
          }
          })
        })
        .then( res => res.json())
        .then(data => { 
            pagination.current.next = data.data.people.next || "";
            pagination.current.prev = data.data.people.prev || "";
            setData([...data.data.people.people]); 
            console.log(data);
            setPageState(PageState.LOADING_COMPLETE);
        })
        .catch( (e)=>{ 
            setPageState(PageState.LOADING_ERROR); 
            console.error(e); 
        });

    return <div>all civilians</div>;
    }

    function onSortChange(sortDesc: SortDescriptor){
        console.log(sortDesc);
        sortDescriptor.current = sortDesc;
        fetchData("");
    }

    function onSearchChange(newVal: string){
        console.log(newVal);
        searchVal.current = newVal;
        fetchData("");
    }

    useEffect(()=>{
        fetchData("")
    },[]);

    return <div>
            <Table 
                classNames={
                    { 
                        base: "bg-primary-lighter",
                        wrapper: "bg-primary-ligher",
                        th: "bg-primary-light text-primary-darker hover:!text-primary-dark",
                        table: "relative bg-primary-lighter text-primary-darker",
                        loadingWrapper: "backdrop-blur-sm" 
                    }
                }
                aria-label="Example static collection table"
                topContent={
                    <SearchComponent onChange={onSearchChange}></SearchComponent>
                }
                bottomContent={
                    <div>
                        <Button 
                            onClick={() => fetchData("before")} 
                            isDisabled={pageState == PageState.IS_LOADING || !pagination.current.prev}
                            className="bg-secondary text-primary-lighter"
                        ><strong>prev.</strong></Button>
                        &nbsp;
                        <Button 
                            onClick={() => fetchData("after")} 
                            isDisabled={pageState == PageState.IS_LOADING || !pagination.current.next}
                            className="bg-secondary text-primary-lighter"
                        > <strong>next</strong> </Button>
                    </div>}
                sortDescriptor={sortDescriptor.current}
                onSortChange={onSortChange}    
            >
            <TableHeader columns={cols}>
                {(col) => <TableColumn key={col.key} allowsSorting={col.sortable}>{col.key}</TableColumn>}
            </TableHeader>
            <TableBody  
                items={data} 
                isLoading={pageState == PageState.IS_LOADING} 
                loadingContent={<Spinner>...loading</Spinner>} >
                {
                (row: Row) => {
                    return <TableRow key= {row.ssn}>{
                        (colKey: Key) => { 
                        if(colKey == "family")
                            return <TableCell>
                            <Link href={`http://localhost:3000/civilians/${row["ssn"]}`}>
                                <IoIosPeople></IoIosPeople>
                            </Link>
                            </TableCell>

                        return <TableCell>{row[colKey as keyof Row]}</TableCell>
                        } 
                    }</TableRow>;
                }
                }
            </TableBody>
            </Table>
        </div>


}

