
export type Rampike<Root, Params> = Root & {
	rampike: {
		params: Params,
		render: () => void
	}
};

type RampikeOptions = {
	skipInitialRender: boolean
};
const defaultOptions: RampikeOptions = {
	skipInitialRender: false
}

export function rampike<Root, Params>(
	source: Root,
	params: Params,
	render: (params: Params, root: Rampike<Root, Params>) => void,
	options?: Partial<RampikeOptions>
) {
	const {
		skipInitialRender
	} = {
		...defaultOptions,
		...options
	};

	const root = source as Rampike<Root, Params>;
	root.rampike = {
		params,
		render: () => render(root.rampike.params, root)
	};
	if (!skipInitialRender) root.rampike.render();

	return root;
}
