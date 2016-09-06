/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Header from 'react-mdl/lib/Layout/Header';
import Layout from 'react-mdl/lib/Layout/Layout';
import React, { Component, PropTypes } from 'react';
import Textfield from 'react-mdl/lib/TextField'
import { connect } from 'react-redux'
import emptyFunction from 'fbjs/lib/emptyFunction';
import { Provider } from 'react-redux';

import s from './App.css';
import Drawer from '../Drawer';
import Feedback from '../Feedback';
import Footer from '../Footer';
import Navigation from 'react-mdl/lib/Layout/Navigation';

class App extends Component {

  static propTypes = {
    context: PropTypes.shape({
      createHref: PropTypes.func.isRequired,
      store: PropTypes.object.isRequired,
      insertCss: PropTypes.func,
      setTitle: PropTypes.func,
      setMeta: PropTypes.func,
    }).isRequired,
    children: PropTypes.element.isRequired,
    error: PropTypes.object,
  };

  static childContextTypes = {
    createHref: PropTypes.func.isRequired,
    insertCss: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired,
    setMeta: PropTypes.func.isRequired,
  };

  getChildContext() {
    const context = this.props.context;
    return {
      createHref: context.createHref,
      insertCss: context.insertCss || emptyFunction,
      setTitle: context.setTitle || emptyFunction,
      setMeta: context.setMeta || emptyFunction,
    };
  }

  componentWillMount() {
    const { insertCss } = this.props.context;
    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    if (this.props.error) {
      return this.props.children;
    }

    const store = this.props.context.store;
    return (
      <Provider store={store}>
        <div>
          <Layout fixedHeader>
            <Header title="MoMoMods">
              <Navigation>
                  <Textfield
                    onChange={() => {}}
                    label=""
                    expandable
                    expandableIcon="search"
                  />
              </Navigation>
            </Header>
            <Drawer />
            {this.props.children}
            <Feedback />
            <Footer />
          </Layout>
        </div>
      </Provider>
    );
  }

}

export default App;
