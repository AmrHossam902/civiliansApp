'use client';
import { Listbox, ListboxItem } from "@nextui-org/react";
import Link from "next/link";


const items = [
    {
        href:"/civilians",
        text: "All Civilians",
    },
    {
        href: "/marriage-certificates",
        text: "Marriage Cases"
    }
];


export function SideBarComponent(){

    return <Listbox classNames={{
                base: "p-3"
            }}>
            {
                items.map((item,i)=>{
                    return <ListboxItem key={i} classNames={{
                        base: [
                            "text-primary-darker",
                            "hover:!bg-secondary-light ",
                            "focus:!bg-secondary-light "
                        ],

                    }}>
                        <Link className="block p-4 font-bold" href={item.href}>{item.text}</Link>
                    </ListboxItem>
                })
            }
        </Listbox>;
}