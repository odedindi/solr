import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>
}
const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string
	String: string
	Boolean: boolean
	Int: number
	Float: number
}

export type Planet = {
	__typename?: "Planet"
	/** diameter of the planet */
	diameter: Scalars["Float"]
	/** the order of the planet from the sun */
	id: Scalars["Float"]
	/** length of planet's day in earth hours */
	lengthOfDay: Scalars["Float"]
	/** planet's name */
	name: Scalars["String"]
}

export type Query = {
	__typename?: "Query"
	/** get all planets */
	allPlanets: Array<Planet>
	/** get planet by id */
	planet: Array<Maybe<Planet>>
}

export type QueryPlanetArgs = {
	id: Scalars["Int"]
}

export type AllPlanetsQueryVariables = Exact<{ [key: string]: never }>

export type AllPlanetsQuery = {
	__typename?: "Query"
	allPlanets: Array<{
		__typename?: "Planet"
		id: number
		name: string
		diameter: number
		lengthOfDay: number
	}>
}

export const AllPlanetsDocument = gql`
	query AllPlanets {
		allPlanets {
			id
			name
			diameter
			lengthOfDay
		}
	}
`

/**
 * __useAllPlanetsQuery__
 *
 * To run a query within a React component, call `useAllPlanetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllPlanetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllPlanetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllPlanetsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		AllPlanetsQuery,
		AllPlanetsQueryVariables
	>
) {
	const options = { ...defaultOptions, ...baseOptions }
	return Apollo.useQuery<AllPlanetsQuery, AllPlanetsQueryVariables>(
		AllPlanetsDocument,
		options
	)
}
export function useAllPlanetsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		AllPlanetsQuery,
		AllPlanetsQueryVariables
	>
) {
	const options = { ...defaultOptions, ...baseOptions }
	return Apollo.useLazyQuery<AllPlanetsQuery, AllPlanetsQueryVariables>(
		AllPlanetsDocument,
		options
	)
}
export type AllPlanetsQueryHookResult = ReturnType<typeof useAllPlanetsQuery>
export type AllPlanetsLazyQueryHookResult = ReturnType<
	typeof useAllPlanetsLazyQuery
>
export type AllPlanetsQueryResult = Apollo.QueryResult<
	AllPlanetsQuery,
	AllPlanetsQueryVariables
>
