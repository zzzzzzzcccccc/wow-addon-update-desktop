import React from 'react'
import { Motion, StaggeredMotion, spring } from 'react-motion'
import { Tooltip } from 'antd'
import classNames from 'classnames'
import './index.less'

class FloatButton extends React.Component {
  static defaultProps = {
    left: '50%',
    bottom: '0',
    zIndex: 50,
    btnList: [
      {comp: 'one', title: 'one'},
      {comp: 'two', title: 'two'},
      {comp: 'three', title: 'three'}
    ]
  };

  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }

  _onClick = () => {
    this.setState({ active: !this.state.active })
  };

  render() {
    const { left, bottom, zIndex, btnList } = this.props;
    const buttonStyleArr = [];
    btnList.forEach(item => buttonStyleArr.push({ x: -45, o: 0 }));
    return(
      <section className="z-float-button-wrapper" style={{ left, bottom, zIndex }}>
        <ButtonGroup>
          <StaggeredMotion
            defaultStyles={buttonStyleArr}
            styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
              return i === prevInterpolatedStyles.length - 1
                ? {
                  x: spring(this.state.active ? 0 : -45, { stiffness: 330, damping: 20 }),
                  o: spring(this.state.active ? 1 : 0, { stiffness: 330, damping: 20 }),
                } : {
                  x: spring(prevInterpolatedStyles[i + 1].x, { stiffness: 330, damping: 20 }),
                  o: spring(prevInterpolatedStyles[i + 1].o, { stiffness: 330, damping: 20 }),
                };
            })}
          >
            {interpolatingStyles =>
              <ButtonGroup>
                {interpolatingStyles.map((style, i) =>
                  <Button
                    key={i}
                    style={{
                      position: 'relative',
                      bottom: style.x,
                      opacity: style.o,
                      pointerEvents: this.state.active ? 'auto' : 'none',
                    }}
                  >
                    <Tooltip title={btnList[i].title || ''} placement="right">
                      {btnList[i].comp || ''}
                    </Tooltip>
                  </Button>
                )}
              </ButtonGroup>
            }
          </StaggeredMotion>

          <Motion
            defaultStyle={{ s: 0.675 }}
            style={{ s: spring(this.state.active ? 1 : 0.675, { stiffness: 330, damping: 14 }) }}
          >
            {interpolatingStyles =>
              <Button
                className="button--large"
                onClick={this._onClick}
                style={{
                  transform: 'scale(' + interpolatingStyles.s + ')'
                }}
              >
                <span className={this.state.active ? 'icon active' : 'icon'} />
              </Button>
            }
          </Motion>
        </ButtonGroup>
      </section>
    )
  }
}

/**
 * <ButtonGroup />
 */
const ButtonGroup = (props) => <div className="button-group" style={props.style}>{props.children}</div>;

/**
 * <Button />
 */
const Button = (props) => <button className={classNames('button', props.className)} style={props.style} onClick={props.onClick}>{props.children}</button>;


export default FloatButton;
