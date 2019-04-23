import React from 'react'
import AddonItem from '../AddonItem/AddonItem'
import { List } from 'antd'
import { ScrollViewFooter } from '../../../components';
import './index.less'
import myAddon from '../../../utils/myAddon'

class MyAddonDrawerInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataList: []
    }
  }

  getDataList = () => {
    this.setState({ dataList: myAddon.getAddonList() })
  };

  onDelete = (rowData) => {
    this.setState({ dataList: this.state.dataList.filter(addon => addon.path !== rowData.path) });
    if (this.props.onDelete) {
      this.props.onDelete(rowData)
    }
  };

  componentDidMount() {
    this.getDataList();
  }

  render() {
    const { dataList } = this.state;
    return(
      <div className="my-addon-wrapper">
        <section className="my-addon-wrapper-info">
          <List className="my-addon-wrapper-info-list">
            {dataList.map((item, index) => {
              return(
                <AddonItem renderType={1}
                           rowIndex={index}
                           onDelete={(rowData) => this.onDelete(rowData)}
                           rowData={item}
                           key={index} />
              )
            })}
          </List>
          <ScrollViewFooter />
        </section>
      </div>
    )
  }
}

export default MyAddonDrawerInfo;
