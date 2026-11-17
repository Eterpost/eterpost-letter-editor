import * as React from 'react';
export interface RichTextProps {
    html: string;
    onChange?: (value: string) => void;
    uploadImage?: (file: File) => Promise<string>;
}
/**
 * Визуальный редактор на pell. Сам pell — только в браузере (componentDidMount)
 */
export declare class RichText extends React.Component<RichTextProps> {
    private container;
    private editor?;
    private range?;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: RichTextProps): void;
    render(): React.JSX.Element;
    /**
     * Вставляет текст на место курсора, без курсора — в конец письма
     */
    insertText(text: string): void;
    private saveRange;
    private handleChange;
    private insertImage;
}
