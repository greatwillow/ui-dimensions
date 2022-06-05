import React from 'react'
import renderer from 'react-test-renderer'
import { 
    createDimension, 
    createStore, 
    Provider
} from '../src/index'
import { 
    PlanetManagerReducers,
    PlanetManagerState, 
    planetNamesEnum 
} from './types'

const DIMENSION_STORE_KEY = 'PLANET_MANAGER'
const INITIAL_STATE_PLANET = planetNamesEnum.VENUS


describe("createDimension simple case", () => {
    const store = createStore<PlanetManagerState>({})

    const getInitialState = () => ({
        planet: INITIAL_STATE_PLANET
    })

    const getReducers = () => (state: PlanetManagerState): PlanetManagerReducers => ({
        setPlanet: (planet) => ({
            ...state,
            planet
        })
    })

    const dimension = createDimension({
        dimensionStoreKey: DIMENSION_STORE_KEY,
        initialStateClosure: getInitialState,
        reducersClosure: getReducers,
        asyncActionsClosure: () => ({}),
        selectorsClosure: () => ({}),
        externalDependencies: {},
        store
    })

    const PlanetApp = () => {
        const { planet } = dimension.use()
    
        return (<div>Current planet is: {planet}</div>)
    }

    it('should have proper initial state', () => {
        const { planet } = dimension.store.getState()
        expect(planet).toEqual(INITIAL_STATE_PLANET)
    })

    it("should properly update state", () => {
        const firstUpdatePlanet = planetNamesEnum.MARS
        dimension.reducers.setPlanet(firstUpdatePlanet)
        const { planet } = dimension.store.getState()
        expect(planet).toEqual(firstUpdatePlanet)
    })

    it("should add properly render state", () => {
        const StatefulApp = renderer.create(<Provider store={store}><PlanetApp /></Provider>)

        expect(StatefulApp.toJSON()).toMatchSnapshot()
        renderer.act(() => { dimension.reducers.setPlanet(planetNamesEnum.SATURN) })

        expect(StatefulApp.toJSON()).toMatchSnapshot()

        StatefulApp.unmount()
    })
})