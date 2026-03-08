export type Sirocco<Root, T, FieldName extends string> = Omit<Root, FieldName> & { [K in FieldName]: T }

export function sirocco<Root, T, FieldName extends string = "rampike">(
	source: Root,
	value: T,
	fieldname?: FieldName
) {
	const root = source as Sirocco<Root, T, FieldName>;
	const name = (fieldname ?? "rampike") as FieldName;
	(root as Record<FieldName, T>)[name] = value;
	return root;
}
