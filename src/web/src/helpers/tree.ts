
export interface TreeItem {
    id: number
    parent_id: number | null
    children?: any[]
}

export type TNode<T> = T & { children: TNode<T>[], level: number };

export function buildTree<T extends TreeItem>(items: T[]): TNode<T>[] {
    const hashTable = Object.create(null);
    
    items.forEach(item => {
        hashTable[item.id] = { ...item, children: [], level: 0 };
    });

    const tree: TNode<T>[] = [];
    
    const getLevel = (nodeId: number): number => {
        const item = items.find(i => i.id === nodeId);
        if (!item || !item.parent_id || !hashTable[item.parent_id]) {
            return 0;
        }
        return 1 + getLevel(item.parent_id);
    };

    items.forEach(item => {
        const node = hashTable[item.id];
        node.level = getLevel(item.id);

        if (item.parent_id && hashTable[item.parent_id]) {
            hashTable[item.parent_id].children.push(node);
        } else {
            tree.push(node);
        }
    });

    return tree;
}
