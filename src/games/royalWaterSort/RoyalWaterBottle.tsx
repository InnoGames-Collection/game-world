import React from 'react';
import { BottleState, LiquidColorId } from './types';
import { LIQUID_COLORS } from './colors';

interface RoyalWaterBottleProps {
  bottle: BottleState;
  isSelected: boolean;
  isPouringSource: boolean;
  isPouringDest: boolean;
  isHintSource?: boolean;
  isHintDest?: boolean;
  isShaking?: boolean;
  tiltAngle?: number; // degrees
  liftPx?: number;
  offsetX?: number;
  offsetY?: number;
  sourceTransferProgress?: number; // 0 to 1 during pour
  transferCount?: number;
  destTransferProgress?: number; // 0 to 1 during receiving
  transferColor?: LiquidColorId | null;
  onSelect: (bottleId: number) => void;
  width?: number; // default ~56-64px
  height?: number; // default ~160-180px
  innerRef?: (el: HTMLDivElement | null) => void;
}

export const RoyalWaterBottle: React.FC<RoyalWaterBottleProps> = ({
  bottle,
  isSelected,
  isPouringSource,
  isPouringDest,
  isHintSource,
  isHintDest,
  isShaking = false,
  tiltAngle = 0,
  liftPx = 0,
  offsetX = 0,
  offsetY = 0,
  sourceTransferProgress = 0,
  transferCount = 0,
  destTransferProgress = 0,
  transferColor = null,
  onSelect,
  width = 62,
  height = 175,
  innerRef,
}) => {
  const { layers, capacity, isCompleted } = bottle;
  const isBottleDone = isCompleted || (layers.length === capacity && layers.every((c) => c === layers[0]));

  // Calculate transform styles
  const actualLift = isSelected && !isPouringSource ? -14 : -liftPx;
  const totalY = actualLift + offsetY;
  const totalX = offsetX;

  // Natural physics transform pivot: pivots at the pouring spout lip
  const transformOrigin =
    tiltAngle < 0
      ? '16px 18px'
      : tiltAngle > 0
      ? `${width - 16}px 18px`
      : 'bottom center';

  const transformStyle: React.CSSProperties = {
    transform: `translate(${totalX}px, ${totalY}px) rotate(${tiltAngle}deg)`,
    transformOrigin,
    transition: isPouringSource
      ? 'transform 0.12s linear'
      : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.25, 1)',
    zIndex: isPouringSource ? 40 : isSelected ? 30 : 10,
  };

  const layerHeight = (height * 0.76) / capacity;

  // Compute effective visible layers
  const renderedLayers = [...layers];

  return (
    <div
      id={`royal-bottle-${bottle.id}`}
      ref={innerRef}
      onClick={() => onSelect(bottle.id)}
      style={transformStyle}
      className={`relative cursor-pointer select-none touch-manipulation ${
        isShaking ? 'animate-royal-shake' : ''
      }`}
    >
      {/* Subtle Selection / Hint Aura */}
      {isSelected && !isPouringSource && (
        <div className="absolute -inset-2 rounded-[28px] bg-cyan-400/25 blur-md pointer-events-none animate-pulse" />
      )}
      {isHintSource && !isSelected && (
        <div className="absolute -inset-2 rounded-[28px] bg-amber-400/35 blur-md pointer-events-none animate-bounce" />
      )}
      {isHintDest && (
        <div className="absolute -inset-2 rounded-[28px] bg-emerald-400/35 blur-md pointer-events-none animate-pulse" />
      )}

      {/* SVG 3D Glass Bottle Container */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible block filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)]"
      >
        <defs>
          {/* Glass Outer Rim Reflection */}
          <linearGradient id={`glass-rim-${bottle.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isSelected ? 0.95 : 0.7} />
            <stop offset="35%" stopColor="#A5C8E8" stopOpacity={0.4} />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity={isSelected ? 0.95 : 0.8} />
            <stop offset="100%" stopColor="#5E83A8" stopOpacity={0.5} />
          </linearGradient>

          {/* Glass Body Shading Gradient */}
          <linearGradient id={`glass-body-${bottle.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="85%" stopColor="#1E324A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>

          {/* Golden Cork Wood Gradient */}
          <linearGradient id={`cork-grad-${bottle.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E6A838" />
            <stop offset="40%" stopColor="#FFDE6A" />
            <stop offset="70%" stopColor="#C88218" />
            <stop offset="100%" stopColor="#8A5205" />
          </linearGradient>

          {/* Bottle Clip Path (Narrow neck, rounded bottom cylinder) */}
          <clipPath id={`bottle-interior-${bottle.id}`}>
            <path
              d={`
                M 12 18
                L 12 ${height - 22}
                A 19 19 0 0 0 ${width - 12} ${height - 22}
                L ${width - 12} 18
                Z
              `}
            />
          </clipPath>
        </defs>

        {/* -------------------------------------------------------------
            1. BOTTLE INTERIOR LIQUID LAYERS (Rendered inside clipPath)
           ------------------------------------------------------------- */}
        <g clipPath={`url(#bottle-interior-${bottle.id})`}>
          {/* Subtle Dark Interior Base */}
          <rect
            x="12"
            y="18"
            width={width - 24}
            height={height - 18}
            fill="#081422"
            fillOpacity="0.4"
          />

          {/* Render Stacked Existing Liquid Layers from bottom up */}
          {renderedLayers.map((colorId, idx) => {
            const color = LIQUID_COLORS[colorId];
            const bottomY = height - 8 - idx * layerHeight;
            let topY = bottomY - layerHeight;

            const isDrainingLayer =
              isPouringSource &&
              transferCount > 0 &&
              idx >= renderedLayers.length - transferCount;

            if (isDrainingLayer) {
              const layerDrainingOrder = renderedLayers.length - 1 - idx; // 0 for topmost
              const layerDrainStart = layerDrainingOrder / transferCount;
              const layerDrainEnd = (layerDrainingOrder + 1) / transferCount;
              const localProgress = Math.max(
                0,
                Math.min(1, (sourceTransferProgress - layerDrainStart) / (layerDrainEnd - layerDrainStart || 1))
              );
              topY += localProgress * layerHeight;
            }

            const currentLayerHeight = Math.max(0, bottomY - topY);
            if (currentLayerHeight <= 0) return null;

            const isTopmost =
              idx === renderedLayers.length - 1 &&
              (!isPouringDest || destTransferProgress === 0);

            // Tilted liquid slope inside source bottle when pouring
            const isTilting = isPouringSource && Math.abs(tiltAngle) > 10;
            const tiltDir = tiltAngle > 0 ? 1 : -1; // +1 right, -1 left
            const slopeShift = isTilting ? Math.min(14, (Math.abs(tiltAngle) / 60) * 12) : 0;

            // When tilted, the liquid slopes toward the mouth opening (y = 18)
            let leftTop = topY + (tiltDir > 0 ? slopeShift : -slopeShift);
            let rightTop = topY + (tiltDir > 0 ? -slopeShift : slopeShift);

            // Keep within interior bounds (never above lip 18 or below bottomY)
            leftTop = Math.max(18, Math.min(bottomY, leftTop));
            rightTop = Math.max(18, Math.min(bottomY, rightTop));

            return (
              <g key={`layer-${idx}`}>
                <defs>
                  <linearGradient id={`liquid-${bottle.id}-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color.light} />
                    <stop offset="30%" stopColor={color.primary} />
                    <stop offset="85%" stopColor={color.dark} />
                    <stop offset="100%" stopColor={color.primary} />
                  </linearGradient>
                </defs>

                {isTilting && isTopmost ? (
                  // Polygon for angled liquid surface following gravity
                  <polygon
                    points={`8,${bottomY + 1} 8,${leftTop} ${width - 8},${rightTop} ${width - 8},${bottomY + 1}`}
                    fill={`url(#liquid-${bottle.id}-${idx})`}
                  />
                ) : (
                  // Standard Layer Rectangle
                  <rect
                    x="8"
                    y={topY}
                    width={width - 16}
                    height={currentLayerHeight + 2}
                    fill={`url(#liquid-${bottle.id}-${idx})`}
                  />
                )}

                {/* Top Meniscus Ellipse for 3D liquid surface curvature */}
                {isTopmost && !isTilting && (
                  <ellipse
                    cx={width / 2}
                    cy={topY}
                    rx={(width - 24) / 2}
                    ry={4.5}
                    fill={color.light}
                    fillOpacity="0.85"
                  />
                )}

                {/* Subtle layer divider shadow (omit if next layer is same color to merge seamlessly) */}
                {idx < renderedLayers.length - 1 && renderedLayers[idx + 1] !== colorId && (
                  <line
                    x1="12"
                    y1={topY}
                    x2={width - 12}
                    y2={topY}
                    stroke={color.dark}
                    strokeWidth="1"
                    strokeOpacity="0.35"
                  />
                )}
              </g>
            );
          })}

          {/* Destination Receiving Liquid Growth with Surface Ripple */}
          {isPouringDest && transferColor && destTransferProgress > 0 && transferCount > 0 && (
            <g>
              {(() => {
                const color = LIQUID_COLORS[transferColor];
                const baseBottomY = height - 8 - renderedLayers.length * layerHeight;
                const totalTargetHeight = transferCount * layerHeight;
                const currentHeight = totalTargetHeight * destTransferProgress;
                const topY = baseBottomY - currentHeight;

                // Check if receiving onto same-color top layer (seamless merge)
                const isSameColorBase =
                  renderedLayers.length > 0 &&
                  renderedLayers[renderedLayers.length - 1] === transferColor;

                return (
                  <g>
                    <defs>
                      <linearGradient id={`receiving-liquid-${bottle.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color.light} />
                        <stop offset="30%" stopColor={color.primary} />
                        <stop offset="85%" stopColor={color.dark} />
                        <stop offset="100%" stopColor={color.primary} />
                      </linearGradient>
                    </defs>

                    {/* Rising Liquid Column */}
                    <rect
                      x="8"
                      y={topY}
                      width={width - 16}
                      height={currentHeight + 2}
                      fill={`url(#receiving-liquid-${bottle.id})`}
                    />

                    {/* Active Rising Surface Meniscus with gentle ripple */}
                    <g className="animate-liquid-ripple" style={{ transformOrigin: `${width / 2}px ${topY}px` }}>
                      <ellipse
                        cx={width / 2}
                        cy={topY}
                        rx={(width - 24) / 2}
                        ry={5}
                        fill={color.light}
                        fillOpacity="0.95"
                      />
                      {/* Fluid Impact Droplet Wave Point */}
                      <circle
                        cx={width / 2}
                        cy={topY}
                        r={2.5}
                        fill="#FFFFFF"
                        fillOpacity="0.75"
                      />
                    </g>
                  </g>
                );
              })()}
            </g>
          )}
        </g>

        {/* -------------------------------------------------------------
            2. 3D GLASS SHADING, REFLECTIONS & SPECULAR HIGHLIGHTS
           ------------------------------------------------------------- */}
        {/* Glass Outer Wall & Rounded Base */}
        <path
          d={`
            M 11 18
            L 11 ${height - 22}
            A 20 20 0 0 0 ${width - 11} ${height - 22}
            L ${width - 11} 18
            Z
          `}
          fill={`url(#glass-body-${bottle.id})`}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
        />

        {/* Vertical Specular Glass Highlight Streak (Left side) */}
        <path
          d={`
            M 14 24
            L 14 ${height - 30}
            A 16 16 0 0 0 18 ${height - 18}
          `}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.55"
          fill="none"
        />

        {/* Vertical Specular Glass Highlight Thin Streak (Right side) */}
        <line
          x1={width - 14}
          y1={24}
          x2={width - 14}
          y2={height - 30}
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* -------------------------------------------------------------
            3. THICK GLASS LIP / RIM AT BOTTLE MOUTH
           ------------------------------------------------------------- */}
        {/* Outer Rim Lip */}
        <ellipse
          cx={width / 2}
          cy={18}
          rx={(width - 16) / 2}
          ry={5.5}
          fill={`url(#glass-rim-${bottle.id})`}
          stroke={isSelected ? '#00E5FF' : '#CFD8DC'}
          strokeWidth={isSelected ? 2 : 1}
        />

        {/* Inner Dark Glass Opening */}
        <ellipse
          cx={width / 2}
          cy={18}
          rx={(width - 24) / 2}
          ry={3.5}
          fill="#06121E"
          fillOpacity="0.6"
        />

        {/* -------------------------------------------------------------
            4. GOLDEN CORK STOPPER (Appears when 100% completed)
           ------------------------------------------------------------- */}
        {isBottleDone && (
          <g className="animate-in zoom-in-50 duration-300">
            {/* Wooden Cork Top */}
            <path
              d={`
                M ${width / 2 - 12} 18
                L ${width / 2 - 10} 6
                Q ${width / 2} 3 ${width / 2 + 10} 6
                L ${width / 2 + 12} 18
                Z
              `}
              fill={`url(#cork-grad-${bottle.id})`}
              stroke="#FDD835"
              strokeWidth="1"
            />
            {/* Crown starburst sparkle on cork */}
            <circle cx={width / 2} cy={8} r={3} fill="#FFF9C4" />
          </g>
        )}
      </svg>
    </div>
  );
};

