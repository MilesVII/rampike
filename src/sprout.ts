import { fromTemplateAll } from "./fromTemplate.ts";

type ElementConstructor = abstract new (...args: any) => Element;

// either a list of ref names (all HTMLElement) or a record of ref names to expected element classes
export type RefSchema = readonly string[] | Readonly<Record<string, ElementConstructor>>;

export type Refs<S extends RefSchema> =
	S extends readonly string[]
		? Record<S[number], HTMLElement>
		: { [K in keyof S]: S[K] extends ElementConstructor ? InstanceType<S[K]> : never };

export type Sprout<S extends RefSchema> = {
	// first root element
	root: Element,
	roots: Element[],
	refs: Refs<S>
};

/**
 * Collects `[data-ref]` elements found in (and including) the given roots into a typed record.
 * Throws if a ref is missing or is not an instance of the expected class.
 * If a ref name occurs more than once, the first one in document order wins.
 */
export function tentacles<const S extends RefSchema>(
	scope: ParentNode | readonly ParentNode[],
	schema: S
): Refs<S> {
	const found = new Map<string, Element>();
	const note = (element: Element) => {
		const key = element.getAttribute("data-ref")!;
		if (!found.has(key)) found.set(key, element);
	};
	for (const root of scope instanceof Node ? [scope] : scope) {
		if (root instanceof Element && root.hasAttribute("data-ref")) note(root);
		root.querySelectorAll("[data-ref]").forEach(note);
	}

	const expected: [string, ElementConstructor][] = isRefList(schema)
		? schema.map(key => [key, HTMLElement])
		: Object.entries(schema);

	const refs: Record<string, Element> = {};
	for (const [key, type] of expected) {
		const element = found.get(key);
		if (!element)
			throw new Error(`rampike: missing [data-ref="${key}"]`);
		const tag = element.localName;
		if (!(element instanceof type))
			throw new Error(`rampike: [data-ref="${key}"] is <${tag}>, expected ${type.name}`);
		refs[key] = element;
	}
	return refs as Refs<S>;
}

export function sprout<const S extends RefSchema = readonly []>(
	source: HTMLTemplateElement,
	schema?: S
): Sprout<S> {
	const roots = fromTemplateAll(source);
	const [root] = roots;
	if (!root) throw new Error("rampike: template has no root element");
	return {
		root,
		roots,
		refs: tentacles(roots, schema ?? []) as Refs<S>
	};
}

function isRefList(schema: RefSchema): schema is readonly string[] {
	return Array.isArray(schema);
}
