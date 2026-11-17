export type EditorAction = string | {
    icon: string;
    name: string;
    result?: () => void;
    title: string;
};
/**
 * Кнопки панели pell; кнопка картинки — только когда есть чем загрузить
 */
export declare function editorActions(insertImage?: () => void): EditorAction[];
