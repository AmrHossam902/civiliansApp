import Person from "@/interfaces/Person";
import { Edge, MarkerType, Node, Position, getIncomers, getOutgoers } from "@xyflow/react"

export default class GraphBuilder {

    allNodes: Node[];
    allEdges: Edge[];

    readonly horizontalSpacing = 150;
    readonly verticalSpacing = 300;

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
        const layers:Node[][] = this.segmentNodesIntoLayers();
        this.organizeNodePositions(layers);
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

    segmentNodesIntoLayers(){

        let layers: Node[][] = [];

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
                node.position = { x : xPos, y: currentLayer * this.verticalSpacing }
                xPos += this.horizontalSpacing
            });

            layers.push(layer);
        }

        return layers;
    }

    organizeNodePositions(layers:Node[][]){
        //find densiest layer 
        let densiestLayerIndex = 0;
        for(let i=0; i< layers.length; i+=2){
            if(layers[i].length > layers[densiestLayerIndex].length)
                densiestLayerIndex = i;
        }


        //organise upwards
        for(let i=densiestLayerIndex-1; i>0; i-=2){
            
            layers[i].forEach((marriageNode: Node)=>{
                let parents = getIncomers(marriageNode, this.allNodes, this.allEdges);
                let children = getOutgoers(marriageNode, this.allNodes, this.allEdges);

                let avgX = 0;
                children.forEach( child => avgX += child.position.x );
                avgX = Math.ceil(avgX / children.length);
                marriageNode.position.x = avgX;

                parents[0].position.x = avgX - this.horizontalSpacing / 2;
                parents[1].position.x = avgX + this.horizontalSpacing / 2;

            })
                
        }


        //organize downwards
        for(let i=densiestLayerIndex+1; i < layers.length; i+=2){

            layers[i].forEach((marriageNode: Node)=>{
                let parents = getIncomers(marriageNode, this.allNodes, this.allEdges);
                let children = getOutgoers(marriageNode, this.allNodes, this.allEdges);

                let avgX = 0;
                parents.forEach( parent => avgX += parent.position.x );
                avgX = Math.ceil( avgX / parents.length);
                marriageNode.position.x = avgX;

                if(children.length){
                    const leftMostXPos = avgX - ( (children.length - 1) * this.horizontalSpacing / 2);

                    children.forEach((child:Node, index)=>{
                        child.position.x = leftMostXPos + (index * this.horizontalSpacing);
                    })

                }
            });

        }
    }



}


type Layer = {
    nodes: Node[],
    prev: Layer | null;
    next: Layer | null;
}