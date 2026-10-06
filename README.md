<p align="center">
	<img width="180" src="https://github.com/milesvii/rampike/blob/master/logo.svg?raw=true" alt="rampike logo">
</p>

# rampike

*Non-reactive vanilla typed JS framework*

Actually, a `document.createElement()` wrapper bundled with utilities for attaching objects to elements and cloning elements from templates

No dependencies btw

## Features and usage

### rampike
Attaches an object (or any other value) and a render function to an Element, returns the same element with `rampike` property added

```ts
// Create or retrieve an element via querySelector
const element = document.createElement("div");

// Create params variable
const props = {
	counter: 0,
	caption: "uhhh"
};
// Attach params and render function to the element
// Render function is called on init (can be skipped by providing options)
const rampikeElement = rampike(
	element, props,
	(params, root) => {
	root.textContent = `${params.caption} ${params.counter}`;
});
// rampikeElement can be put into DOM directly
document.body.append(rampikeElement);

// ...

rampikeElement.addEventListener("click", () => {
	// Params can be updated by accessing .rampike.params
	rampikeElement.rampike.params.counter += 1;
	// OR by changing the original variable, since it is attached as is
	props.counter += 1;
	// Render function should be called explicitly after update
	rampikeElement.rampike.render();
});
```

In theory, it is possible to make params changes to trigger update in a very primitive way by using [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

### mudcrack
Creates a new element while setting properties like events, attributes, styles, classes and more in a single call
#### Before (cringe):
```ts
const description = document.createElement("div");
description.className = "device-ritual-description";
description.textContent = ritual.desc;
document.body.append(description);

const time = document.createElement("div");
time.textContent = `every ${ritual.days} days`;
document.body.append(time);

const remove = document.createElement("button");
remove.className = "strip-defaults butt-on";
remove.addEventListener("click", removeCB);
remove.textContent = "remove"
document.body.append(remove);
```

#### After (based):
```ts
document.body.append(
	mudcrack({
		tagName: "div",
		className: "device-ritual-description",
		contents: ritual.desc
	}),
	mudcrack({
		tagName: "div",
		contents: `every ${ritual.days} days`
	}),
	mudcrack({
		tagName: "button",
		className: "strip-defaults butt-on",
		contents: "remove",
		events: {
			"click": removeCB
		}
	})
);
```

Available parameters:
```ts
type Params = {
	tagName: E,
	elementOptions: ElementCreationOptions,
	// null removes the attribute, undefined leaves it as is
	attributes: Record<string, string | number | null | undefined>,
	className: string,
	// camelCase properties, kebab-case properties and custom properties like "--accent"
	style: CSSProperties,
	// handlers get (event, element)
	events: EventsRecord,
	// aborting it removes all listeners added via `events`
	signal: AbortSignal,
	// either textContent value or children; null, undefined and false children are skipped
	contents: string | (Node | string | null | undefined | false)[],
}
```

All parameters are optional. `tagName` is `div` by default

### soilborne
Same as `mudcrack`, but takes an already created element, overwriting specified properties (`contents` replaces existing children)

### sirocco
Generic version of `rampike()`. Simply attaches a value to an object while updating the type
```ts
const augmented = sirocco([0], 0, "map");
console.log(typeof augmented.map); // number
```

### fromTemplateFirst and fromTemplateAll
Helpers for cloning element nodes from `template` element, [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template)

```ts
const template = document.querySelector<HTMLTemplateElement>("template#template-id")!;
const element = fromTemplateFirst(template);
const [title, body] = fromTemplateAll(template);
```

```ts
import itemHtml from "./item.html?raw"; // or any other way to get html as a string

const itemTemplate = htmlTemplate(itemHtml); // module level, parsed once
const item = fromTemplateFirst(itemTemplate);
```

### tentacles
`tentacles` collects `[data-ref]` elements into a typed record, searching the given roots and their descendants. It throws if a ref is missing or has an unexpected type; if a name occurs more than once, the first one in document order wins

```ts
const refs = tentacles(document, ["title", "body"]); // Record<"title" | "body", HTMLElement>
const typed = tentacles(form, { name: HTMLInputElement, icon: SVGSVGElement }); // checked with instanceof
```

### sprout 

`sprout` clones every root element of a template and collects its refs in one go

```html
<li data-ref="item">
	<span data-ref="title"></span>
	<button data-ref="remove">remove</button>
</li>
```

```ts
const itemTemplate = htmlTemplate(itemHtml);

function itemView(item: Item) {
	const { root, roots, refs } = sprout(itemTemplate, {
		item: HTMLLIElement,
		title: HTMLSpanElement,
		remove: HTMLButtonElement
	});
	refs.title.textContent = item.title;
	soilborne(refs.remove, { events: { click: () => removeItem(item) } });
	return root; // first root element; `roots` has all of them
}
```

Refs of nested views are visible too, so give them distinct names if one template is inserted into another before collecting

## Reference
All functions are fully typed and self-documented, please consult the sources for other details

## Credits
[The tree clipart used as reference](https://creazilla.com/media/clipart/15591080/dead-tree)

## Yapping
Reactive frameworks were a mistake. Reactivity is effective for state management when used with libraries like [Jotai](https://jotai.org/), but delegating updating the DOM to a big black box leads to unnecessary complexity which leads to bugs and even performance issues. It **is** faster to develop that way and thus it is commercially effective to use frameworks like Vue or React, but it's not fun and requires advanced expertise with specific frameworks instead of more general skills and knowledge

These tools, while proving themselves useful when working on small project like WebExtension views and small apps, are not meant to replace other JS frameworks. The idea is to experiment with DOM manipulation approaches and have fun, hence the silly names