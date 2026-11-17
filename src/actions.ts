import pell from 'pell';

export type EditorAction = string | {
  icon: string; name: string; result?: () => void; title: string;
};

/**
 * Кнопки панели pell; кнопка картинки — только когда есть чем загрузить
 */
export function editorActions (insertImage?: () => void): EditorAction[] {
  const actions: EditorAction[] = [
    'bold', 'italic', 'underline', 'strikethrough', 'heading1', 'heading2', 'paragraph',
    'olist', 'ulist', 'code', 'line',
    {
      icon: '<small>Aa-</small>',
      name: 'font-small',
      result: () => pell.exec('fontSize', 1),
      title: 'Мелкий шрифт'
    },
    {
      icon: 'Aa',
      name: 'font-normal',
      result: () => pell.exec('fontSize', 3),
      title: 'Обычный шрифт'
    },
    {
      icon: '<big>Aa+</big>',
      name: 'font-large',
      result: () => pell.exec('fontSize', 5),
      title: 'Крупный шрифт'
    },
    {
      icon: '&lt;a href=...&gt;',
      name: 'link',
      title: 'Ссылка'
    }
  ];
  if (insertImage) {
    actions.push({
      icon: '&lt;img&gt;',
      name: 'image',
      result: insertImage,
      title: 'Вставить изображение'
    });
  }
  return actions;
}
