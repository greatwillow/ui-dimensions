
export enum planetNamesEnum {
	VENUS = 'VENUS',
	MARS = 'MARS',
	SATURN = 'SATURN'
}

export type PlanetManagerState = {
	planet: planetNamesEnum
}

export type PlanetManagerReducers = {
	setPlanet: (planet: planetNamesEnum) => PlanetManagerState,
}
