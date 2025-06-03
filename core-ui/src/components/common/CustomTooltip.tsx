import { FC, ReactElement, ReactNode } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const CustomTooltip: FC<{
  content: ReactNode;
  children: ReactElement;
}> = ({ content, children }) => {
  const tooltipStyle = {
    backgroundColor: "black",
    color: "white"
  };

  return (
    <Popup
      trigger={children}
      position={["right center"]}
      on={["hover", "focus"]}
      arrow={true}
      arrowStyle={{
        color: "black",
        backgroundColor: "transparent"
      }}
      contentStyle={tooltipStyle}
    >
      {content}
    </Popup>
  );
};

export default CustomTooltip;
