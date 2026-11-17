/**
 * Поля получателя в шаблоне письма. Вход пакета без React: им пользуются
 * редактор (кнопки «Вставить поле», предупреждения), веб-клиент Почтаря и сервер
 * Почтаря (сводка по сохранённым получателям)
 *
 * Поле обозначается строкой: `name` — имя, `email` — адрес, `extraData.<колонка>` —
 * своя колонка из файла получателей
 */
export declare const NAME_FIELD = "name";
export declare const EMAIL_FIELD = "email";
export interface FieldStat {
    emptyExample?: string;
    field: string;
    filled: number;
}
export interface ReceiverFieldStats {
    fields: FieldStat[];
    total: number;
}
export interface FieldReceiver {
    email: string;
    extraData?: {
        [field: string]: unknown;
    } | object;
    name?: string;
}
export type FieldProblemKind = 'absent' | 'empty' | 'partly';
export interface FieldProblem {
    empty: number;
    example?: string;
    field: string;
    kind: FieldProblemKind;
    similar?: string;
}
/**
 * Сводка по получателям за один проход: у скольких заполнено каждое поле
 */
export declare class FieldStatsCollector {
    private stats;
    private first?;
    private total;
    constructor();
    add(receiver: FieldReceiver): void;
    result(): ReceiverFieldStats;
}
export declare function collectFieldStats(receivers: Iterable<FieldReceiver>): ReceiverFieldStats;
/**
 * Можно ли вставить колонку в шаблон: в названии не должно быть «]»
 */
export declare function canInsertField(field: string): boolean;
/**
 * Подстановка поля для шаблона: {{receiver.extraData.city}}; название с
 * пробелами и знаками — в квадратных скобках
 */
export declare function fieldPlaceholder(field: string): string;
/**
 * Название поля для людей: «Имя», «Адрес», «город»
 */
export declare function fieldTitle(field: string): string;
/**
 * Поля получателя, которые встречаются в шаблонах, без повторов, в порядке появления.
 * Пути от другого контекста ({{#with receiver}}{{name}}) не находятся
 */
export declare function findTemplateFields(...sources: string[]): string[];
/**
 * Поля шаблона, которые у части получателей или у всех подставятся пустыми
 */
export declare function checkTemplateFields(sources: string[], stats: ReceiverFieldStats): FieldProblem[];
