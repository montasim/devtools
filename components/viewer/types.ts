// Viewer options
export interface ViewerOptions {
    showTypes: boolean;
    showPaths: boolean;
    sortKeys: boolean;
}

// ViewerPane component props
export interface ViewerPaneProps {
    showTypes?: boolean;
    showPaths?: boolean;
    sortKeys?: boolean;
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    onContentChange?: (content: string) => void;
    initialContent?: string;
    className?: string;
}

// Tree node data structure
export interface TreeNode {
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
    path: string;
    children?: TreeNode[];
    isExpanded?: boolean;
}
