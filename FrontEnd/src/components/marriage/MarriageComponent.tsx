import { Handle, Position } from "@xyflow/react";
import styles from './style.module.css';

export function MarriageComponent({data}: {data: {marriageYear: string }}) {
    return <div className={styles.marriageNode}>
            <Handle className={styles.handle} type='target' id="top" position={Position.Top}></Handle>   
            married in
            <br/>
            {data.marriageYear}
            <Handle className={styles.handle} type='source' id="bottom" position={Position.Bottom}></Handle>
        </div>
}