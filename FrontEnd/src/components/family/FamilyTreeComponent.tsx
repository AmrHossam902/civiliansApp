'use client';
import { Controls, Edge, Node, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo } from 'react';
import Person from '@/interfaces/Person';

import GraphBuilder from './graphBuilder';


import { MarriageComponent } from '../marriage/MarriageComponent';
import { PersonComponent } from '../person/PersonComponent';

import styles from './familyTree.module.css';

const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [/* { id: 'e1-2', source: '1', target: '2' } */];

export default function FamilyTreeComponent({ person }: {person: Person}){

    const nodeTypes = useMemo(
        () => (
            {
                "person" : PersonComponent,
                "marriage" : MarriageComponent

            })
        ,[]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(()=>{
        const builder = new GraphBuilder();
        builder.build(person);

        setNodes(builder.allNodes);
        setEdges(builder.allEdges);

    }, []);

    return (
        <div className={styles.flowContainer}>
            <ReactFlow 
                nodeTypes={nodeTypes}
                nodes={nodes} 
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={(instance)=> instance.fitView() }
                minZoom={0.01}
                >
                <Controls/>
            </ReactFlow>
        </div>
      );
}







