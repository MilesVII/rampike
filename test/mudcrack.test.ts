import { describe, expect, test, mock } from "bun:test";
import { mudcrack, soilborne } from "../src/index.ts";

describe("mudcrack", () => {
	test("defaults to div", () => {
		expect(mudcrack().tagName).toBe("DIV");
	});

	test("sets class, text, attributes", () => {
		const el = mudcrack({
			tagName: "button",
			className: "a b",
			contents: "hi",
			attributes: { type: "button", tabindex: 2, skipped: undefined }
		});
		expect(el.className).toBe("a b");
		expect(el.textContent).toBe("hi");
		expect(el.getAttribute("type")).toBe("button");
		expect(el.getAttribute("tabindex")).toBe("2");
		expect(el.hasAttribute("skipped")).toBe(false);
	});

	test("mixed children, falsy ones skipped", () => {
		const b = mudcrack({ tagName: "b", contents: "x" });
		const el = mudcrack({ contents: ["a ", b, null, undefined, false, document.createTextNode(" c")] });
		expect(el.innerHTML).toBe("a <b>x</b> c");
	});

	test("styles: camelCase, kebab-case and custom properties", () => {
		const el = mudcrack({ style: { backgroundColor: "red", "--accent": "blue" } });
		expect(el.style.backgroundColor).toBe("red");
		expect(el.style.getPropertyValue("--accent")).toBe("blue");
	});

	test("events receive event and element; signal removes them", () => {
		const controller = new AbortController();
		const handler = mock((_e: MouseEvent, _el: HTMLButtonElement) => {});
		const el = mudcrack({ tagName: "button", events: { click: handler }, signal: controller.signal });
		el.click();
		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler.mock.calls[0]![1]).toBe(el);
		controller.abort();
		el.click();
		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe("soilborne", () => {
	test("contents array replaces children", () => {
		const el = mudcrack({ contents: [mudcrack()] });
		soilborne(el, { contents: [mudcrack({ tagName: "span" })] });
		soilborne(el, { contents: [mudcrack({ tagName: "span" })] });
		expect(el.children.length).toBe(1);
	});

	test("empty className clears it, null removes attribute", () => {
		const el = mudcrack({ className: "x", attributes: { disabled: "" } });
		soilborne(el, { className: "", attributes: { disabled: null } });
		expect(el.className).toBe("");
		expect(el.hasAttribute("disabled")).toBe(false);
	});

	test("unspecified options are left untouched", () => {
		const el = mudcrack({ className: "x", contents: "text" });
		soilborne(el, { attributes: { id: "y" } });
		expect(el.className).toBe("x");
		expect(el.textContent).toBe("text");
	});
});
