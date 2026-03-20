
import React, { useRef, useEffect, useState } from 'react';
import { Rect, Circle, Text, Image as KonvaImage, Transformer, Star, RegularPolygon, Group, Path, Arrow } from 'react-konva';
import { Layer, LayerType, ImageLayer, TextLayer, ShapeLayer, Page, GroupLayer } from '../../types';
import { useVideo } from '../../hooks/useVideo';
import Konva from 'konva';
import { getEffectConfig } from '../../constants/videoEffects';

interface Props {
  layer: Layer;
  isSelected: boolean;
  onSelect: (id: string, isMulti: boolean) => void;
  onChange: (newAttrs: Partial<Layer>) => void;
  page: Page;
  onDragMove?: (guides: { x?: number, y?: number } | null) => void;
  onEditingChange?: (isEditing: boolean) => void;
  onRegister?: (id: string, node: any) => void;
  isGroupChild?: boolean;
  requestCacheUpdate?: () => void;
}

const SNAP_THRESHOLD = 5;

const CanvasElement: React.FC<Props> = ({
  layer,
  isSelected,
  onSelect,
  onChange,
  page,
  onDragMove,
  onEditingChange,
  onRegister,
  isGroupChild = false,
  requestCacheUpdate
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');

  const isVideo = layer.type === LayerType.IMAGE && (layer as ImageLayer).mediaType === 'video';
  const isImage = layer.type === LayerType.IMAGE && (layer as ImageLayer).mediaType === 'image';

  /* --- VIDEO ELEMENT HANDLING --- */
  const videoElement = isVideo
    ? useVideo(
      (layer as ImageLayer).src,
      (layer as ImageLayer).playing,
      (layer as ImageLayer).loop,
      (layer as ImageLayer).volume,
      (layer as ImageLayer).currentTime
    )
    : null;

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isImage) {
      // Strategy: Try loading with CORS first (required for export).
      // If that fails (Supabase bucket not configured), fall back to non-CORS (visible but taints canvas).
      const img = new window.Image();
      const originalSrc = (layer as ImageLayer).src;

      const isBlob = originalSrc.startsWith('blob:');

      // CRITICAL FIX: Chrome fails if crossOrigin is set on a blob: URL
      if (!isBlob) {
        img.crossOrigin = 'Anonymous';
      }

      const separator = originalSrc.includes('?') ? '&' : '?';
      // For blobs, we don't need cache busting (it's a unique local URL)
      img.src = isBlob ? originalSrc : `${originalSrc}${separator}t=${Date.now()}`;

      img.onload = () => {
        setImageElement(img);
        if (requestCacheUpdate) requestCacheUpdate();
      };

      img.onerror = () => {
        // Fallback: Load without CORS
        console.warn(`Failed to load image with CORS: ${originalSrc}. Falling back to non-CORS mode (Export may fail).`);
        const fallbackImg = new window.Image();
        fallbackImg.src = originalSrc;
        fallbackImg.onload = () => {
          setImageElement(fallbackImg);
          if (requestCacheUpdate) requestCacheUpdate();
        };
      };
    } else {
      setImageElement(null);
    }
  }, [isImage, (layer as ImageLayer).src, requestCacheUpdate]);

  // Video filter logic removed to improve stability
  useEffect(() => {
    if (videoElement && shapeRef.current) {
      const node = shapeRef.current;
      const layerNode = node.getLayer();
      if (!layerNode) return;

      // We need an animation loop to redraw the layer every frame so the video updates.
      // Without this, the video plays in memory but the canvas stays static.
      const anim = new Konva.Animation(() => {
        // No custom logic needed here, just the existence of the anim on the layer triggers redraws.
      }, layerNode);

      anim.start();
      return () => {
        anim.stop();
      };
    }
  }, [videoElement]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing && !layer.locked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing, layer.locked]);

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!onDragMove) return;
    const node = e.target;
    // ... existing logic ...
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const centerX = node.x() + (node.width() * scaleX) / 2;
    const centerY = node.y() + (node.height() * scaleY) / 2;
    const right = node.x() + (node.width() * scaleX);
    const bottom = node.y() + (node.height() * scaleY);

    const guides: { x?: number, y?: number } = {};
    let snappedX: number | null = null;
    let snappedY: number | null = null;

    const vPoints = [0, page.width / 2, page.width];
    page.layers.forEach(l => { if (l.id !== layer.id) vPoints.push(l.x, l.x + l.width / 2, l.x + l.width); });

    for (const point of vPoints) {
      if (Math.abs(node.x() - point) < SNAP_THRESHOLD) { snappedX = point; guides.x = point; break; }
      if (Math.abs(centerX - point) < SNAP_THRESHOLD) { snappedX = point - (node.width() * scaleX) / 2; guides.x = point; break; }
      if (Math.abs(right - point) < SNAP_THRESHOLD) { snappedX = point - (node.width() * scaleX); guides.x = point; break; }
    }

    const hPoints = [0, page.height / 2, page.height];
    page.layers.forEach(l => { if (l.id !== layer.id) hPoints.push(l.y, l.y + l.height / 2, l.y + l.height); });

    for (const point of hPoints) {
      if (Math.abs(node.y() - point) < SNAP_THRESHOLD) { snappedY = point; guides.y = point; break; }
      if (Math.abs(centerY - point) < SNAP_THRESHOLD) { snappedY = point - (node.height() * scaleY) / 2; guides.y = point; break; }
      if (Math.abs(bottom - point) < SNAP_THRESHOLD) { snappedY = point - (node.height() * scaleY); guides.y = point; break; }
    }

    if (snappedX !== null) node.x(snappedX);
    if (snappedY !== null) node.y(snappedY);
    onDragMove(Object.keys(guides).length > 0 ? guides : null);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (onDragMove) onDragMove(null);
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newAttrs: Partial<Layer> = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      rotation: node.rotation(),
    };
    if (layer.type !== LayerType.TEXT) { newAttrs.height = Math.max(5, node.height() * scaleY); }
    onChange(newAttrs);
  };

  const handleEditTrigger = () => {
    if (layer.type === LayerType.TEXT && !layer.locked) {
      const textValue = (layer as TextLayer).text;
      setEditingValue(textValue);
      setIsEditing(true);
      if (onEditingChange) onEditingChange(true);
    }
  };

  const handleTextEditComplete = (newValue: string) => {
    setIsEditing(false);
    if (onEditingChange) onEditingChange(false);
    onChange({ text: newValue } as Partial<TextLayer>);
  };

  useEffect(() => {
    if (onRegister && layer.id) {
      onRegister(layer.id, shapeRef.current);
    }
  }, [layer.id, onRegister]);


  useEffect(() => {
    if (isEditing && shapeRef.current) {
      const textNode = shapeRef.current;
      const stage = textNode.getStage();
      const container = stage.container();

      const area = document.createElement('textarea');
      container.appendChild(area);

      const absPos = textNode.getAbsolutePosition();
      const stageBox = container.getBoundingClientRect();

      area.value = editingValue;
      area.style.position = 'absolute';
      area.style.top = `${absPos.y}px`;
      area.style.left = `${absPos.x}px`;
      area.style.width = `${textNode.width() * textNode.scaleX()}px`;
      area.style.height = `${textNode.height() * textNode.scaleY() + 20}px`;
      area.style.fontSize = `${(layer as TextLayer).fontSize * stage.scaleX()}px`;
      area.style.border = 'none';
      area.style.padding = '0px';
      area.style.margin = '0px';
      area.style.background = 'none';
      area.style.outline = 'none';
      area.style.color = (layer as TextLayer).fill;
      area.style.fontFamily = (layer as TextLayer).fontFamily;
      area.style.fontWeight = (layer as TextLayer).fontWeight;
      area.style.textAlign = (layer as TextLayer).align;
      area.style.lineHeight = String((layer as TextLayer).lineHeight);
      area.style.letterSpacing = `${(layer as TextLayer).letterSpacing}px`;
      area.style.transformOrigin = '0 0';
      area.style.transform = `rotate(${textNode.rotation()}deg)`;
      area.style.overflow = 'hidden';
      area.style.resize = 'none';
      area.style.zIndex = '1000';
      area.style.whiteSpace = 'pre-wrap';
      area.style.wordBreak = 'break-word';

      area.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleTextEditComplete(area.value);
          area.remove();
        }
        if (e.key === 'Escape') {
          setIsEditing(false);
          if (onEditingChange) onEditingChange(false);
          area.remove();
        }
      };

      const handleBlur = () => {
        handleTextEditComplete(area.value);
        area.remove();
      };

      area.addEventListener('keydown', handleKeyDown);
      area.addEventListener('blur', handleBlur);

      return () => {
        area.removeEventListener('keydown', handleKeyDown);
        area.removeEventListener('blur', handleBlur);
        if (area.parentNode) area.remove();
      };
    }
  }, [isEditing]);

  const commonProps = {
    ref: shapeRef,
    id: layer.id,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
    opacity: layer.opacity,
    draggable: !isEditing && !layer.locked && !isGroupChild,
    visible: layer.visible !== false && !isEditing,
    listening: layer.visible !== false,
    // CRITICAL: If isMask is true, use 'destination-in' to cut out the shape
    globalCompositeOperation: (layer.isMask ? 'destination-in' : (layer.blendMode || 'source-over')) as any,
    onClick: (e: any) => {
      if (!isGroupChild) e.cancelBubble = true;
      if (!layer.locked && !isGroupChild) {
        if (isSelected && layer.type === LayerType.TEXT) handleEditTrigger();
        else {
          const isMulti = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
          onSelect(layer.id, isMulti);
        }
      }
    },
    onTap: (e: any) => {
      if (!isGroupChild) e.cancelBubble = true;
      if (!layer.locked && !isGroupChild) {
        if (isSelected && layer.type === LayerType.TEXT) handleEditTrigger();
        else {
          const isMulti = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
          onSelect(layer.id, isMulti);
        }
      }
    },
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  const renderLayer = () => {
    if (layer.visible === false) return null;
    switch (layer.type) {
      case LayerType.GROUP: {
        const groupLayer = layer as GroupLayer;

        // MASKING LOGIC:
        const hasMask = groupLayer.children?.some(c => c.isMask);
        const hasPlayingVideo = groupLayer.children?.some(c => c.type === LayerType.IMAGE && (c as any).mediaType === 'video' && (c as any).playing);

        // MASK ANIMATION LOOP (For Video)
        useEffect(() => {
          if (hasMask && hasPlayingVideo && shapeRef.current) {
            const node = shapeRef.current;
            const anim = new Konva.Animation(() => {
              if (node) {
                // Force cache update for video frame
                node.clearCache();
                try {
                  node.cache({
                    x: 0,
                    y: 0,
                    width: layer.width,
                    height: layer.height,
                    pixelRatio: 1 // Optimize for video performance
                  });
                } catch (e) { }
              }
            }, node.getLayer());
            anim.start();
            return () => { anim.stop(); };
          }
        }, [hasMask, hasPlayingVideo, layer.width, layer.height]);

        const handleCacheUpdate = () => {
          if (shapeRef.current && hasMask) {
            setTimeout(() => {
              if (shapeRef.current) {
                shapeRef.current.clearCache();
                try {
                  shapeRef.current.cache({
                    x: 0,
                    y: 0,
                    width: layer.width,
                    height: layer.height,
                    pixelRatio: 2
                  });
                } catch (e) { console.error("Cache update failed", e); }
              }
            }, 50);
          }
        };

        return (
          <Group
            {...commonProps}
            ref={(node) => {
              shapeRef.current = node;

              // Handle caching for masking
              if (node && hasMask) {
                node.clearCache();
                try {
                  node.cache({
                    x: 0,
                    y: 0,
                    width: layer.width,
                    height: layer.height,
                    pixelRatio: 2
                  });
                } catch (e) {
                  console.error("Failed to cache group", e);
                }
              } else if (node) {
                node.clearCache();
              }
            }}
          >
            {groupLayer.children?.map((child) => (
              <CanvasElement
                key={child.id}
                layer={child}
                isSelected={false}
                onSelect={() => { }}
                onChange={() => { }}
                page={page}
                isGroupChild={true}
                onRegister={onRegister}
                requestCacheUpdate={handleCacheUpdate}
              />
            ))}
            {/* DEBUG BORDER - Remove after fix */}
            {/* {hasMask && <Rect width={layer.width} height={layer.height} stroke="red" strokeWidth={2} listening={false} />} */}
          </Group>
        );
      }
      case LayerType.TEXT: {
        const tl = layer as TextLayer;
        return <Text {...commonProps} text={tl.text} fontSize={tl.fontSize} fontFamily={tl.fontFamily} fontStyle={tl.fontWeight} fill={tl.fill} align={tl.align} lineHeight={tl.lineHeight} letterSpacing={tl.letterSpacing} height={undefined} />;
      }
      case LayerType.RECT: {
        const sl = layer as ShapeLayer;
        return <Rect {...commonProps} fill={sl.fill} stroke={sl.stroke} strokeWidth={sl.strokeWidth} cornerRadius={sl.cornerRadius} />;
      }
      case LayerType.CIRCLE: {
        const sl = layer as ShapeLayer;
        return <Circle {...commonProps} radius={Math.min(layer.width, layer.height) / 2} fill={sl.fill} stroke={sl.stroke} strokeWidth={sl.strokeWidth} />;
      }
      case LayerType.STAR: {
        const sl = layer as ShapeLayer;
        return <Star {...commonProps} numPoints={sl.sides || 5} innerRadius={sl.innerRadius || Math.min(layer.width, layer.height) / 4} outerRadius={Math.min(layer.width, layer.height) / 2} fill={sl.fill} stroke={sl.stroke} strokeWidth={sl.strokeWidth} />;
      }
      case LayerType.TRIANGLE: {
        const sl = layer as ShapeLayer;
        return <RegularPolygon {...commonProps} sides={3} radius={Math.min(layer.width, layer.height) / 2} fill={sl.fill} stroke={sl.stroke} strokeWidth={sl.strokeWidth} />;
      }
      case LayerType.POLYGON: {
        const sl = layer as ShapeLayer;
        return <RegularPolygon {...commonProps} sides={sl.sides || 6} radius={Math.min(layer.width, layer.height) / 2} fill={sl.fill} stroke={sl.stroke} strokeWidth={sl.strokeWidth} />;
      }
      case LayerType.ARROW: {
        const sl = layer as ShapeLayer;
        // Arrow points right by default. Width controls length.
        return <Arrow
          {...commonProps}
          points={[0, layer.height / 2, layer.width, layer.height / 2]}
          pointerLength={Math.min(layer.width, layer.height) * 0.4}
          pointerWidth={Math.min(layer.width, layer.height) * 0.4}
          fill={sl.fill}
          stroke={sl.stroke}
          strokeWidth={sl.strokeWidth}
        />;
      }
      case LayerType.DIAMOND: {
        const sl = layer as ShapeLayer;
        // 4-sided Polygon rotated 45 degrees is a Diamond/Rhombus
        // We handle rotation via the group transformation usually, but here we bake it into the shape?
        // Actually RegularPolygon is centered. To make it behave like a Diamond, we just need 4 sides. 
        // Konva's RegularPolygon points up by default. 4 sides = Square (rotated 45 deg).
        return <RegularPolygon
          {...commonProps}
          sides={4}
          radius={Math.min(layer.width, layer.height) / 2}
          fill={sl.fill}
          stroke={sl.stroke}
          strokeWidth={sl.strokeWidth}
        />;
      }
      case LayerType.HEART: {
        const sl = layer as ShapeLayer;
        // SVG Path for Heart, normalized to fit box
        // A simple heart path.
        const pathData = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
        // We need to scale this path to layer.width/height. 
        // Konva Path creates its own bounding box. 
        return <Path
          {...commonProps}
          data={pathData}
          fill={sl.fill}
          stroke={sl.stroke}
          strokeWidth={sl.strokeWidth}
          scaleX={layer.width / 100} // Path is roughly 100x100 coord system
          scaleY={layer.height / 100}
        />;
      }
      case LayerType.TRAPEZOID: {
        const sl = layer as ShapeLayer;
        // Trapezoid Path: Bottom is wider than top
        // Let's assume top width is 60%, bottom is 100%
        // Normalized 0-100 coords: Top-Left(20,0), Top-Right(80,0), Bot-Right(100,100), Bot-Left(0,100)
        const pathData = "M 20,0 L 80,0 L 100,100 L 0,100 Z";
        return <Path
          {...commonProps}
          data={pathData}
          fill={sl.fill}
          stroke={sl.stroke}
          strokeWidth={sl.strokeWidth}
          scaleX={layer.width / 100}
          scaleY={layer.height / 100}
        />;
      }
      case LayerType.IMAGE: {
        const il = layer as ImageLayer;

        if (il.mediaType === 'video' && videoElement) {
          return (
            <KonvaImage
              {...commonProps}
              image={videoElement}
            />
          );
        }
        return imageElement ? <KonvaImage {...commonProps} image={imageElement} /> : null;
      }
      default: return null;
    }
  };

  return (
    <React.Fragment>
      {renderLayer()}
      {isSelected && !isEditing && !layer.locked && !isGroupChild && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={layer.type === LayerType.TEXT ? ['middle-left', 'middle-right'] : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => { if (newBox.width < 5 || newBox.height < 5) return oldBox; return newBox; }}
        />
      )}
    </React.Fragment>
  );
};

export default CanvasElement;
