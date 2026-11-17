import * as React from 'react';
import {
  checkTemplateFields, fieldPlaceholder, FieldProblem, fieldTitle, ReceiverFieldStats
} from './fields.js';

export interface FieldWarningsProps {
  // Тема и текст письма
  sources: string[];
  stats?: ReceiverFieldStats;
  // Подписи полей от хозяина: ключ поля → название
  titles?: ReadonlyMap<string, string>;
}

function describe (problem: FieldProblem, total: number, title: (field: string) => string) {
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
export function FieldWarnings ({ sources, stats, titles }: FieldWarningsProps) {
  if (!stats) {
    return null;
  }
  const problems = checkTemplateFields(sources, stats);
  if (!problems.length) {
    return null;
  }
  const title = (field: string) => titles?.get(field) || fieldTitle(field);
  return (
    <ul className='le-warnings' aria-live='polite'>
      {problems.map(problem => (
        <li key={problem.field} title={fieldPlaceholder(problem.field)}>
          {describe(problem, stats.total, title)}
        </li>
      ))}
    </ul>
  );
}
