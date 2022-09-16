import gql from "graphql-tag"

export const QuerySolarDictionary = gql`
	query SolarDictionary($ids: [Int!], $names: [String!]) {
		solarDictionary(ids: $ids, names: $names) {
			id
			name
			diameter
			lengthOfDay
			dimension
			mass {
				massValue
				massExponent
			}
			gravity
			density
			avgTemp
			composition {
				majorElements {
					abbr
					element
					percentageOfComposition
				}
			}
			textures {
				base
				topo
				specular
				clouds
			}
			orbitalPeriod
			orbitalVelocity
			orbitalInclination
			orbitPositionOffset
			axialTilt
			discoveredBy
			discoveryDate
			alternativeName
			aphelion
			eccentricity
			perihelion
			semimajorAxis
		}
	}
`
