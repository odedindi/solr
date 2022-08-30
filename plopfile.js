const providerPath = "plopTemplates/provider.tsx"
const componentPath = "plopTemplates/component.tsx"
const GSAPAnimation = "plopTemplates/GSAPAnimation.tsx"
const hookPath = "plopTemplates/hook.ts"

/** @type {import('plop').NodePlopAPI} */
module.exports = (plop) => {
	// Components generator
	plop.setGenerator("component", {
		prompts: [{ type: "input", name: "name" }],
		actions: () => {
			const actions = [
				{
					type: "add",
					path: "src/components/{{name}}.tsx",
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
