import React from 'react'

const Verify = (Comp, store) => {
  return class RealComp extends React.Component {
    render() {
      if (!window.electron) {
        return(
          <div style={{ textAlign: 'center', marginTop: '40px' }}>请使用桌面应用开启:)</div>
        )
      } else {
        return <Comp {...this.props}  />
      }
    }
  }
};

export default Verify;
