import React, {useRef, useEffect, forwardRef, useImperativeHandle, useState} from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  StyleSheet,
  NativeEventEmitter,
} from 'react-native';

// Імпортуємо нативний компонент
const AdBlockWebViewNative = requireNativeComponent('AdBlockWebView');

const AdBlockWebView = forwardRef(
  (
    {
      source,
      style,
      javaScriptEnabled = true,
      domStorageEnabled = true,
      userAgent,
      customFilters = [],
      onLoadStart,
      onLoadEnd,
      onLoadProgress,
      onError,
      onMessage,
      onConsoleMessage,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
    },
    ref,
  ) => {
    const webViewRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useImperativeHandle(ref, () => ({
      injectJavaScript: script => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands
                .injectJavaScript,
              [script],
            );
          }
        }
      },
      goBack: () => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands.goBack,
              [],
            );
          }
        }
      },
      goForward: () => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands
                .goForward,
              [],
            );
          }
        }
      },
      reload: () => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands.reload,
              [],
            );
          }
        }
      },
      stopLoading: () => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands
                .stopLoading,
              [],
            );
          }
        }
      },
      clearCache: () => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands
                .clearCache,
              [],
            );
          }
        }
      },
      addCustomFilter: (filter) => {
        if (webViewRef.current) {
          const nodeHandle = findNodeHandle(webViewRef.current);
          if (nodeHandle) {
            UIManager.dispatchViewManagerCommand(
              nodeHandle,
              UIManager.getViewManagerConfig('AdBlockWebView').Commands
                .addCustomFilter,
              [filter],
            );
          }
        }
      },
    }));

    useEffect(() => {
      // Якщо є injectedJavaScript, виконуємо його після завантаження сторінки
      if (injectedJavaScript && webViewRef.current) {
        const nodeHandle = findNodeHandle(webViewRef.current);
        if (nodeHandle) {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('AdBlockWebView').Commands
              .injectJavaScript,
            [injectedJavaScript],
          );
        }
      }
    }, [injectedJavaScript]);

    // Підготовка об'єкту source для нативного компонента
    const processedSource = source
      ? typeof source === 'string'
        ? {uri: source}
        : source
      : null;

    const handleLoadProgress = event => {
      const {progress} = event.nativeEvent;
      setProgress(progress);
      if (onLoadProgress) {
        onLoadProgress(event);
      }
    };

    const handleConsoleMessage = event => {
      if (onConsoleMessage) {
        const {message, level, source, line} = event.nativeEvent;
        onConsoleMessage({
          message,
          level,
          source,
          line,
        });
      }
    };

    return (
      <AdBlockWebViewNative
        ref={webViewRef}
        style={[styles.webView, style]}
        source={processedSource}
        javaScriptEnabled={javaScriptEnabled}
        domStorageEnabled={domStorageEnabled}
        userAgent={userAgent}
        customFilters={customFilters}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={onError}
        onMessage={event => {
          if (onMessage) {
            onMessage(event);
          }
        }}
        onConsoleMessage={handleConsoleMessage}
      />
    );
  },
);

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});

export default AdBlockWebView;
