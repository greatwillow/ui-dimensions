import React from 'react'
import renderer from 'react-test-renderer'
import { 
    createBaseDimension, 
    createStore, 
    Provider
} from '../src/index'
import { 
    PlanetManagerReducers,
    PlanetManagerState, 
    planetNamesEnum 
} from './types'

describe("createBaseDimension simple case", () => {
    const DIMENSION_STORE_KEY = 'PLANET_MANAGER'
    const initialStatePlanet = planetNamesEnum.VENUS

    const getInitialState = () => ({
        planet: initialStatePlanet
    })

    const getReducers = () => (state: PlanetManagerState): PlanetManagerReducers => ({
        setPlanet: (planet) => ({
            ...state,
            planet
        })
    })

    const store = createStore<PlanetManagerState>({})

    const dimension = createBaseDimension<PlanetManagerState, PlanetManagerReducers, unknown>(
        DIMENSION_STORE_KEY,
        getInitialState,
        getReducers,
        {},
        store
    )

    it('should have proper initial state', () => {
        const { planet } = dimension.store.getState()
        expect(planet).toEqual(initialStatePlanet)
    })

    const App = () => {
        const { planet } = dimension.use()

        return (<div>Current planet is: {planet}</div>)
    }

    it("should properly update state", () => {
        const firstUpdatePlanet = planetNamesEnum.MARS
        dimension.reducers.setPlanet(firstUpdatePlanet)
        const { planet } = dimension.store.getState()
        expect(planet).toEqual(firstUpdatePlanet)
    })

    it("should add properly render state", () => {
        const StatefulApp = renderer.create(<Provider store={store}><App /></Provider>)

        expect(StatefulApp.toJSON()).toMatchSnapshot()
        renderer.act(() => { dimension.reducers.setPlanet(planetNamesEnum.SATURN) })

        expect(StatefulApp.toJSON()).toMatchSnapshot()

        StatefulApp.unmount()
    })
})