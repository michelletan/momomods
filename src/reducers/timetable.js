import {
  ADD_MODULE,
  REMOVE_MODULE,
  CHANGE_LESSON,
  CHANGE_TO_LESSON,
  CANCEL_CHANGE_LESSON,

  FETCH_TIMETABLE,
  LOAD_TIMETABLE,
} from '../constants';
import { lessonsForLessonType } from '../utils/timetable';

/* data is a object mapping year, sem to timetable data
 * {
 *   '2016-2017': {
 *     '1': [{timetable_data_1}, {timetable_data_2}],
 *   },
 * }
 */
const defaultState = {
  data: {},
  isFetching: false,
  isInitialized: false,
  lastFetched: null,
  activeLesson: null,
};

const timetableHasModule = (tt, module) => (
  !!tt.find(t => t.ModuleCode === module.code));

export default function timetable(state = defaultState, action) {
  switch (action.type) {
    case `${LOAD_TIMETABLE}_PENDING`:
    case `${FETCH_TIMETABLE}_PENDING`:
      return {
        ...state,
        isFetching: true,
      };
    case `${LOAD_TIMETABLE}_FULFILLED`: {
      const { year, semester } = action.meta;
      const tt = (action.payload && action.payload.timetable);

      // if somehow our local storage is cleared, don't update store
      if (tt === null || typeof tt === 'undefined') {
        return {
          ...state,
          isFetching: false,
          isInitialized: true,
        };
      }

      return {
        ...state,
        data: {
          ...state.data,
          [year]: {
            [semester]: tt,
          },
        },
        isFetching: false,
        isInitialized: true,
        lastLoaded: {
          [year]: {
            [semester]: Date.now(),
          },
        },
      };
    }
    case `${FETCH_TIMETABLE}_FULFILLED`: {
      const { timetableModules, updatedAtS } = action.payload;

      // this could be the first time a user visits,
      // so we have no timetableModule info
      // return normal state, when we save the timetable
      // it will be created in the backend
      if (!timetableModules) return state;

      const updatedAt = (new Date(updatedAtS)).getTime();
      // we wanna sync with the local version
      const { year, semester } = action.meta;
      const lastLoaded = (
        state.lastLoaded
        && state.lastLoaded[year]
        && state.lastLoaded[year][semester]);
      // if local version is newer than the backend, we use the local state
      if (lastLoaded && updatedAt < lastLoaded) {
        return state;
      }

      // otherwise we update state with the backend version
      const ttForDisplayTemp = timetableModules.map(tm => {
        const { classNumber, lessonType, module } = tm;
        const tt = JSON.parse(module.timetable);
        const l = tt.find(t => (
          t.ClassNo === String(classNumber)
          && t.LessonType === lessonType));
        return {
          ...l,
          ModuleCode: module.code,
          ModuleTitle: module.title,
          moduleDetail: module,
        };
      });

      const ttForDisplay = [];

      // for each lesson type, push a class onto timetable
      ttForDisplayTemp.forEach(k => {
        const moduleTimetable = JSON.parse(k.moduleDetail.timetable) || null;
        const lessons = lessonsForLessonType(moduleTimetable, k.LessonType)
          .map(lesson => ({
            ...lesson,
            // Inject module detail in
            moduleDetail: k.moduleDetail,
            ModuleCode: k.ModuleCode,
            ModuleTitle: k.title,
          }));
        // one class can have multiple periods
        const selectedLessons = lessons
          .filter(lesson => (
            // Get all classes from the same class group
            lesson.LessonType === k.LessonType
            && lesson.ClassNo === k.ClassNo
          ));

        selectedLessons.forEach(m => ttForDisplay.push(m));
      });

      console.log('ttForDisplay', ttForDisplay);
      return {
        ...state,
        data: {
          ...state.data,
          [year]: {
            [semester]: ttForDisplay,
          },
        },
        isFetching: false,
        isInitialized: true,
        lastFetched: {
          [year]: {
            [semester]: Date.now(),
          },
        },
      };
    }
    case `${FETCH_TIMETABLE}_REJECTED`:
      return {
        ...state,
        isFetching: false,
        isInitialized: false,
        error: action.payload,
      };
    case `${ADD_MODULE}`: {
      const {
        year,
        semester,
        module,
      } = action.payload;

      const tt = JSON.parse(module.timetable || null);
      // if selected module has no timetable, just pretend it's not added
      if (!tt) return state;

      // ensure timetable data is initialized, it could be null
      // if the user entered the app via the /module route,
      // because we only fetch timetable (and initialize timetable state)
      // when user enters app via /
      const data = {};
      if (state.data[year]) {
        data[year] = state.data[year];
      } else {
        data[year] = {[semester]: []};
      }

      // if module is already in timetable, don't add it
      if (timetableHasModule(data[year][semester], module)) return state;

      const lessonTypeToX = {};
      // each lesson type can have potentially many class no,
      // for simplicity we just get the first lesson of each lesson type first
      tt.forEach(l => (
        lessonTypeToX[l.LessonType] = lessonTypeToX[l.LessonType] || {
          ...l,
          ModuleCode: module.code,
          ModuleTitle: module.title,
          moduleDetail: module,
        }));

      // for each lesson type, push a class onto timetable
      Object.keys(lessonTypeToX).forEach(k => {
        const moduleTimetable = JSON.parse(module.timetable || null);
        const lessons = lessonsForLessonType(moduleTimetable, lessonTypeToX[k].LessonType)
          .map(lesson => ({
            ...lesson,
            // Inject module detail in
            moduleDetail: module,
            ModuleCode: module.code,
            ModuleTitle: module.title,
          }));
        // one class can have multiple periods
        const selectedLesson = lessons
          .filter(lesson => (
            // Get all classes from the same class group
            lesson.LessonType === lessonTypeToX[k].LessonType
            && lesson.ClassNo === lessonTypeToX[k].ClassNo
          ));

        selectedLesson.forEach(m => data[year][semester].push(m));
      });
      return {
        ...state,
        data,
      };
    }
    case `${REMOVE_MODULE}`: {
      const {
        year,
        semester,
        code,
      } = action.payload;

      const newData = state.data[year][semester].filter(m => m.ModuleCode !== code);

      return {
        ...state,
        data: {
          [year]: {
            [semester]: newData,
          },
        },
      };
    }
    case `${CHANGE_TO_LESSON}`: {
      const {
        year,
        semester,
        activeLesson,
      } = action.payload;

      // remove old class
      const data = state.data[year][semester].filter(m =>
        !(m.ModuleCode === state.activeLesson.ModuleCode
          && m.LessonType === state.activeLesson.LessonType)
      );

      const moduleDetail = activeLesson.moduleDetail;
      const ModuleCode = activeLesson.ModuleCode;
      const moduleTimetable = JSON.parse(activeLesson.moduleDetail.timetable || null);
      const lessons = lessonsForLessonType(moduleTimetable, activeLesson.LessonType)
        .map(lesson => (
          // Inject module detail in
          { ...lesson, moduleDetail, ModuleCode }
        ));
      const selectedLesson = lessons
        .filter(lesson => (
          // Get all classes from the same class group
          lesson.ModuleCode === activeLesson.ModuleCode
          && lesson.LessonType === activeLesson.LessonType
          && lesson.ClassNo === activeLesson.ClassNo
        ));

      selectedLesson.forEach(m => data.push(m));
      return {
        ...state,
        data: {
          ...state.data,
          [year]: {
            [semester]: data,
          },
        },
        activeLesson: null,
      };
    }
    case `${CHANGE_LESSON}`: {
      const { activeLesson } = action.payload;

      return {
        ...state,
        activeLesson,
      };
    }
    case `${CANCEL_CHANGE_LESSON}`: {
      return {
        ...state,
        activeLesson: null,
      };
    }
    default:
      return state;
  }
}
