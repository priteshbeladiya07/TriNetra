# Fire / smoke model

**No detection path may classify fire on colour thresholding alone.**

Primary path (required for production): fine-tune YOLOv8 on a fire+smoke dataset
covering vehicle fires, roadside fires and plumes across day/night/rain, and
classify over a rolling 8-16 frame window so flicker frequency and turbulent
motion matter, not a single still frame.

Hard negatives that MUST be in the training and evaluation sets: brake lights,
sodium-vapour streetlights, red vehicles, sunset glare, red banners/flags, and
Holi colour-powder scenes. Report false-positive rate on that hard-negative set
specifically — overall accuracy is not the number that matters.

Fallback heuristic (`fire_backend = "heuristic"`) requires all three of
colour + flicker (1-15 Hz band) + turbulent optical flow to agree for 2+ seconds.
