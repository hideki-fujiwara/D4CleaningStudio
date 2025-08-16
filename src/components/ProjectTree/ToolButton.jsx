/**
 * ツールバーボタンコンポーネント
 */
import React, { memo } from "react";
import { Button } from "react-aria-components";
import { TOOLBAR_STYLES } from "./constants";

/**
 * ツールバー用ボタンコンポーネント
 */
const ToolButton = memo(function ToolButton({ 
  onPress, 
  icon: IconComponent, 
  iconClass, 
  label, 
  isDisabled = false,
  className = "",
  ...props 
}) {
  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled}
      className={`${TOOLBAR_STYLES.button} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {IconComponent ? (
        <IconComponent className="w-4 h-4" />
      ) : iconClass ? (
        <div className={`w-4 h-4 ${iconClass}`} />
      ) : null}
    </Button>
  );
});

export default ToolButton;
