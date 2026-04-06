# Media Transcoding Pipeline

## Objective
Build a fast, reliable media pipeline that accepts uploaded source files, validates them, transcodes them on GPU-equipped servers, and publishes playback-ready renditions with minimal latency. The pipeline should prioritize predictable output, efficient storage use, and operational simplicity.

## Core Principles
- Optimize for upload-to-playback latency.
- Validate media before expensive processing begins.
- Use GPU acceleration for the heavy transcoding step.
- Preserve source uploads until all derived assets are verified.
- Keep the system observable, retryable, and easy to recover.

## Recommended Architecture

### 1. Ingest
Uploads land in a temporary ingest area and are registered in the database as a pending media job.

- Store the original file immediately.
- Record basic metadata such as uploader, filename, size, and upload time.
- Mark the job as `pending_validation`.

### 2. Validation
Run a lightweight preflight pass before transcoding.

- Confirm file type, container, and extension agreement.
- Probe duration, resolution, frame rate, and audio presence.
- Reject corrupt or unsupported files early.
- Enforce size and duration limits before queueing GPU work.

### 3. Queueing
Send validated jobs to a worker queue rather than transcoding synchronously in the request path.

- Use one queue for validation failures and one for transcode jobs.
- Persist job state transitions in the database.
- Make jobs idempotent so retries do not duplicate outputs.

### 4. GPU Transcoding
Use GPU-accelerated encoding for the main rendition set.

- Prefer hardware encoders such as NVENC or equivalent on the host GPU.
- Generate a small set of standardized renditions, such as 1080p, 720p, and 480p.
- Use fast presets for initial playback readiness.
- Normalize codecs and container settings for browser compatibility.

### 5. Packaging
Package outputs for efficient streaming.

- Produce HLS or DASH manifests.
- Segment outputs consistently for adaptive playback.
- Generate thumbnails and preview sprites as part of the same job.
- Write finalized assets to durable storage only after all outputs succeed.

### 6. Publish
Promote verified outputs to the public media store.

- Atomically switch the video record from `processing` to `ready`.
- Update the video document with rendition paths, thumbnail paths, and metadata.
- Remove temporary artifacts after a successful publish.

## Job State Model

- `uploaded`
- `pending_validation`
- `rejected`
- `queued`
- `transcoding`
- `packaging`
- `ready`
- `failed`

## Validation Rules

- Reject files with unknown or unsafe MIME types.
- Reject files whose container metadata cannot be parsed.
- Reject files with zero duration or invalid timestamps.
- Reject files exceeding configured size or duration thresholds.
- Reject outputs that fail post-transcode verification.

## Storage Layout

- `ingest/` for temporary uploads
- `source/` for preserved originals
- `renditions/` for transcoded outputs
- `thumbnails/` for poster images
- `previews/` for sprite sheets or short previews

## Performance Considerations

- Keep validation CPU-only and fast.
- Use GPU work only after the file passes preflight checks.
- Limit the number of simultaneous transcodes per GPU.
- Prefer a few high-value renditions over an excessive rendition ladder.
- Cache repeated probe results and avoid reprocessing unchanged inputs.

## Reliability Considerations

- Make every job restartable from persisted state.
- Record structured errors for validation, encode, and publish stages.
- Keep source media until derived assets are confirmed healthy.
- Verify output files before marking a job complete.
- Maintain a backup copy of critical database references.

## Backup Strategy

- Back up metadata and job state separately from media blobs.
- Keep versioned backups of database records.
- Replicate finalized media to secondary storage.
- Periodically test restore procedures.

## Operational Metrics

- Upload-to-ready time
- Validation failure rate
- Transcode failure rate
- GPU utilization
- Queue depth
- Storage growth by asset type
- Restore success rate

## Suggested Implementation Order

1. Add job state tracking for uploads.
2. Add preflight validation and rejection rules.
3. Add a worker queue for background processing.
4. Add GPU-accelerated transcode workers.
5. Add packaging and thumbnail generation.
6. Add publish, cleanup, and backup workflows.
7. Add metrics, alerts, and restore verification.

## Outcome
This design keeps the upload path responsive while moving expensive processing out of the request cycle. GPU acceleration reduces processing time, queue-based orchestration improves reliability, and staged validation prevents wasted compute on invalid media.
