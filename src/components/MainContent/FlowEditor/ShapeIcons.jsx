import React from "react";

/**
 * 四角形アイコン
 */
export const RectangleIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" fill={color} stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * 円形アイコン
 */
export const CircleIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" fill={color} stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * 三角形アイコン
 */
export const TriangleIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 3 L21 19 L3 19 Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/**
 * ダイヤモンド（菱形）アイコン
 */
export const DiamondIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/**
 * 六角形アイコン
 */
export const HexagonIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M7.5 3 L16.5 3 L21 12 L16.5 21 L7.5 21 L3 12 Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/**
 * 星形アイコン
 */
export const StarIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/**
 * 矢印アイコン
 */
export const ArrowIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M2 12 L6 8 L6 11 L18 11 L18 8 L22 12 L18 16 L18 13 L6 13 L6 16 Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/**
 * 楕円アイコン
 */
export const EllipseIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="12" cy="12" rx="9" ry="6" fill={color} stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * 角丸四角形アイコン
 */
export const RoundedRectIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="4" ry="4" fill={color} stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * 平行四辺形アイコン
 */
export const ParallelogramIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 5 L20 5 L18 19 L4 19 Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
