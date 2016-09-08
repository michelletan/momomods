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

import s from './Group.css';
import { fetchGroups } from '../../actions/group';

const title = 'Groups';

class Group extends Component {
  componentDidMount() {
    if (!this.props.isInitialized) this.props.fetchGroups();
  }

  render() {
    this.context.setTitle(title);
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{title}</h1>
          <p>...</p>
        </div>
      </div>
    );
  }
}

Group.contextTypes = { setTitle: PropTypes.func.isRequired };

const mapState = (state) => {
  return {
    ...state.group,
  }
}

const mapDispatch = (dispatch) => {
  return {
    fetchGroups: () => dispatch(fetchGroups({}))
  }
}

export default connect(mapState, mapDispatch)(withStyles(s)(Group));
