type StringKeysAndValuesOnly<T> = {
	[P in keyof T as T[P] extends string | undefined ? (P extends string ? P : never) : never]: T[P];
};
type AutocompleteString<T extends string> = T | (string & {});

type TagName = AutocompleteString<keyof HTMLElementTagNameMap>;
type MappedElement<T> = T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element;
type MappedEvent<T> = T extends keyof HTMLElementEventMap ? HTMLElementEventMap[T] : Event;
type KnownElements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap];

export type CSSProperties = StringKeysAndValuesOnly<Partial<CSSStyleDeclaration>>;

type EventsRecord<E> = {
	[K in keyof HTMLElementEventMap]?: (event: MappedEvent<K>, element: E) => void
}

type Source<T> = Partial<{
	tagName: T
	elementOptions: ElementCreationOptions,
}>;

type BuildOptions<E> = Partial<{
	attributes: Record<string, string>,
	className: string,
	style: CSSProperties,
	events: EventsRecord<E>,
	contents: string | Element[]
}>;

type MudcrackOptions<E> = BuildOptions<MappedElement<E>> & Source<E>;

export function mudcrack<
	ElementType extends TagName | undefined
> (
	options: MudcrackOptions<ElementType> = {}
): MappedElement<ElementType> {
	const {
		tagName,
		elementOptions
	} = options;
	const el = document.createElement(tagName ?? "div", elementOptions) as MappedElement<ElementType>;
	return soilborne(el, options);
}

export function soilborne<T extends KnownElements | Element>(
	source: T,
	{
		attributes,
		className,
		style,
		events,
		contents
	}: BuildOptions<T> = {}
) {
	if (className) source.className = className;

	if (typeof contents === "string")
		source.textContent = contents;
	else if (Array.isArray(contents))
		source.append(...contents);

	if (style && "style" in source)
		for (const styleKey of typedKeys(style)){
			if (styleKey.includes("-"))
				source.style.setProperty(styleKey, style[styleKey] ?? null);
			else
				source.style[styleKey] = style[styleKey] ?? "";
		}
	if (attributes)
		for (const attributeKey of Object.keys(attributes))
			source.setAttribute(attributeKey, attributes[attributeKey]!);

	if (events)
		for (const eventKey of typedKeys(events)) {
			// @ts-ignore
			source.addEventListener(eventKey, e => events[eventKey](e, el));
		}

	return source;
}

function typedKeys<T extends object>(value: T): (keyof T)[] {
	return Object.keys(value) as (keyof T)[];
}
