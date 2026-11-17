import { jsx as _jsx } from "react/jsx-runtime";
import { checkTemplateFields, fieldPlaceholder, fieldTitle } from './fields.js';
function describe(problem, total, title) {
    const name = `«${title(problem.field)}»`;
    switch (problem.kind) {
        case 'absent':
            return `${name}: такой колонки нет в списке получателей — в письме будет пусто.` +
                (problem.similar ? ` Может быть, «${title(problem.similar)}»? ` +
                    'Заглавные и строчные буквы различаются.' : '');
        case 'empty':
            return `${name}: пусто у всех получателей.`;
        default:
            return `${name}: пусто у ${problem.empty} из ${total}` +
                (problem.example ? `, например у ${problem.example}` : '') +
                '. Проверьте, как письмо выглядит у них.';
    }
}
/**
 * Подстановки, которые у части получателей или у всех окажутся пустыми
 */
export function FieldWarnings({ sources, stats, titles }) {
    if (!stats) {
        return null;
    }
    const problems = checkTemplateFields(sources, stats);
    if (!problems.length) {
        return null;
    }
    const title = (field) => titles?.get(field) || fieldTitle(field);
    return (_jsx("ul", { className: 'le-warnings', "aria-live": 'polite', children: problems.map(problem => (_jsx("li", { title: fieldPlaceholder(problem.field), children: describe(problem, stats.total, title) }, problem.field))) }));
}
