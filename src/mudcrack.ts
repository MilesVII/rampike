type StringKeysAndValuesOnly<T> = {
	[P in keyof T as T[P] extends string | undefined ? (P extends string ? P : never) : never]: T[P];
};
type AutocompleteString<T extends string> = T | (string & {});

type TagName = AutocompleteString<keyof HTMLElementTagNameMap>;
// no tagName means "div"; unknown tag names (custom elements) are still HTMLElements in an HTML document
type MappedElement<T> =
	T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] :
	T extends undefined ? HTMLDivElement :
	HTMLElement;
type MappedEvent<T> = T extends keyof HTMLElementEventMap ? HTMLElementEventMap[T] : Event;

export type CSSProperties =
	StringKeysAndValuesOnly<Partial<CSSStyleDeclaration>> &
	{ [K in `--${string}`]?: string };

// null removes the attribute, undefined leaves it untouched
export type AttributeValue = string | number | null | undefined;

// null, undefined and false are skipped, so `condition && element` works
export type Child = Node | string | null | undefined | false;

type EventsRecord<E> = {
	[K in keyof HTMLElementEventMap]?: (event: MappedEvent<K>, element: E) => void
};

type Source<T> = Partial<{
	tagName: T
	elementOptions: ElementCreationOptions,
}>;

type BuildOptions<E> = Partial<{
	attributes: Record<string, AttributeValue>,
	className: string,
	style: CSSProperties,
	events: EventsRecord<E>,
	// aborting the signal removes all listeners added from `events`
	signal: AbortSignal,
	contents: string | readonly Child[]
}>;

type MudcrackOptions<E> = BuildOptions<MappedElement<E>> & Source<E>;

export function mudcrack<
	ElementType extends TagName | undefined = undefined
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

export function soilborne<T extends Element>(
	source: T,
	{
		attributes,
		className,
		style,
		events,
		signal,
		contents
	}: BuildOptions<T> = {}
) {
	if (className !== undefined) source.className = className;

	if (typeof contents === "string")
		source.textContent = contents;
	else if (contents)
		source.replaceChildren(...contents.filter(isChild));

	if (style && "style" in source) {
		const declaration = (source as unknown as ElementCSSInlineStyle).style;
		for (const [styleKey, value] of Object.entries(style)) {
			if (styleKey.includes("-"))
				declaration.setProperty(styleKey, value ?? null);
			else
				(declaration as unknown as Record<string, string>)[styleKey] = value ?? "";
		}
	}

	if (attributes)
		for (const [attributeKey, value] of Object.entries(attributes)) {
			if (value === null)
				source.removeAttribute(attributeKey);
			else if (value !== undefined)
				source.setAttribute(attributeKey, String(value));
		}

	if (events)
		for (const eventKey of typedKeys(events)) {
			const handler = events[eventKey] as ((event: Event, element: T) => void) | undefined;
			if (handler)
				source.addEventListener(eventKey, e => handler(e, source), { signal });
		}

	return source;
}

function isChild(child: Child): child is Node | string {
	return child !== null && child !== undefined && child !== false;
}

function typedKeys<T extends object>(value: T): (keyof T)[] {
	return Object.keys(value) as (keyof T)[];
}
