import React from 'react'
import styles from './index.module.less'
import { inject, observer } from 'mobx-react'
import { MyAddonProps } from './index'
import AddonItem from '../AddonItem/AddonItem'
import { ScrollViewFooter } from '../../../components'

@inject('store')
@observer
class MyAddon extends React.Component<MyAddonProps, {}> {

  render() {
    const { myAddonList } = this.props.store!;
    return(
      <div className={styles.myAddonWrapper}>
        <section className={styles.myAddonWrapperInfo}>
          <div>
            {myAddonList.map((item:any, index:number) => <AddonItem rowData={item} key={index + ''} />)}
          </div>
          <ScrollViewFooter />
        </section>
      </div>
    )
  }
}

export default MyAddon;
