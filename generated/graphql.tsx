import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CelestialBody = {
  __typename?: 'CelestialBody';
  /** the body's type */
  bodyType: Scalars['String'];
  /** diameter of the body */
  diameter: Scalars['Float'];
  /** @deprecated m/s^2 */
  gravity: Scalars['Float'];
  id: Scalars['Float'];
  isPlanet: Scalars['Boolean'];
  mass?: Maybe<CelestialBodyMass>;
  /** Body's name */
  name: Scalars['String'];
};

export type CelestialBodyMass = {
  __typename?: 'CelestialBodyMass';
  /** the multiplicative factor */
  massExponent: Scalars['Float'];
  /** multiply the mass value with the mas exponent to get the weight in tons */
  massValue: Scalars['Float'];
};

export type Composition = {
  __typename?: 'Composition';
  majorElements?: Maybe<Array<Maybe<MajorElementsEntity>>>;
};

export type MajorElementsEntity = {
  __typename?: 'MajorElementsEntity';
  abbr: Scalars['String'];
  element: Scalars['String'];
  percentageOfComposition: Scalars['Float'];
};

export type Mass = {
  __typename?: 'Mass';
  massExponent: Scalars['Float'];
  massValue: Scalars['Float'];
};

export type Planet = {
  __typename?: 'Planet';
  /** diameter of the planet */
  diameter: Scalars['Float'];
  /** the order of the planet from the sun */
  id: Scalars['Float'];
  /** length of planet's day in earth hours */
  lengthOfDay: Scalars['Float'];
  /** planet's name */
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  allCelestialBodies: Array<Maybe<CelestialBody>>;
  /** get all planets */
  allPlanets: Array<Planet>;
  /** get planet by id */
  planet: Array<Maybe<Planet>>;
  solarDictionary: Array<Maybe<SolarDictionaryItem>>;
};


export type QueryPlanetArgs = {
  id: Scalars['Int'];
};


export type QuerySolarDictionaryArgs = {
  id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};

export type Rings = {
  __typename?: 'Rings';
  binnerRadius: Scalars['Float'];
  outerRadius?: Maybe<Scalars['Float']>;
  textures?: Maybe<Textures>;
};

export type SolarDictionaryItem = {
  __typename?: 'SolarDictionaryItem';
  alternativeName?: Maybe<Scalars['String']>;
  avgTemp?: Maybe<Scalars['String']>;
  axialTilt?: Maybe<Scalars['Float']>;
  composition?: Maybe<Composition>;
  density?: Maybe<Scalars['Float']>;
  diameter: Scalars['Float'];
  dimension?: Maybe<Scalars['Float']>;
  discoveredBy?: Maybe<Scalars['String']>;
  discoveryDate?: Maybe<Scalars['String']>;
  gravity?: Maybe<Scalars['Float']>;
  id: Scalars['Int'];
  lengthOfDay?: Maybe<Scalars['Float']>;
  mass?: Maybe<Mass>;
  name: Scalars['String'];
  orbitPositionOffset?: Maybe<Scalars['Float']>;
  orbitalInclination?: Maybe<Scalars['Float']>;
  orbitalPeriod?: Maybe<Scalars['Float']>;
  orbitalVelocity?: Maybe<Scalars['Float']>;
  textures?: Maybe<Textures>;
};

export type Textures = {
  __typename?: 'Textures';
  base: Scalars['String'];
  clouds?: Maybe<Scalars['String']>;
  specular?: Maybe<Scalars['String']>;
  topo?: Maybe<Scalars['String']>;
};

export type Vol = {
  __typename?: 'Vol';
  volExponent: Scalars['Float'];
  volValue: Scalars['Float'];
};

export type SolarDictionaryQueryVariables = Exact<{
  id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
}>;


export type SolarDictionaryQuery = { __typename?: 'Query', solarDictionary: Array<{ __typename?: 'SolarDictionaryItem', id: number, name: string, diameter: number, lengthOfDay?: number | null, dimension?: number | null, gravity?: number | null, density?: number | null, avgTemp?: string | null, orbitalPeriod?: number | null, orbitalVelocity?: number | null, orbitalInclination?: number | null, orbitPositionOffset?: number | null, axialTilt?: number | null, discoveredBy?: string | null, discoveryDate?: string | null, alternativeName?: string | null, mass?: { __typename?: 'Mass', massValue: number, massExponent: number } | null, composition?: { __typename?: 'Composition', majorElements?: Array<{ __typename?: 'MajorElementsEntity', abbr: string, element: string, percentageOfComposition: number } | null> | null } | null, textures?: { __typename?: 'Textures', base: string, topo?: string | null, specular?: string | null, clouds?: string | null } | null } | null> };

export type AllPlanetsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPlanetsQuery = { __typename?: 'Query', allPlanets: Array<{ __typename?: 'Planet', id: number, name: string, diameter: number, lengthOfDay: number }> };

export type AllCelestialBodiesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllCelestialBodiesQuery = { __typename?: 'Query', allCelestialBodies: Array<{ __typename?: 'CelestialBody', id: number, name: string } | null> };


export const SolarDictionaryDocument = gql`
    query SolarDictionary($id: Int, $name: String) {
  solarDictionary(id: $id, name: $name) {
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
  }
}
    `;

/**
 * __useSolarDictionaryQuery__
 *
 * To run a query within a React component, call `useSolarDictionaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSolarDictionaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSolarDictionaryQuery({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSolarDictionaryQuery(baseOptions?: Apollo.QueryHookOptions<SolarDictionaryQuery, SolarDictionaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SolarDictionaryQuery, SolarDictionaryQueryVariables>(SolarDictionaryDocument, options);
      }
export function useSolarDictionaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SolarDictionaryQuery, SolarDictionaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SolarDictionaryQuery, SolarDictionaryQueryVariables>(SolarDictionaryDocument, options);
        }
export type SolarDictionaryQueryHookResult = ReturnType<typeof useSolarDictionaryQuery>;
export type SolarDictionaryLazyQueryHookResult = ReturnType<typeof useSolarDictionaryLazyQuery>;
export type SolarDictionaryQueryResult = Apollo.QueryResult<SolarDictionaryQuery, SolarDictionaryQueryVariables>;
export const AllPlanetsDocument = gql`
    query AllPlanets {
  allPlanets {
    id
    name
    diameter
    lengthOfDay
  }
}
    `;

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
export function useAllPlanetsQuery(baseOptions?: Apollo.QueryHookOptions<AllPlanetsQuery, AllPlanetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllPlanetsQuery, AllPlanetsQueryVariables>(AllPlanetsDocument, options);
      }
export function useAllPlanetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllPlanetsQuery, AllPlanetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllPlanetsQuery, AllPlanetsQueryVariables>(AllPlanetsDocument, options);
        }
export type AllPlanetsQueryHookResult = ReturnType<typeof useAllPlanetsQuery>;
export type AllPlanetsLazyQueryHookResult = ReturnType<typeof useAllPlanetsLazyQuery>;
export type AllPlanetsQueryResult = Apollo.QueryResult<AllPlanetsQuery, AllPlanetsQueryVariables>;
export const AllCelestialBodiesDocument = gql`
    query AllCelestialBodies {
  allCelestialBodies {
    id
    name
  }
}
    `;

/**
 * __useAllCelestialBodiesQuery__
 *
 * To run a query within a React component, call `useAllCelestialBodiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllCelestialBodiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllCelestialBodiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllCelestialBodiesQuery(baseOptions?: Apollo.QueryHookOptions<AllCelestialBodiesQuery, AllCelestialBodiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllCelestialBodiesQuery, AllCelestialBodiesQueryVariables>(AllCelestialBodiesDocument, options);
      }
export function useAllCelestialBodiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllCelestialBodiesQuery, AllCelestialBodiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllCelestialBodiesQuery, AllCelestialBodiesQueryVariables>(AllCelestialBodiesDocument, options);
        }
export type AllCelestialBodiesQueryHookResult = ReturnType<typeof useAllCelestialBodiesQuery>;
export type AllCelestialBodiesLazyQueryHookResult = ReturnType<typeof useAllCelestialBodiesLazyQuery>;
export type AllCelestialBodiesQueryResult = Apollo.QueryResult<AllCelestialBodiesQuery, AllCelestialBodiesQueryVariables>;