import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  FormControl,
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import ApiConfig from "../utils/ApiConfig.jsx";

function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editingTag, setEditingTag] = useState({ index: null, text: '' });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Upload video - Twaire";
    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown === 0 && alert?.videoId) {
      navigate(`/watch/${alert.videoId}`);
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, alert, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!file) newErrors.file = "Please select or drop a video file.";
    return newErrors;
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      e.preventDefault();
      handleDeleteTag(tags[tags.length - 1]);
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleEditTagStart = (index, text) => {
    setEditingTag({ index, text });
  };

  const handleEditTagChange = (e) => {
    setEditingTag({ ...editingTag, text: e.target.value });
  };
  
  const handleEditTagSubmit = () => {
    if (editingTag.index !== null) {
      const updatedTags = [...tags];
      const newText = editingTag.text.trim();
      const originalText = tags[editingTag.index];
      
      const isDuplicate = newText !== originalText && tags.includes(newText);
      
      if (newText && !isDuplicate) {
        updatedTags[editingTag.index] = newText;
        setTags(updatedTags);
      } else if (!newText) {
        setTags(updatedTags.filter((_, i) => i !== editingTag.index));
      }
    }
    setEditingTag({ index: null, text: '' });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (tags.length > 0) {
      formData.append("tags", tags.join(','));
    }

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Upload failed";
        setAlert({ type: "danger", message: errMsg });
        return;
      }
      setAlert({
        type: "success",
        message: `Video uploaded successfully! Redirecting in`,
        videoId: data._id,
      });
      setRedirectCountdown(3);
      setDisabled(true);
      setTitle("");
      setDescription("");
      setTags([]);
      setFile(null);
      setThumbnail(null);
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: err.message || "Error uploading video.",
      });
    }
  };
  
  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const videoFile = Array.from(droppedFiles).find(f => f.type.startsWith('video/'));
      if (videoFile) {
        setFile(videoFile);
        setErrors(prev => ({ ...prev, file: null }));
      } else {
        setAlert({ type: "danger", message: "Invalid file type. Please drop a video." });
      }
    }
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload your video!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Make sure the title, description, and tags are correct, because you
          might not be able to edit them later!
        </Typography>
        <Paper
          elevation={2}
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ p: 3 }}
        >
          {alert && (
            <Alert
              severity={alert.type === "danger" ? "error" : alert.type}
              sx={{ mb: 3 }}
              onClose={() => setAlert(null)}
              variant="filled"
            >
              {redirectCountdown === null
                ? alert.message
                : <em>{alert.message}</em>
              }
              {alert.type === "success" && redirectCountdown !== null && (
                <em>
                  <strong> ({redirectCountdown})...</strong>
                </em>
              )}
            </Alert>
          )}

          <TextField
            label="Title"
            fullWidth
            required
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={disabled}
            error={!!errors.title}
            helperText={errors.title}
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder="Give the video a nice description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={disabled}
          />

          <TextField
            label="Tags"
            fullWidth
            margin="normal"
            placeholder={tags.length === 0 ? "e.g., tutorial, react, node" : ""}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            disabled={disabled}
            InputProps={{
              startAdornment: (
                tags.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: "center", flexWrap: 'nowrap', width: "fit-content", overflowX: 'visible', gap: 0.5, p: 0.5 }}>
                    {tags.map((tag, index) => (
                      editingTag.index === index ? (
                        <TextField
                          key={index}
                          value={editingTag.text}
                          onChange={handleEditTagChange}
                          onBlur={handleEditTagSubmit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleEditTagSubmit();
                            }
                          }}
                          autoFocus
                          variant="outlined"
                          size="small"
                          onFocus={(e) => e.stopPropagation()}
                          sx={{
                            '& .MuiInputBase-input': {
                              padding: '4px'
                            }
                          }}
                        />
                      ) : (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleDeleteTag(tag)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTagStart(index, tag);
                          }}
                          size="small"
                        />
                      )
                    ))}
                  </Box>
                )
              ),
            }}
          />

          <FormControl fullWidth margin="normal" error={!!errors.file}>
            <ButtonBase disabled={disabled}>
              <Box
                component="label"
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={handleDragEvents}
                onDrop={handleDrop}
                sx={{
                  border: `2px dashed ${errors.file ? 'red' : grey[600]}`,
                  borderRadius: 2,
                  p: 4,
                  width: "100%",
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? 'action.hover' : 'transparent',
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                      setErrors(prev => ({ ...prev, file: null }));
                    }
                  }}
                  disabled={disabled}
                />
                <CloudUploadIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" component="p">
                  {file ? file.name : "Drag & drop video file here"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select file
                </Typography>
              </Box></ButtonBase>
            {errors.file && <FormHelperText>{errors.file}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Custom thumbnail (optional)
            </Typography>
            <Button variant="outlined" component="label" disabled={disabled}>
              {thumbnail ? thumbnail.name : "Select Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </Button>
          </FormControl>

          <Button
            variant="contained"
            disableElevation
            color="primary"
            type="submit"
            disabled={disabled}
            title="Click to upload!"
            sx={{ mt: 2 }}
          >
            Upload
          </Button>
        </Paper>
      </Container>
    </>
  );
}

export default Upload;

