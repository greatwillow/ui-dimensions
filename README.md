# <a href='https://github.com/'><img src='https://rascto.ca/sites/default/files/styles/featuredimg/public/M020_LRGB_final_MtLemmon.jpg?itok=mqvzkXlz' style="margin: 20px auto; display: block; width: 100%;" alt='Redux String Theory' aria-label='redux-string-theory' /></a>

# redux-string-theory


## Summary

The state of state-management within the React ecosystem is vast and many good solutions have pushed our paradigms.  Amongst these, it is hard to deny the impact that Redux has had, and how fundamentally, despite its faults, it has stood the test of time for its strengths.

Working with Redux can involve excessive boilerplate and an over-complication of simple work-flows.  At the same time, ironically Redux or variations thereof have been popular choices for apps that must be able to scale.  

Taking into consideration these observations, it's clear that the community has sought a happy medium where we can take advantage of the strengths of Redux while reducing or eliminating it's complicated usage.  


## Usage

### Installation

```
npm install redux-string-theory
```

### Base Usage

The following example demonstrates the primary simple use-case for string-theory where we create a state dimension with ```createBaseDimension()``` and then use it in the following React code.  This shows how string-theory achieves the common functionality that Redux provides in a much more condensed and simple way. 

An added feature here, however, is that by wrapping our initial state, and reducers within a set of closures, string-theory is able to provide a set of given dependencies to each of these functions.  

Although it is typically sufficient to use import statements in the code-base, there are certain cases where this form of dependency injection can by advantageous, and at a minimum can simplify testing while removing the need for extra import statements throughout different files.


``` js

const dimensionStoreKey = 'spaceVoyageManager'

const externalDependencies = {
    api: spaceVoyagerApi,
    translations: spaceVoyagerTranslations,
}

const initialStateClosure = ({ translations }) => {
    const initialState = {
        missionObjective: translations.discoverNewPlanets,
        discoveryCount: 0,
        voyages: [],
    }

    return initialState
}

const reducersClosure = ({ translations }) => (state) => {
    const reducers = {
        modifyMissionObjective: (missionObjective) => { ...state, missionObjective },
        setVoyages: (voyages) => { ...state, voyages },
        addVoyage: (voyage) => { 
            ...state, 
            discoveryCount: state.disoveryCount + (voyage.discoveryMade ? 1 : 0),
            voyages: [...state.voyages, voyage] 
        },
    }

    return reducers
}

// Create a dimension of state in our app to be used in UI
const dimension = createBaseDimension({
                        dimensionStoreKey,
                        initialStateClosure,
                        reducersClosure,
                        externalDependencies,
                    })

// Our React Component consuming the above created dimension
const SpaceVoyageManager = () => {
    const { 
        missionObjective,
        discoveryCount,
        voyages
    } = dimension.use()

    const addDiscoveryVoyage = () => {
        dimension.reducers.addVoyage({ discoveryMade: true })
    }

    return (
        <div>
            <h1>Space Voyage Manager of mission: {missionObjective}
            <h3>{discoveryCount} discoveries made on {voyages.length} voyages.<h3>
            <button type="submit">{addDiscoveryVoyage}</button>
        </div>
    )
}
```

From the above example, we have the following observations.

1. ```createBaseDimension``` takes in:
- A dimension store key acting as an identifier for the dimension in the overall store.
- An external dependencies object.
- Closures defining initial state and reducers with access to the passed in external dependencies object.

2. We see that the returned ```dimension``` object contains:
- A function called ```use``` which reactively selects state from our state store.  This uses Redux' useSelector hook under the surface.
- An object called ```reducers``` simply providing access to our defined reducers.  The dispatch of actions is abstracted away here providing an explicit one to one relationship between reducers and actions.  Pragmatically, this is almost always the desired case.  Function composition can readily replace any cases where it is intended to have one 'action' trigger multiple reducer changes.


### Full Usage
We can add more interesting functionality throught the use of ```createStringTheoryDimension```

``` js
const asyncActionsClosure = ({ api, dimension }) => {
    const asyncActions = {
        getVoyages: () => api.getVoyages().then((voyages) => dimension.setVoyages(voyages)),
        addVoyage: (voyage) => api.addVoyage(voyage)
    }

    return asyncActions
}


const dimension = createStringTheoryDimension({
                                dimensionStoreKey,
                                initialStateClosure,
                                reducersClosure,
                                selectorsClosure,
                                asyncActionsClosure,
                                customHooksClosure,
                                externalDependencies,
                            })
```






