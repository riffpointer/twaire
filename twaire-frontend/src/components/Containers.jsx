import { Box } from "@mui/material";

export function ContentContainer({ children, sx = {} }) {
  return <Box sx={{ px: { xs: 2, md: 6 }, sx }}>{children}</Box>;
}
