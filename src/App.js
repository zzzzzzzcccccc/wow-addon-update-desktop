import React, { Component } from 'react';
import { Provider, inject, observer } from 'mobx-react'
import './assets/style/common/reset.less'
import { LocaleProvider } from 'antd'
import 'moment/locale/zh-cn'
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from "moment/moment";
import Home from './views/Home/Home'

moment.locale('zh-cn');

@inject('store')
@observer
class App extends Component {

  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Provider { ...this.props }>
          <Home />
        </Provider>
      </LocaleProvider>
    );
  }
}

export default App;
