import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import pretty from 'pretty';
import { canInsertField, fieldPlaceholder } from './fields.js';
import { FieldWarnings } from './FieldWarnings.js';
import { RichText } from './RichText.js';
import { readFlag, writeFlag } from './storage.js';
// Выбор фона письма запоминается в браузере
const LIGHT_PREVIEW_KEY = 'le-light-preview';
/**
 * Редактор письма: визуальный редактор, HTML, кнопки полей получателя и
 * предупреждения о пустых подстановках
 */
export class LetterEditor extends React.Component {
    richText = React.createRef();
    textarea = React.createRef();
    constructor(props) {
        super(props);
        this.state = { lightPreview: readFlag(LIGHT_PREVIEW_KEY), tabIndex: 0 };
    }
    render() {
        const { extraTabs, fields, html, stats, subject } = this.props;
        const tabs = [
            {
                content: (_jsx(RichText, { ref: this.richText, html: html, onChange: this.props.onChange, uploadImage: this.props.uploadImage })),
                name: 'Редактор'
            },
            {
                content: (_jsx("textarea", { className: 'le-html', value: html, onChange: this.handleRawHtmlChange, ref: this.textarea })),
                name: 'HTML'
            },
            ...(extraTabs || [])
        ];
        // Ключ — номер вкладки: в названии может быть счётчик, он меняется
        const panelClass = 'le-panel' + (this.state.lightPreview ? ' le-light' : '');
        // В тёмной теме письмо показывается тёмным; кнопка показывает его на
        // белом фоне, как у получателей со светлой темой
        const themeToggle = this.state.tabIndex === 0 ? (_jsx("button", { type: 'button', className: 'le-theme-toggle', "aria-pressed": this.state.lightPreview, onClick: this.handleLightPreviewToggle, children: "\u0421\u0432\u0435\u0442\u043B\u044B\u0439 \u0444\u043E\u043D" })) : null;
        const titles = new Map((fields || []).map(field => [field.key, field.title]));
        return (_jsxs("div", { className: 'le-editor' + (this.props.className ? ' ' + this.props.className : ''), "data-color-scheme": this.props.colorScheme === 'auto' ? undefined :
                this.props.colorScheme, children: [_jsxs(Tabs, { selectedIndex: this.state.tabIndex, onSelect: this.handleTabSwitch, children: [_jsxs("div", { className: 'le-tabs-bar', children: [_jsx(TabList, { children: tabs.map((tab, index) => _jsx(Tab, { children: tab.name }, index)) }), themeToggle] }), this.renderFields(), tabs.map((tab, index) => (_jsx(TabPanel, { children: _jsx("div", { className: panelClass, children: tab.content }) }, index)))] }), _jsx(FieldWarnings, { sources: [subject || '', html], stats: stats, titles: titles })] }));
    }
    // Кнопки полей — только у вкладок с текстом письма
    renderFields() {
        const { fields, fieldsHint } = this.props;
        if (!fields || this.state.tabIndex > 1) {
            return null;
        }
        return (_jsxs("div", { className: 'le-fields', role: 'group', "aria-label": '\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044F', children: [_jsx("span", { className: 'le-fields-label', children: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u0435:" }), fields.filter(field => canInsertField(field.key)).map(field => (_jsx("button", { type: 'button', className: 'le-field', title: `Вставить ${fieldPlaceholder(field.key)}`, onMouseDown: event => event.preventDefault(), onClick: () => this.insertField(field.key), children: field.title }, field.key))), fieldsHint ? _jsx("span", { className: 'le-fields-hint', children: fieldsHint }) : null] }));
    }
    insertField(field) {
        const text = fieldPlaceholder(field);
        if (this.state.tabIndex === 0) {
            this.richText.current?.insertText(text);
            return;
        }
        const textarea = this.textarea.current;
        if (!textarea || !this.props.onChange) {
            return;
        }
        const { selectionEnd, selectionStart, value } = textarea;
        this.props.onChange(value.slice(0, selectionStart) + text + value.slice(selectionEnd));
        const caret = selectionStart + text.length;
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(caret, caret);
        });
    }
    handleLightPreviewToggle = () => {
        const lightPreview = !this.state.lightPreview;
        writeFlag(LIGHT_PREVIEW_KEY, lightPreview);
        this.setState({ lightPreview });
    };
    handleRawHtmlChange = (event) => {
        this.props.onChange?.(event.currentTarget.value);
    };
    handleTabSwitch = (index) => {
        // После визуального редактора HTML выравнивается, чтобы его было удобно читать
        if (this.state.tabIndex === 0 && this.props.onChange) {
            this.props.onChange(pretty(this.props.html));
        }
        this.setState({ tabIndex: index });
    };
}
