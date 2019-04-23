import React, { Component } from 'react';
import { HashRouter as Router } from 'react-router-dom'
import { Route, Switch  } from 'react-router'
import { Provider, inject, observer } from 'mobx-react'
import routerList from './views/index'
import './assets/style/common/reset.less'
import Verify from './middleware/Verify/Verify'
import { LocaleProvider } from 'antd'
import 'moment/locale/zh-cn'
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from "moment/moment";

moment.locale('zh-cn');

@inject('store')
@observer
class App extends Component {

  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Provider { ...this.props }>
          <Router>
            <Route render={({ location }) => {
              return(
                [
                  <Switch location={location} key="router">
                    {routerList.map(item => {
                      return(
                        <Route path={item.path} key={item.path} exact={item.exact} component={Verify(item.comp, this.props.store)} />
                      )
                    })}
                  </Switch>
                ]
              )
            }}  />
          </Router>
        </Provider>
      </LocaleProvider>
    );
  }
}

export default App;
