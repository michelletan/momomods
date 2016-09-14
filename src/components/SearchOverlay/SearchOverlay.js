import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import ModuleSearch from '../ModuleSearch/ModuleSearch';
import s from './SearchOverlay.css';

class SearchOverlay extends Component {
  shouldComponentUpdate = (nextProps) => (
    (nextProps.shown !== this.props.shown) ||
    (nextProps.semesterModuleList !== this.props.semesterModuleList))

  render() {
    if (!this.props.shown) return null;
    return (
      <div className={s.overlayRoot}>
        <div className={s.overlayContent}>
          <div>
            <IconButton onTouchTap={this.props.hideSearch}>
              <NavigationClose color="white" />
            </IconButton>
          </div>
          <ModuleSearch
            semesterModuleList={this.props.semesterModuleList}
            semesterTimetable={this.props.semesterTimetable}
            addModule={this.props.addModule}
          />
        </div>
        <div className={s.overlayBlock} onClick={this.props.hideSearch} />
      </div>
    );
  }
}

SearchOverlay.propTypes = {
  shown: PropTypes.bool.isRequired,
  hideSearch: PropTypes.func.isRequired,
  semesterModuleList: PropTypes.array.isRequired,
  semesterTimetable: PropTypes.object.isRequired,
  addModule: PropTypes.func.isRequired,
};

export default withStyles(s)(SearchOverlay);