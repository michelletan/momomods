import _ from 'lodash';
import {
  ADD_MODULE,
  REMOVE_MODULE,

  LOAD_TIMETABLE,
  FETCH_TIMETABLE,

  LOAD_THEME,
} from '../constants';

const defaultThemeState = {
  // Theme is defined in `themes.scss`
  theme: 'default',
  // Mapping of module to color index [0-7]
  colors: {},
};
const NUM_DIFFERENT_COLORS = 8;

// Returns a new index that is not present in the current color index.
// If there are more than NUM_DIFFERENT_COLORS modules already present,
// will try to balance the color distribution.
function getNewColor(currentColorIndices) {
  function generateInitialIndices() {
    return _.range(NUM_DIFFERENT_COLORS);
  }

  let availableColorIndices = generateInitialIndices();
  currentColorIndices.forEach((index) => {
    availableColorIndices = _.without(availableColorIndices, index);
    if (availableColorIndices.length === 0) {
      availableColorIndices = generateInitialIndices();
    }
  });

  return _.sample(availableColorIndices);
}

function colors(state, action) {
  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [action.payload.module.code]: getNewColor(_.values(state)),
      };
    case REMOVE_MODULE:
      return _.omit(state, action.payload.code);
    default:
      return state;
  }
}

const maybeAddNewColorForModuleCode = (state, newState) => (moduleCode) => (
  newState[moduleCode] = state[moduleCode] || getNewColor(_.values(state))
)

function loadTimetableColor(state, action) {
  const newState = {};
  const addColor = maybeAddNewColorForModuleCode(state, newState);
  const timetableModules = (action.payload && action.payload.timetable) || [];
  timetableModules
    .map(tm => tm.ModuleCode)
    .forEach(addColor)

  return {
    ...state,
    ...newState,
  }
}

function fetchTimetableColor(state, action) {
  const newState = {};
  const addColor = maybeAddNewColorForModuleCode(state, newState);
  const timetableModules = (action.payload && action.payload.timetableModules) || [];
  timetableModules
    .map(tm => tm.module && tm.module.code)
    .forEach(addColor)

  return {
    ...state,
    ...newState,
  }
}

function theme(state = defaultThemeState, action) {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
      return {
        ...state,
        colors: colors(state.colors, action),
      };
    case `${FETCH_TIMETABLE}_FULFILLED`:
      return {
        ...state,
        colors: fetchTimetableColor(state.colors, action)
      }
    case `${LOAD_TIMETABLE}_FULFILLED`:
      return {
        ...state,
        colors: loadTimetableColor(state.colors, action)
      }
    case `${LOAD_THEME}_FULFILLED`:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

export default theme;
