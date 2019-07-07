import React from 'react';
import './assets/style/common/reset.less'
import { LocaleProvider } from 'antd'
import ANTD_ZH_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment'
import 'moment/locale/zh-cn'
import { Home } from './views'

moment.locale('zh-cn');

class App extends React.Component<{}, {}> {

  render() {
    return(
      <LocaleProvider locale={ANTD_ZH_CN}>
        <Home />
      </LocaleProvider>
    )
  }
}

export default App
