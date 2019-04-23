import React from 'react'

class ScrollViewFooter extends React.Component {

  render() {
    return(
      <div style={{ width: '100%', backgroundColor: 'rgb(245, 245, 249)', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
        <span>——</span>
        <p>没有更多了</p>
        <span>——</span>
      </div>
    )
  }
}

export default ScrollViewFooter;
