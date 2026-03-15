import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isLargeDesktop = width >= BREAKPOINTS.largeDesktop;

  const contentMaxWidth = 1200;
  const horizontalPadding = isMobile ? 16 : isTablet ? 32 : (width - contentMaxWidth) / 2 > 32 ? (width - contentMaxWidth) / 2 : 32;

  const getGridColumns = (mobileCols = 1, tabletCols = 2, desktopCols = 3) => {
    if (isMobile) return mobileCols;
    if (isTablet) return tabletCols;
    return desktopCols;
  };

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    contentMaxWidth,
    horizontalPadding,
    getGridColumns,
  };
}
