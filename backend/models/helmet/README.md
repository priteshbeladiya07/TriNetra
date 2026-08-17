# Helmet model (custom weights required)

COCO has no `helmet` / `no_helmet` class, so stock YOLOv8 weights cannot do this.

Train:

```bash
yolo train data=helmet.yaml model=yolov8n.pt epochs=100 imgsz=640
cp runs/detect/train/weights/best.pt backend/models/helmet/best.pt
```

Dataset options: Kaggle "Helmet Detection", Roboflow Universe "helmet-detection".
Verify dataset licences before production use.

Until `best.pt` exists the module reports
`helmet detection unavailable - no custom model loaded` and the UI shows
"⚠ Custom model not loaded" instead of emitting meaningless detections.
