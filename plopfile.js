const providerPath = "plopTemplates/provider.tsx"
const componentPath = "plopTemplates/component.tsx"
const featurePath = "plopTemplates/feature.tsx"
const GSAPAnimation = "plopTemplates/GSAPAnimation.tsx"
const hookPath = "plopTemplates/hook.ts"

/** @type {import('plop').NodePlopAPI} */
module.exports = (plop) => {
	// Feature generator
	plop.setGenerator("feature", {
		prompts: [{ type: "input", name: "module" }],
		actions: () => {
			const actions = [
				{
					type: "add",
					path: "src/features/{{module}}/components/index.tsx",
					templateFile: featurePath,
				},
			]

			return actions
		},
	})

	// Components generator
	plop.setGenerator("component", {
		prompts: [
			{ type: "input", name: "module" },
			{ type: "input", name: "name" },
		],
		actions: () => {
			const actions = [
				{
					type: "add",
					path: "src/features/{{module}}/components/{{name}}.tsx",
					templateFile: componentPath,
				},
			]

			return actions
		},
	})

	// Primitive generator
	plop.setGenerator("primitive", {
		prompts: [{ type: "input", name: "name" }],
		actions: () => {
			const actions = [
				{
					type: "add",
					path: "src/primitives/{{name}}.tsx",
					templateFile: componentPath,
				},
			]

			return actions
		},
	})

	// GSAP Animation generator
	plop.setGenerator("GSAP Animation", {
		prompts: [{ type: "input", name: "name" }],
		actions: () => {
			const actions = [
				{
					type: "add",
					path: "src/GSAPAnimation/{{name}}.tsx",
					templateFile: GSAPAnimation,
				},
			]

			return actions
		},
	})

	// Hook generator
	plop.setGenerator("hook", {
		prompts: [{ type: "input", name: "name" }],
		actions: [
			{
				type: "add",
				path: "src/hooks/use{{name}}.ts",
				templateFile: hookPath,
			},
		],
	})

	// Provider generator
	plop.setGenerator("provider", {
		prompts: [{ type: "input", name: "name" }],
		actions: () => {
			const actions = [
				{
					type: "add",
					path: "src/providers/{{name}}.tsx",
					templateFile: providerPath,
				},
			]

			return actions
		},
	})
}
