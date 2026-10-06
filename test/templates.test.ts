import { describe, expect, test } from "bun:test";
import { fromTemplateAll, fromTemplateFirst, htmlTemplate, sprout, tentacles } from "../src/index.ts";

const html = `
	<header data-ref="head"><h1 data-ref="title"></h1></header>
	<form><input data-ref="name"><button data-ref="go"></button></form>
`;

describe("fromTemplate*", () => {
	test("first / all, from template or string", () => {
		const template = htmlTemplate(html);
		expect(fromTemplateFirst(template)?.localName).toBe("header");
		expect(fromTemplateAll(html).map(e => e.localName)).toEqual(["header", "form"]);
		expect(fromTemplateFirst(" text only ")).toBeNull();
	});

	test("clones are independent", () => {
		const template = htmlTemplate(html);
		const a = fromTemplateFirst(template)!;
		a.textContent = "changed";
		expect(fromTemplateFirst(template)!.textContent).toBe("");
	});
});

describe("tentacles", () => {
	test("finds refs across roots, including the roots themselves", () => {
		const roots = fromTemplateAll(html);
		const refs = tentacles(roots, ["head", "title", "name"]);
		expect(refs.head).toBe(roots[0] as HTMLElement);
		expect(refs.title.localName).toBe("h1");
		expect(refs.name.localName).toBe("input");
	});

	test("checks expected classes", () => {
		const roots = fromTemplateAll(html);
		const refs = tentacles(roots, { name: HTMLInputElement, go: HTMLButtonElement });
		expect(refs.name).toBeInstanceOf(HTMLInputElement);
		expect(() => tentacles(roots, { name: HTMLButtonElement })).toThrow(/is <input>, expected HTMLButtonElement/);
	});

	test("throws on missing ref", () => {
		expect(() => tentacles(fromTemplateAll(html), ["nope"])).toThrow(/missing \[data-ref="nope"\]/);
	});

	test("first in document order wins", () => {
		const [root] = fromTemplateAll(`<div><i data-ref="x"></i><b data-ref="x"></b></div>`);
		expect(tentacles(root!, ["x"]).x.localName).toBe("i");
	});

	test("works on any ParentNode", () => {
		document.body.innerHTML = `<p data-ref="p"></p>`;
		expect(tentacles(document, ["p"]).p.localName).toBe("p");
	});
});

describe("sprout", () => {
	test("roots and refs", () => {
		const view = sprout(htmlTemplate(html), { title: HTMLHeadingElement, go: HTMLButtonElement });
		expect(view.root.localName).toBe("header");
		expect(view.roots.length).toBe(2);
		expect(view.root.contains(view.refs.title)).toBe(true);
	});

	test("without schema", () => {
		expect(sprout(`<li></li>`).refs).toEqual({});
	});

	test("throws without root element", () => {
		expect(() => sprout(`just text`)).toThrow(/no root element/);
	});
});
