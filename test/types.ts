// compile-time assertions, checked by `tsc --noEmit`
import { mudcrack, sirocco, sprout, tentacles, htmlTemplate } from "../src/index.ts";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function assert<_T extends true>() {}

assert<Equal<ReturnType<typeof mudcrack<undefined>>, HTMLDivElement>>();
const plain = mudcrack({ className: "x" });
assert<Equal<typeof plain, HTMLDivElement>>();
const input = mudcrack({ tagName: "input" });
assert<Equal<typeof input, HTMLInputElement>>();
const custom = mudcrack({ tagName: "my-widget" });
assert<Equal<typeof custom, HTMLElement>>();

mudcrack({
	tagName: "button",
	style: { "--accent": "red", color: "blue" },
	events: {
		click: (event, element) => {
			assert<Equal<typeof event, HTMLElementEventMap["click"]>>();
			assert<Equal<typeof element, HTMLButtonElement>>();
		}
	},
	contents: ["text", mudcrack(), false && mudcrack(), null]
});
// @ts-expect-error unknown camelCase style property
mudcrack({ style: { colour: "red" } });

const s = sirocco(document.createElement("div"), 1, "foo");
assert<Equal<typeof s.foo, number>>();
document.body.append(s);

const listRefs = tentacles(document, ["a", "b"]);
assert<Equal<typeof listRefs, Record<"a" | "b", HTMLElement>>>();
const typedRefs = tentacles(document, { a: HTMLInputElement, b: SVGSVGElement });
assert<Equal<typeof typedRefs.a, HTMLInputElement>>();
assert<Equal<typeof typedRefs.b, SVGSVGElement>>();
// @ts-expect-error unknown ref
typedRefs.c;

const view = sprout(htmlTemplate(""), ["title"]);
assert<Equal<typeof view.refs.title, HTMLElement>>();
const bare = sprout("");
assert<Equal<keyof typeof bare.refs, never>>();
