import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import pell from 'pell';
import { editorActions } from './actions.js';
// Ширина вставленной картинки в письме
const IMAGE_WIDTH = 500;
/**
 * Визуальный редактор на pell. Сам pell — только в браузере (componentDidMount)
 */
export class RichText extends React.Component {
    container = React.createRef();
    editor;
    // Последнее место курсора в тексте: кнопка «вставить поле» забирает фокус
    range;
    componentDidMount() {
        const element = this.container.current;
        if (!element) {
            return;
        }
        this.editor = pell.init({
            actions: editorActions(this.props.uploadImage ? this.insertImage : undefined),
            element,
            onChange: this.handleChange
        });
        this.editor.content.innerHTML = this.props.html;
        document.addEventListener('selectionchange', this.saveRange);
    }
    componentWillUnmount() {
        document.removeEventListener('selectionchange', this.saveRange);
        // StrictMode монтирует дважды: второй pell не должен встать рядом с первым
        this.container.current?.replaceChildren();
        this.editor = undefined;
        this.range = undefined;
    }
    componentDidUpdate(prevProps) {
        const content = this.editor?.content;
        // Свой же ввод уже в тексте: перезапись сбросила бы курсор
        if (content && this.props.html !== prevProps.html && content.innerHTML !== this.props.html) {
            content.innerHTML = this.props.html;
        }
    }
    render() {
        return _jsx("div", { className: 'le-pell', ref: this.container });
    }
    /**
     * Вставляет текст на место курсора, без курсора — в конец письма
     */
    insertText(text) {
        const content = this.editor?.content;
        if (!content) {
            return;
        }
        content.focus();
        // В пустом тексте pell сам оборачивает первую строку в абзац, но не внутри
        // execCommand: абзац создаём сами
        if (!content.textContent && !content.querySelector('img')) {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            content.replaceChildren(paragraph);
            const range = document.createRange();
            range.selectNodeContents(paragraph);
            range.collapse(false);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            this.handleChange(content.innerHTML);
            return;
        }
        const selection = window.getSelection();
        if (selection) {
            let range = this.range;
            if (!range || !content.contains(range.startContainer)) {
                range = document.createRange();
                range.selectNodeContents(content);
                range.collapse(false);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }
        pell.exec('insertText', text);
    }
    saveRange = () => {
        const selection = window.getSelection();
        if (this.editor && selection && selection.rangeCount &&
            this.editor.content.contains(selection.getRangeAt(0).startContainer)) {
            this.range = selection.getRangeAt(0).cloneRange();
        }
    };
    handleChange = (html) => {
        this.props.onChange?.(html);
    };
    insertImage = () => {
        const upload = this.props.uploadImage;
        if (!upload) {
            return;
        }
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', async () => {
            const file = fileInput.files?.[0];
            if (!file) {
                return;
            }
            try {
                const link = await upload(file);
                pell.exec('insertImage', link);
                const image = this.container.current?.querySelector(`.pell-content img[src="${CSS.escape(link)}"]`);
                if (image && this.editor) {
                    image.width = IMAGE_WIDTH;
                    this.handleChange(this.editor.content.innerHTML);
                }
            }
            catch (error) {
                alert(error instanceof Error ? error.message : String(error));
                console.error(error);
            }
        });
        fileInput.click();
    };
}
