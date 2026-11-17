# eterpost-letter-editor

Редактор письма [Почтаря (Eterpost)](https://eterpost.ru) отдельным React-компонентом:
визуальный редактор и HTML, кнопки «Вставить поле» для подстановок получателя и
предупреждения о подстановках, которые у части получателей окажутся пустыми. Им
пользуется веб-интерфейс Почтаря; его можно встроить в любой интерфейс на React 18,
который создаёт рассылки в Почтаре.

Письмо — шаблон [Handlebars](https://handlebarsjs.com/), как его ждёт Почтарь:
`{{receiver.name}}`, `{{receiver.email}}`, `{{receiver.extraData.<колонка>}}`.

## Установка

```
npm install github:Eterpost/eterpost-letter-editor#v0.1.0
```

Нужны `react` и `react-dom` 18. Собранный код лежит в `dist/` каждого тега: при
установке ничего не собирается.

## Встраивание

```tsx
import { LetterEditor } from 'eterpost-letter-editor';
import 'eterpost-letter-editor/style.css';

<LetterEditor
  html={html}
  onChange={setHtml}
  fields={[
    { key: 'name', title: 'Имя' },
    { key: 'extraData.if_own_3', title: 'Крупный клиент' }
  ]}
  stats={stats}
  subject={subject}
  uploadImage={async file => uploadToImageServer(file)}
  extraTabs={[{ name: 'Получатели', content: <Receivers /> }]}
/>
```

| Prop | Обязателен | Смысл |
|------|-----------|-------|
| `html` | да | Текст письма (Handlebars) |
| `onChange` | нет | Новый текст. Без него правки никуда не уходят, поэтому передавайте его всегда, когда текст можно менять |
| `fields` | нет | Кнопки «Вставить поле»: `key` — поле (`name`, `email`, `extraData.<колонка>`), `title` — подпись. Нет — нет строки кнопок |
| `fieldsHint` | нет | Подсказка после кнопок |
| `stats` | нет | Сводка по получателям (`ReceiverFieldStats`, см. ниже) — по ней предупреждения под редактором. Нет — нет предупреждений |
| `subject` | нет | Тема: её поля тоже проверяются |
| `uploadImage` | нет | Загрузить картинку и вернуть её адрес; отказ — `Error` с текстом для пользователя. Нет — нет кнопки картинки |
| `extraTabs` | нет | Свои вкладки после «Редактор» и «HTML» |
| `className` | нет | Дополнительный класс корня |
| `colorScheme` | нет | `auto` (по умолчанию) — тема по настройке системы, `light` или `dark` — всегда эта. Интерфейсу, у которого своя светлая тема (antd), нужен `light` |

Предпросмотр письма, пробная отправка и ключ API Почтаря в редактор не входят: их
делает тот, кто встраивает (ключ API не должен попадать в браузер).

### Условия и развилки

Редактор не знает, откуда данные. Условия рассылки вычисляйте заранее для каждого
получателя и кладите готовым значением в `extraData`: например, `if_own_3` — `да`
или пусто. В письме это `{{#if receiver.extraData.if_own_3}}…{{else}}…{{/if}}`,
а в `fields` — кнопка с понятной подписью «Крупный клиент».

### Сводка по получателям

`stats` считает `collectFieldStats(receivers)` из входа `eterpost-letter-editor/fields`
(без React — годится и для сервера). У сохранённой рассылки Почтаря сводку отдаёт
`GET /mailings/:id/receiver-fields`.

```ts
import { collectFieldStats } from 'eterpost-letter-editor/fields';

const stats = collectFieldStats([
  { email: 'ivan@example.com', name: 'Иван', extraData: { if_own_3: 'да' } }
]);
```

Там же `fieldPlaceholder`, `findTemplateFields`, `checkTemplateFields`.

## Оформление

Все стили — внутри `.le-editor`, на чужой интерфейс они не влияют: ни одного правила
для голых `textarea`, `input` или `button`, так что элементы в своих вкладках
(`extraTabs`) выглядят как у хозяина. Цвета задаются переменными — на `.le-editor`
или на любом элементе выше, порядок подключения CSS неважен:

`--le-bg`, `--le-surface`, `--le-text`, `--le-muted`, `--le-border`, `--le-accent`,
`--le-selected`, `--le-hover`, `--le-pressed`, `--le-warning`, `--le-focus`.

Значения по умолчанию есть для светлой и тёмной темы; тёмная включается настройкой
системы (`prefers-color-scheme`) или `colorScheme="dark"`, а `colorScheme="light"` её
отключает.
Редактор растягивается по высоте, если стоит во flex-контейнере.

## Разработка

```
npm ci
npm test        # сборка и тесты
npm run lint
npm run verify  # dist/ совпадает с исходниками — перед тегом
```

Перед выпуском: версия в `package.json`, запись в `CHANGELOG.md`, `npm run build`,
коммит вместе с `dist/`, тег `vX.Y.Z`.

## Лицензия

AGPL-3.0
