import { forwardRef } from "react";

export const ContentContainer = forwardRef(function ContentContainer(
  { children, className = "", style = {} },
  ref,
) {
  return (
    <div 
      ref={ref} 
      className={`px-3 px-md-5 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});
