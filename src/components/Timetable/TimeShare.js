/* eslint-disable react/no-string-refs, react/no-find-dom-node */
import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './timetable.scss';
import { arrangeLessonsWithinDay } from '../../utils/modules';
import TimetableBackground from './TimetableBackground';
import TimetableDayRow from './TimetableDayRow';
import TimeRow from './TimeRow';

// Ref: https://github.com/yangshun/nusmods-v3/tree/master/src/js

const minColWidth = 100;
const types = [
  'scroll',
  'mousewheel',
  'DOMMouseScroll',
  'MozMousePixelScroll',
  'resize',
  'touchmove',
  'touchend',
];

class Timeshare extends Component {

  constructor(props) {
    super(props);
    this.state = {
      scrollTopOffset: 0,
    };
  }

  componentDidMount() {
    types.forEach((type) => {
      findDOMNode(this.refs.timetableWrapper)
        .addEventListener(type, this.onScroll.bind(this), false);
    });
  }

  componentWillUnmount() {
    types.forEach((type) => {
      findDOMNode(this.refs.timetableWrapper)
        .removeEventListener(type, this.onScroll.bind(this), false);
    });
  }

  onScroll() {
    this.setState({
      scrollTopOffset: window.scrollY,
    });
  }

  render() {
    const { group } = this.props;
    const members = group.members || [];
    const numCols = members.length || 0;
    const width = window.innerWidth * 0.85;
    const dayRowWidth = (numCols) ? 100 / numCols : 100;
    const style = {};
    const minInnerContainerWidth = minColWidth * numCols;
    if (minInnerContainerWidth > width) {
      style.minWidth = `${minInnerContainerWidth}px`;
    } else {
      style.width = `90%`;
    }

    const headerStyle = {
      marginTop: `${this.state.scrollTopOffset - 40}px`,
    };

    const timetableStyle = {
      width: '100%',
    };

    const nameLabelStyle = {
      textOverflow: `ellipsis`,
      whiteSpace: `nowrap`,
      overflow: `hidden`,
      height: `20px`,
      width: `100%`
    }

    // Massage member's lessons to fit what we need
    let i = 0;
    members.forEach((member) => {
      member.parsedLessons = []; // eslint-disable-line no-param-reassign
      member.timetable.forEach((lesson) => {
        const parsedLesson = _.merge(lesson.module, lesson.module.timetable);
        parsedLesson.colorIndex = i % 8;
        parsedLesson.ModuleCode = parsedLesson.code;
        member.parsedLessons.push(parsedLesson);
      });
      i += 1; // increment color index
    });

    return (
      <div className="timetable-container theme-default">
        <TimeRow />
        <div className="timetable-inner-container" ref="timetableContainer">
          <div className="timetable-inner-wrapper" style={style} ref="timetableWrapper">
            <div className="timetable timetable-header" style={headerStyle}>
              {members.map((member) => {
                const dayLessonRows = arrangeLessonsWithinDay(member.parsedLessons);
                const size = dayLessonRows ? dayLessonRows.length : 1;
                return (
                  <div
                    className="timetable-day"
                    key={member.name}
                    style={{ width: `${dayRowWidth * size}%` }}
                  >
                    <p style={ nameLabelStyle }>{member.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="timetable" style={{ timetableStyle }}>
              { members.map((member) => {
                const dayLessonRows = arrangeLessonsWithinDay(member.parsedLessons);
                const size = dayLessonRows ? dayLessonRows.length : 1;
                return (
                  <TimetableDayRow
                    key={member.name}
                    width={`${dayRowWidth * size}%`}
                    size={size}
                    day={member.name}
                    dayLessonRows={dayLessonRows}
                    onLessonChange={this.props.onLessonChange}
                    isSharing={this.props.isSharing}
                  />
                );
              })
              }
            </div>
            <TimetableBackground />
          </div>
        </div>
      </div>
    );
  }
}

Timeshare.propTypes = {
  lessons: PropTypes.array,
  timetable: PropTypes.object,
  onLessonChange: PropTypes.func,
  group: PropTypes.object,
  isSharing: PropTypes.bool,
};

export default withStyles(s)(Timeshare);
