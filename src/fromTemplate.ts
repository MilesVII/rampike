
export function fromTemplateFirst<T extends Element>(template: HTMLTemplateElement) {
	const elements = extractElements(template) as T[];

	return elements[0] ?? null as T | null;
};
export function fromTemplateAll<T extends Element>(template: HTMLTemplateElement) {
	const elements = extractElements(template) as T[];
	return elements;
};

function extractElements(template: HTMLTemplateElement) {
	const contents = template.content.cloneNode(true);
	const elements: Element[] = [];
	contents.childNodes.forEach(node => {
		if (node.nodeType === Node.ELEMENT_NODE)
			elements.push(node as Element);
	});
	return elements;
}
