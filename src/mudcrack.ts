type GenericObject = Record<string, any>;
type StringKeysAndValuesOnly<T> = {
	[P in keyof T as T[P] extends string | undefined ? (P extends string ? P : never) : never]: T[P];
};

type TagName = keyof HTMLElementTagNameMap;
type DivByDefault<T> = T extends TagName ? HTMLElementTagNameMap[T] : HTMLDivElement;

type Contents = {
	textContent: string
} | {
	children: HTMLElement[]
} | {};

export type CSSProperties = StringKeysAndValuesOnly<Partial<CSSStyleDeclaration>>;

type EventsRecord<E> =
	Partial<
		Record<
			keyof HTMLElementEventMap,
			(
				event: Event,
				element: DivByDefault<E>
			) => void
		>
	>;

type BuildOptions<E> = Partial<{
	elementName: E,
	attributes: GenericObject,
	className: string,
	style: CSSProperties,
	children: HTMLElement[],
	textContent: string,
	events: EventsRecord<E>,
} & Contents>;

function typedKeys<T extends Record<any, any>>(value: T): (keyof T)[]{
	return Object.keys(value);
}

export function mudcrack<ElementType extends TagName | undefined>
	({
		elementName,
		attributes,
		className,
		style,
		children,
		textContent,
		events,
	}: BuildOptions<ElementType> = {}): DivByDefault<ElementType> {
	const el = document.createElement((elementName ?? "div") as TagName) as DivByDefault<ElementType>;

	if (className) el.className = className;
	if (children)
		el.append(...children);
	else if (textContent)
		el.textContent = textContent;
	if (style)
		for (const styleKey of typedKeys(style)){
			if (styleKey.includes("-"))
				el.style.setProperty(styleKey, style[styleKey] ?? null);
			else
				el.style[styleKey] = style[styleKey] ?? "";
		}
	if (attributes)
		for (const attributeKey of Object.keys(attributes))
			el.setAttribute(attributeKey, attributes[attributeKey]);

	if (events)
		for (const eventKey of typedKeys(events))
			el.addEventListener(eventKey, e => events[eventKey]!(e, el));

	return el;
}
