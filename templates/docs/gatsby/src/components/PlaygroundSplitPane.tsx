import SplitPane from "react-split-pane";
import React from "react";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

interface IProps {
  onChange?: (size: number) => any;
  left: any;
  right: any;
  leftStyle?: CSSProperties;
  rightStyle?: CSSProperties;
  style?: CSSProperties;
  direction?: "horizontal" | "vertical";
  splitLeft?: boolean;
  split?: boolean;
  onlyRenderSplit?: boolean;
}

const PlaygroundSplitPane: React.FC<IProps> = (props) => {

  const handleChange = (size: number) => {
    if (props.onChange) {
      props.onChange(size);
    }
  };

  if ((props.split === false && props.onlyRenderSplit) || (typeof window === 'undefined')) {
    return (
      <div key={2} style={props.splitLeft ? props.leftStyle : props.rightStyle}>
        {typeof window === 'undefined'
          ? props.left
          : props.splitLeft
            ? props.left
            : props.right
        }
      </div>
    );
  }

  const dir = props.direction || "vertical";
  const defaultSize = !props.split
    ? dir === "horizontal" ? window.innerHeight : window.innerWidth
    : dir === "horizontal" ? window.innerHeight / 2 : window.innerWidth / 2;
  return (
    <SplitPane split={dir}
      style={props.style}
      className={"playground-splitview"}
      minSize={100}
      maxSize={0}
      defaultSize={defaultSize}
      size={defaultSize}
      onChange={handleChange}>
      <div style={
        props.leftStyle ? { ...props.leftStyle, ...{ display: "flex", flexDirection: "column", height: "100%" } }
          : { display: "flex", flexDirection: "column", height: "100%" }
      } key={1}>
        {props.left}
      </div>
      <div key={2} style={props.rightStyle}>
        {props.right}
      </div>
    </SplitPane >
  );
};

export default PlaygroundSplitPane;
