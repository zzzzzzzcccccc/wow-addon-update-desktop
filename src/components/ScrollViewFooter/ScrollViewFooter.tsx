import React from 'react'
import { ScrollViewFooterProps } from './index'

class ScrollViewFooter extends React.Component<ScrollViewFooterProps, {}> {
  static defaultProps:ScrollViewFooterProps = {
    children: <span>没有更多了</span>
  };

  render() {
    return(
      <div style={{ width: '100%', backgroundColor: 'rgb(245, 245, 249)', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
        {this.props.children}
      </div>
    )
  }
}

export default ScrollViewFooter;
