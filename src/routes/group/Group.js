/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';

import GroupToolbar from '../../components/GroupToolbar/GroupToolbar';
import TimetableContainer from '../../components/Timetable/TimetableContainer';

import s from './Group.css';
import { fetchGroups } from '../../actions/group';
import dummyState from './data';

const title = 'Groups';

class Group extends Component {
  static propTypes = {
    isInitialized: PropTypes.bool.isRequired,
    fetchGroups: PropTypes.func.isRequired,
  }

  static contextTypes = {
    setTitle: PropTypes.func.isRequired,
  }

  state = {
    groupShown: null
  }

  componentDidMount() {
    const { year, semester, isInitialized, isLoggedIn } = this.props;
    if (!isInitialized && isLoggedIn) {
      this.props.fetchGroups({ year, semester });
    }
  }

  handleGroupChange = (event, key, groupId) => {
    this.setState({
      groupShown: this.props.data.find(d => d.teamId === groupId)
    });
  }

  handleGroupAdd() {

  }

  handleDateChange(event, date) {
      console.log('date was changed ' + date);
  }

  render() {
    if (!this.props.isLoggedIn) {
      return (
        <div>
          You need to login
        </div>
      )
    }
    this.context.setTitle(title);

    const noGroupContainer = (
      <div className={s.noGroupContainer}>
        <p>You do not have any groups. Create one!</p>
        <img src="http://dl.dropbox.com/s/2fth5ceonfa3iww/group.png?dl=0"/>
      </div>
    );

    return (
      <div>
        <GroupToolbar
          groupShown={this.state.groupShown || this.props.data[0]}
          groups={this.props.data}
          handleGroupChange={this.handleGroupChange}
          handleGroupAdd={this.handleGroupAdd}
          handleDateChange={this.handleDateChange}
        />
        {this.props.data.length > 0 ? <TimetableContainer /> : noGroupContainer }
      </div>
    );
  }
}

const mapState = (state) => {
  return {
    year: state.selection.year,
    semester: state.selection.semester,
    isLoggedIn: !!state.user.data.id,
    ...state.group,
  }
}

const mapDispatch = (dispatch) => ({
  fetchGroups,
});

export default connect(mapState, mapDispatch)(withStyles(s)(Group));
