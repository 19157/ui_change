import { Spin, SpinProps } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

interface SpinLoadingProps extends SpinProps {
  tip?: string;
  size?: "small" | "large" | "default";
}

export type SpinLoadingActionType = {
  openSpinLoading: () => void;
  closeSpinLoading: () => void;
};

const SpinLoadingFunction = forwardRef((props: SpinLoadingProps, ref) => {
  const { tip, size } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    openSpinLoading,
    closeSpinLoading,
  }));

  const openSpinLoading = function <T>() {
    setIsLoading(true);
  };

  const closeSpinLoading = function <T>() {
    setIsLoading(false);
  };

  return (
    <Spin
      tip={tip ? tip : "加载中..."}
      size={size ? size : "large"}
      fullscreen
      spinning={isLoading}
    />
  );
});

SpinLoadingFunction.displayName = "SpinLoadingFunc";

export default SpinLoadingFunction;
