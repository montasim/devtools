export interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onError: (error: string | null) => void;
    label?: string;
    readOnly?: boolean;
    height?: string;
    onClear?: () => void;
    showEmptyPrompt?: boolean;
}
