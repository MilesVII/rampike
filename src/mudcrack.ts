type StringKeysAndValuesOnly<T> = {
	[P in keyof T as T[P] extends string | undefined ? (P extends string ? P : never) : never]: T[P];
};
type AutocompleteString<T extends string> = T | (string & {});

type TagName = AutocompleteString<keyof HTMLElementTagNameMap>;
type MappedElement<T> = T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element;
type MappedEvent<T> = T extends keyof HTMLElementEventMap ? HTMLElementEventMap[T] : Event;

export type CSSProperties = StringKeysAndValuesOnly<Partial<CSSStyleDeclaration>>;

type EventsRecord<E> = {
	[K in keyof HTMLElementEventMap]?: (event: MappedEvent<K>, element: E) => void
}

type BuildOptions<E> = Partial<{
	tagName: E,
	elementOptions: ElementCreationOptions,
	attributes: Record<string, string>,
	className: string,
	style: CSSProperties,
	events: EventsRecord<MappedElement<E>>,
	contents: string | Element[]
}>;

export function mudcrack<ElementType extends TagName | undefined> (
	{
		tagName,
		elementOptions,
		attributes,
		className,
		style,
		events,
		contents
	}: BuildOptions<ElementType> = {}
): MappedElement<ElementType> {
	const el = document.createElement(tagName ?? "div", elementOptions) as MappedElement<ElementType>;

	if (className) el.className = className;

	if (typeof contents === "string")
		el.textContent = contents;
	else if (Array.isArray(contents))
		el.append(...contents);

	if (style && "style" in el)
		for (const styleKey of typedKeys(style)){
			// if (styleKey.includes("-"))
				el.style.setProperty(styleKey, style[styleKey] ?? null);
			// else
			// 	el.style[styleKey] = style[styleKey] ?? "";
		}
	if (attributes)
		for (const attributeKey of Object.keys(attributes))
			el.setAttribute(attributeKey, attributes[attributeKey]!);

	if (events)
		for (const eventKey of typedKeys(events)) {
			// @ts-ignore
			el.addEventListener(eventKey, e => events[eventKey](e, el));
		}

	return el;
}

function typedKeys<T extends object>(value: T): (keyof T)[] {
	return Object.keys(value) as (keyof T)[];
}
