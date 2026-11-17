import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import pretty from 'pretty';
import { canInsertField, fieldPlaceholder, ReceiverFieldStats } from './fields.js';
import { FieldWarnings } from './FieldWarnings.js';
import { RichText } from './RichText.js';
import { readFlag, writeFlag } from './storage.js';

export interface FieldOption {
  // Поле: name, email, extraData.<колонка>
  key: string;
  // Подпись на кнопке и в предупреждениях
  title: string;
}

export interface EditorTab {
  content: React.ReactNode;
  name: string;
}

export interface LetterEditorProps {
  className?: string;
  // Тема редактора: auto — по настройке системы (по умолчанию), light, dark
  colorScheme?: 'auto' | 'dark' | 'light';
  // Свои вкладки после «Редактор» и «HTML»
  extraTabs?: ReadonlyArray<EditorTab>;
  // Кнопки «Вставить поле»; нет — нет строки кнопок
  fields?: ReadonlyArray<FieldOption>;
  // Подсказка после кнопок полей
  fieldsHint?: string;
  html: string;
  onChange?: (html: string) => void;
  // Сводка по получателям: по ней предупреждения о пустых подстановках
  stats?: ReceiverFieldStats;
  // Тема письма: её поля тоже проверяются
  subject?: string;
  // Загрузить картинку и вернуть её адрес; нет — нет кнопки картинки
  uploadImage?: (file: File) => Promise<string>;
}

interface LetterEditorState {
  lightPreview: boolean;
  tabIndex: number;
}

// Выбор фона письма запоминается в браузере
const LIGHT_PREVIEW_KEY = 'le-light-preview';

/**
 * Редактор письма: визуальный редактор, HTML, кнопки полей получателя и
 * предупреждения о пустых подстановках
 */
export class LetterEditor extends React.Component<LetterEditorProps, LetterEditorState> {
  private richText = React.createRef<RichText>();
  private textarea = React.createRef<HTMLTextAreaElement>();

  constructor (props: LetterEditorProps) {
    super(props);
    this.state = { lightPreview: readFlag(LIGHT_PREVIEW_KEY), tabIndex: 0 };
  }

  render () {
    const { extraTabs, fields, html, stats, subject } = this.props;
    const tabs: EditorTab[] = [
      {
        content: (
          <RichText ref={this.richText} html={html} onChange={this.props.onChange}
                    uploadImage={this.props.uploadImage} />
        ),
        name: 'Редактор'
      },
      {
        content: (
          <textarea className='le-html' value={html} onChange={this.handleRawHtmlChange}
                    ref={this.textarea} />
        ),
        name: 'HTML'
      },
      ...(extraTabs || [])
    ];
    // Ключ — номер вкладки: в названии может быть счётчик, он меняется
    const panelClass = 'le-panel' + (this.state.lightPreview ? ' le-light' : '');
    // В тёмной теме письмо показывается тёмным; кнопка показывает его на
    // белом фоне, как у получателей со светлой темой
    const themeToggle = this.state.tabIndex === 0 ? (
      <button type='button' className='le-theme-toggle' aria-pressed={this.state.lightPreview}
              onClick={this.handleLightPreviewToggle}>
        Светлый фон
      </button>
    ) : null;
    const titles = new Map((fields || []).map(field => [field.key, field.title]));
    return (
      <div className={'le-editor' + (this.props.className ? ' ' + this.props.className : '')}
           data-color-scheme={this.props.colorScheme === 'auto' ? undefined :
             this.props.colorScheme}>
        <Tabs selectedIndex={this.state.tabIndex} onSelect={this.handleTabSwitch}>
          <div className='le-tabs-bar'>
            <TabList>
              {tabs.map((tab, index) => <Tab key={index}>{tab.name}</Tab>)}
            </TabList>
            {themeToggle}
          </div>
          {this.renderFields()}
          {tabs.map((tab, index) => (
            <TabPanel key={index}>
              <div className={panelClass}>{tab.content}</div>
            </TabPanel>
          ))}
        </Tabs>
        <FieldWarnings sources={[subject || '', html]} stats={stats} titles={titles} />
      </div>
    );
  }

  // Кнопки полей — только у вкладок с текстом письма
  private renderFields () {
    const { fields, fieldsHint } = this.props;
    if (!fields || this.state.tabIndex > 1) {
      return null;
    }
    return (
      <div className='le-fields' role='group' aria-label='Вставить поле получателя'>
        <span className='le-fields-label'>Вставить поле:</span>
        {fields.filter(field => canInsertField(field.key)).map(field => (
          <button key={field.key} type='button' className='le-field'
                  title={`Вставить ${fieldPlaceholder(field.key)}`}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => this.insertField(field.key)}>
            {field.title}
          </button>
        ))}
        {fieldsHint ? <span className='le-fields-hint'>{fieldsHint}</span> : null}
      </div>
    );
  }

  private insertField (field: string) {
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

  private handleLightPreviewToggle = () => {
    const lightPreview = !this.state.lightPreview;
    writeFlag(LIGHT_PREVIEW_KEY, lightPreview);
    this.setState({ lightPreview });
  };

  private handleRawHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange?.(event.currentTarget.value);
  };

  private handleTabSwitch = (index: number) => {
    // После визуального редактора HTML выравнивается, чтобы его было удобно читать
    if (this.state.tabIndex === 0 && this.props.onChange) {
      this.props.onChange(pretty(this.props.html));
    }
    this.setState({ tabIndex: index });
  };
}
