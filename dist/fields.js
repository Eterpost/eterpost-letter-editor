/**
 * Поля получателя в шаблоне письма. Вход пакета без React: им пользуются
 * редактор (кнопки «Вставить поле», предупреждения), веб-клиент Почтаря и сервер
 * Почтаря (сводка по сохранённым получателям)
 *
 * Поле обозначается строкой: `name` — имя, `email` — адрес, `extraData.<колонка>` —
 * своя колонка из файла получателей
 */
export const NAME_FIELD = 'name';
export const EMAIL_FIELD = 'email';
const EXTRA_PREFIX = 'extraData.';
function isFilled(value) {
    return value !== undefined && value !== null && String(value).trim() !== '';
}
/**
 * Сводка по получателям за один проход: у скольких заполнено каждое поле
 */
export class FieldStatsCollector {
    stats = new Map();
    first;
    total = 0;
    constructor() {
        this.stats.set(NAME_FIELD, { field: NAME_FIELD, filled: 0 });
    }
    add(receiver) {
        this.total++;
        if (this.first === undefined) {
            this.first = receiver.email;
        }
        const extra = (receiver.extraData || {});
        for (const key of Object.keys(extra)) {
            const field = EXTRA_PREFIX + key;
            if (!this.stats.has(field)) {
                // Колонка появилась не у первого получателя: у первого её нет
                this.stats.set(field, {
                    emptyExample: this.total > 1 ? this.first : undefined, field, filled: 0
                });
            }
        }
        for (const stat of this.stats.values()) {
            const value = stat.field === NAME_FIELD ?
                receiver.name : extra[stat.field.slice(EXTRA_PREFIX.length)];
            if (isFilled(value)) {
                stat.filled++;
            }
            else if (stat.emptyExample === undefined) {
                stat.emptyExample = receiver.email;
            }
        }
    }
    result() {
        return { fields: [...this.stats.values()].map(stat => ({ ...stat })), total: this.total };
    }
}
export function collectFieldStats(receivers) {
    const collector = new FieldStatsCollector();
    for (const receiver of receivers) {
        collector.add(receiver);
    }
    return collector.result();
}
// Знаки имени без скобок в пути Handlebars: всё, кроме пробелов и разделителей
const ID_CHARS = '[^\\s!"#%-,./;->@[-^`{-~]';
const SIMPLE_ID = new RegExp(`^${ID_CHARS}+$`);
const RESERVED = ['true', 'false', 'null', 'undefined'];
// Ссылка на поле получателя внутри {{…}}: receiver.name, receiver.extraData.city,
// receiver.extraData.[Дата продления]
const MUSTACHE = /\{\{\{?([\s\S]*?)\}?\}\}/g;
const REFERENCE = new RegExp('(?<![^\\s({=~])receiver\\.(name|email|extraData\\.(?:\\[([^\\]]*)\\]|(' +
    ID_CHARS + '+)))(?=[\\s}).~]|$)', 'g');
/**
 * Можно ли вставить колонку в шаблон: в названии не должно быть «]»
 */
export function canInsertField(field) {
    return !field.startsWith(EXTRA_PREFIX) || !field.includes(']');
}
/**
 * Подстановка поля для шаблона: {{receiver.extraData.city}}; название с
 * пробелами и знаками — в квадратных скобках
 */
export function fieldPlaceholder(field) {
    if (!field.startsWith(EXTRA_PREFIX)) {
        return `{{receiver.${field}}}`;
    }
    const key = field.slice(EXTRA_PREFIX.length);
    const simple = SIMPLE_ID.test(key) && !RESERVED.includes(key) && !/^\d+$/.test(key);
    return `{{receiver.extraData.${simple ? key : `[${key}]`}}}`;
}
/**
 * Название поля для людей: «Имя», «Адрес», «город»
 */
export function fieldTitle(field) {
    if (field === NAME_FIELD) {
        return 'Имя';
    }
    if (field === EMAIL_FIELD) {
        return 'Адрес';
    }
    return field.startsWith(EXTRA_PREFIX) ? field.slice(EXTRA_PREFIX.length) : field;
}
/**
 * Поля получателя, которые встречаются в шаблонах, без повторов, в порядке появления.
 * Пути от другого контекста ({{#with receiver}}{{name}}) не находятся
 */
export function findTemplateFields(...sources) {
    const found = new Set();
    for (const source of sources) {
        for (const mustache of (source || '').matchAll(MUSTACHE)) {
            for (const match of mustache[1].matchAll(REFERENCE)) {
                const key = match[2] ?? match[3];
                found.add(key === undefined ? match[1] : EXTRA_PREFIX + key);
            }
        }
    }
    return [...found];
}
/**
 * Поля шаблона, которые у части получателей или у всех подставятся пустыми
 */
export function checkTemplateFields(sources, stats) {
    if (!stats.total) {
        return [];
    }
    const byField = new Map(stats.fields.map(stat => [stat.field, stat]));
    const problems = [];
    for (const field of findTemplateFields(...sources)) {
        if (field === EMAIL_FIELD) {
            continue;
        }
        const stat = byField.get(field);
        if (!stat) {
            const lower = field.toLowerCase();
            const similar = stats.fields.find(item => item.field.toLowerCase() === lower)?.field;
            problems.push({ empty: stats.total, field, kind: 'absent', similar });
        }
        else if (!stat.filled) {
            problems.push({ empty: stats.total, field, kind: 'empty' });
        }
        else if (stat.filled < stats.total) {
            problems.push({
                empty: stats.total - stat.filled, example: stat.emptyExample, field, kind: 'partly'
            });
        }
    }
    return problems;
}
