import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface AdaptiveContainerProps extends ViewProps {
  children: React.ReactNode;
  fluid?: boolean;
}

/**
 * A container that applies maximum width and centering on desktop screens.
 */
export function AdaptiveContainer({ children, style, fluid = false, ...props }: AdaptiveContainerProps) {
  const { isDesktop, contentMaxWidth } = useResponsive();

  if (fluid) {
    return <View style={[styles.fluid, style]} {...props}>{children}</View>;
  }

  return (
    <View style={styles.outerContainer}>
        <View 
            style={[
                styles.innerContainer, 
                isDesktop && { maxWidth: contentMaxWidth },
                style
            ]} 
            {...props}
        >
            {children}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  innerContainer: {
    width: '100%',
    flex: 1,
  },
  fluid: {
    width: '100%',
    flex: 1,
  }
});
