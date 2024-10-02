"use client";
import Link from "next/link";
import styles from './sidebar-styles.module.css';
import { useState } from "react";
import { GoPeople } from "react-icons/go";
import { PiCertificateLight } from "react-icons/pi";


const items = [
    {
        href:"/civilians",
        text: "All Civilians",
        icon: <GoPeople></GoPeople>
    },
    {
        href: "/marriage-certificates",
        text: "Marriage Cases",
        icon: <PiCertificateLight></PiCertificateLight>
    }
];


export function SideBarComponent(){

    const[activeItem, setActiveItem] = useState(()=>{
        return items.findIndex((item)=> item.href == window.location.pathname )
    });



    return <div className={styles.list}>
            {
                items.map((item,i)=>{
                    return <Link 
                            className={`${styles.listItem} ${activeItem == i? styles.active: ""}`} 
                            href={item.href}
                            onClick={()=>setActiveItem(i)}
                            key={i}
                            >
                        <div className="inline-block align-text-top">{item.icon}</div> {item.text}
                    </Link> 
                })
            }
    </div> 
}