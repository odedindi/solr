import { getTypedKeys } from "@/lib/getTypedKeys"
import { SolarDictionaryItem } from "generated/graphql"
import * as React from "react"

type Label = { [key: string]: string | number }

export const useGetHUDLabels = (
	entity: SolarDictionaryItem,
	requiredLabels: string[]
) => {
	const labels = React.useMemo(
		() =>
			getTypedKeys(entity)
				.filter((key) => requiredLabels.includes(key.toLowerCase()))
				.map((key) => ({ [key]: entity[key] } as Label)),
		[entity, requiredLabels]
	)

	return labels
}
