import { Box, Button, IconButton, Menu, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

const MoodOutlinedIcon = ({ fontSize, className = "", ...props }) => (
  <Box component="i" className={`bi bi-emoji-smile${fontSize === "small" ? " fs-6" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true" {...props} />
);

const EMOJI_OPTIONS = [
  { symbol: "\u{1F600}", name: "Grinning face" },
  { symbol: "\u{1F602}", name: "Face with tears of joy" },
  { symbol: "\u{1F60D}", name: "Smiling face with heart-eyes" },
  { symbol: "\u{1F973}", name: "Partying face" },
  { symbol: "\u{1F914}", name: "Thinking face" },
  { symbol: "\u{1F60E}", name: "Smiling face with sunglasses" },
  { symbol: "\u{1F62D}", name: "Loudly crying face" },
  { symbol: "\u{1F621}", name: "Pouting face" },
  { symbol: "\u{1F44F}", name: "Clapping hands" },
  { symbol: "\u{1F64C}", name: "Raising hands" },
  { symbol: "\u{1F44D}", name: "Thumbs up" },
  { symbol: "\u{1F44E}", name: "Thumbs down" },
  { symbol: "\u{1F525}", name: "Fire" },
  { symbol: "\u{1F4AF}", name: "Hundred points" },
  { symbol: "\u{2764}\u{FE0F}", name: "Red heart" },
  { symbol: "\u{2728}", name: "Sparkles" },
  { symbol: "\u{1F389}", name: "Party popper" },
  { symbol: "\u{1F91D}", name: "Handshake" },
  { symbol: "\u{1F440}", name: "Eyes" },
  { symbol: "\u{1F64F}", name: "Folded hands" },
  { symbol: "\u{1F605}", name: "Grinning face with sweat" },
  { symbol: "\u{1F92F}", name: "Exploding head" },
  { symbol: "\u{1F972}", name: "Smiling face with hearts" },
  { symbol: "\u{1F480}", name: "Skull" },
];

export default function EmojiPickerButton({ onSelect, disabled = false, buttonSx = {} }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Insert emoji">
        <span>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpen}
            disabled={disabled}
            aria-label="insert emoji"
            sx={{ minWidth: 0, px: 1, ...buttonSx }}
          >
            <MoodOutlinedIcon fontSize="small" />
          </Button>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              p: 1,
              borderRadius: 2,
            },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{ display: "block", px: 0.5, pb: 0.75 }}
        >
          Emojis
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 0.5,
          }}
        >
          {EMOJI_OPTIONS.map(({ symbol, name }) => (
            <Tooltip key={symbol} title={name} placement="top" arrow>
              <IconButton
                size="small"
                onClick={() => {
                  onSelect?.(symbol);
                }}
                sx={{
                  fontSize: 22,
                  borderRadius: 1.5,
                }}
              >
                {symbol}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Menu>
    </>
  );
}
