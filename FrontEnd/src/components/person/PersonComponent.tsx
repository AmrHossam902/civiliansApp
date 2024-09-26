import { Handle, Position } from "@xyflow/react";
import Image from "next/image";
import maleAvatar from "@/assets/male-avatar.png";
import femaleAvatar from "@/assets/female-avatar.png";


import styles from './style.module.css'; 

export function PersonComponent({data}: {data: {gender: string, name: string, birthYear: string, deathYear: string}}) {
    return <div className={styles.person}>
            <div className={styles.imageContainer}>
                { data.gender == "MALE" && <Image className={styles.maleAvatar} src={maleAvatar} alt='m-av'></Image>}
                { data.gender == "FEMALE" && <Image className={styles.femaleAvatar} src={femaleAvatar} alt='m-av'></Image>}
            </div>
            <div className={styles.text}>
                {data.name}
                <br />
                {   `${data.birthYear} - ${data.deathYear}`     }
            </div>

            <Handle className={styles.handle} type='target' id="top" position={Position.Top}></Handle>
            <Handle className={styles.handle} type='source' id="bottom" position={Position.Bottom}></Handle>
        </div>
}