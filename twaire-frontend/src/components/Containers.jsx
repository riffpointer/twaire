import { forwardRef } from "react";
import { Box } from "@mui/material";

export const ContentContainer = forwardRef(function ContentContainer(
  { children, sx = {} },
  ref,
) {
  return (
    <Box ref={ref} sx={{ px: { xs: 2, md: 6 }, ...sx }}>
      {children}
    </Box>
  );
});
