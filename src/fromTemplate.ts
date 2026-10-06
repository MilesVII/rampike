
export function htmlTemplate(html: string) {
	const template = document.createElement("template");
	template.innerHTML = html;
	return template;
}

export function fromTemplateFirst<T extends Element>(source: HTMLTemplateElement) {
	const first = source.content.firstElementChild;
	// importNode, unlike cloneNode, upgrades custom elements right away
	return first ? document.importNode(first, true) as unknown as T : null;
};
export function fromTemplateAll<T extends Element>(source: HTMLTemplateElement) {
	const contents = document.importNode(source.content, true);
	return Array.from(contents.children) as unknown as T[];
};
