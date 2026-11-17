import * as React from 'react';
import { ReceiverFieldStats } from './fields.js';
export interface FieldOption {
    key: string;
    title: string;
}
export interface EditorTab {
    content: React.ReactNode;
    name: string;
}
export interface LetterEditorProps {
    className?: string;
    extraTabs?: ReadonlyArray<EditorTab>;
    fields?: ReadonlyArray<FieldOption>;
    fieldsHint?: string;
    html: string;
    onChange?: (html: string) => void;
    stats?: ReceiverFieldStats;
    subject?: string;
    uploadImage?: (file: File) => Promise<string>;
}
interface LetterEditorState {
    lightPreview: boolean;
    tabIndex: number;
}
/**
 * Редактор письма: визуальный редактор, HTML, кнопки полей получателя и
 * предупреждения о пустых подстановках
 */
export declare class LetterEditor extends React.Component<LetterEditorProps, LetterEditorState> {
    private richText;
    private textarea;
    constructor(props: LetterEditorProps);
    render(): React.JSX.Element;
    private renderFields;
    private insertField;
    private handleLightPreviewToggle;
    private handleRawHtmlChange;
    private handleTabSwitch;
}
export {};
