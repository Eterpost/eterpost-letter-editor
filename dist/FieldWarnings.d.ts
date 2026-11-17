import * as React from 'react';
import { ReceiverFieldStats } from './fields.js';
export interface FieldWarningsProps {
    sources: string[];
    stats?: ReceiverFieldStats;
    titles?: ReadonlyMap<string, string>;
}
/**
 * Подстановки, которые у части получателей или у всех окажутся пустыми
 */
export declare function FieldWarnings({ sources, stats, titles }: FieldWarningsProps): React.JSX.Element | null;
