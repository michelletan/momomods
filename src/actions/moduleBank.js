import { API_REQUEST } from '../middlewares/requests-middleware';
import NUSModsApi from '../utils/nusmods-api';

// Ref: https://github.com/yangshun/nusmods-v3/tree/master/src/js

export const FETCH_MODULE_LIST = 'FETCH_MODULE_LIST';
export function fetchModuleList() {
  return (dispatch) => dispatch({
    [API_REQUEST]: {
      type: FETCH_MODULE_LIST,
      payload: {
        method: 'GET',
        url: NUSModsApi.moduleListUrl(),
      },
    },
  });
}

export const FETCH_MODULE = 'FETCH_MODULE';
export function fetchModule(moduleCode) {
  return (dispatch) => dispatch({
    [API_REQUEST]: {
      type: FETCH_MODULE,
      payload: {
        method: 'GET',
        url: NUSModsApi.moduleDetailsUrl(moduleCode),
      },
    },
  });
}

export const LOAD_MODULE = 'LOAD_MODULE';
export function loadModule(moduleCode) {
  return (dispatch, getState) => {
    // Module has been fetched before and cached. Don't have to fetch again.
    if (getState().entities.moduleBank.modules[moduleCode]) {
      return Promise.resolve();
    }

    return dispatch(fetchModule(moduleCode));
  };
}
