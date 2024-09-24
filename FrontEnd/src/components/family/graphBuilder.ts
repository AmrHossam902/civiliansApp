import Person from "@/interfaces/Person";
import { Edge, Node, Position } from "@xyflow/react"

export default class GraphBuilder {

    allNodes: Node[];
    allEdges: Edge[];

    constructor(){
 
        this.allNodes = [];
        this.allEdges = [];
    }


    private processPerson(p: Person, currentLayer: number){

        let myNode = this.allNodes.find( (n)=> p.id == n.id);
        if(!myNode){
            myNode = {
                id: p.id!,
                position: { x: 0, y:0},
                type: 'person',
                origin: [0.5, 0.5],
                data: {
                    layer: currentLayer,
                    gender: p.gender, 
                    name: `${p.firstName} ${p.lastName}`
                }
            }
            this.allNodes.push(myNode);
        }


        if(p.marriedTo?.length){
            p.marriedTo.forEach((marriage)=>{

                this.processPerson(marriage.spouse, currentLayer);
                
                let marriageNode = this.buildMarriageNode(p, marriage.spouse, currentLayer + 1);

                this.buildEdge(marriage.spouse.id!, marriageNode.id);
                this.buildEdge(myNode.id, marriageNode.id);

                if(marriage.children?.length){
                    this.processChildren(marriage.children, marriageNode, currentLayer + 2);
                }
            });

           
        }

        if(p.parents?.length){
            
            //build marriage node
            const marriageNode = this.buildMarriageNode(p.parents[0],p.parents[1], currentLayer-1);

            this.processParents(p.parents, marriageNode, currentLayer-2);


            if(p.siblings?.length){
                this.processSiblings(p.siblings, marriageNode, currentLayer);
            }

            this.buildEdge(marriageNode.id, myNode.id);

        }




    }

    build(p: Person){
        this.processPerson(p, 0);
        this.calculateNodePositions();
        console.log(this.allNodes);
        console.log(this.allEdges);
    }

    processParents(parents: Person[], marriageNode: Node, currentLayer: number){
        
        parents.forEach((p:Person) =>{
            this.processPerson(parents[0], currentLayer);
            this.processPerson(parents[1], currentLayer);

            this.buildEdge(p.id!, marriageNode.id);
            
        });
    }

    processSiblings(siblings: Person[], parentsMarriageNode: Node, currentLayer: number){
        
        siblings.forEach( (sib:Person) =>{
            this.processPerson(sib, currentLayer);
            this.buildEdge(parentsMarriageNode.id, sib.id!);
        });
    }

    processChildren(children: Person[], marriageNode:Node, currentLayer: number){
        
        children.forEach((child: Person)=>{
            this.processPerson(child, currentLayer );
            this.buildEdge(marriageNode.id, child.id!);
        });
    }

    buildEdge(sourceId: string, targetId:string){

        const edgeId = `${sourceId}=${targetId}`; 
        let edge = this.allEdges.find( (edge: Edge) => {
            return edge.id == edgeId
        });

        if(!edge){
            this.allEdges.push({
                id: edgeId,
                source: sourceId,
                target: targetId,
                sourceHandle: 'bottom',
                targetHandle: 'top'
            });
            
        }
    }

    buildMarriageNode(person1: Person, person2: Person, layer: number): Node{
        
        const foundNode = this.allNodes.find((node) => {
            return node.data.spouseA == person1.id && node.data.spouseB == person2.id ||
                    node.data.spouseA == person2.id && node.data.spouseB == person1.id  
        })

        if(foundNode)
            return foundNode;

        const newNode: Node = {
            id: `M-${Math.ceil(Math.random() * 1_000_000)}`,
            position: { x:0, y:0},
            type: 'marriage',
            origin: [0.5, 0.5],
            data: {
                layer,
                spouseA: person1.id,
                spouseB: person2.id
            }
        }

        this.allNodes.push(newNode);

        return newNode;
    }

    calculateNodePositions(){

        let lowestLayer = 0, highestLayer =0;
        this.allNodes.forEach((node:Node)=>{
            if(node.data.layer as number > highestLayer)
                highestLayer = node.data.layer as number
            else if(node.data.layer as number < lowestLayer)
                lowestLayer = node.data.layer as number 
        });

        for(let currentLayer = lowestLayer; currentLayer <= highestLayer; currentLayer++){
            let layer: Node[] = this.allNodes.filter((node:Node)=>{
                return node.data.layer as number == currentLayer
            });

            let xPos = 10;
            layer.forEach( (node:Node)=>{
                node.position = { x : xPos, y: currentLayer * 400 }
                xPos+=150
            });
        }
    }

}


type Layer = {
    nodes: Node[],
    prev: Layer | null;
    next: Layer | null;
}