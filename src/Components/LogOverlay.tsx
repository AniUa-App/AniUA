import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";
import Logger, { LogEntry } from "../Logger/Logger";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LogOverlay() {
  const [visible, setVisible] = useState(() => !!SettingsStorage.getParameter("showLogs"));
  const [logLines, setLogLines] = useState<LogEntry[]>([]);
  const [position, setPosition] = useState({ x: 0, y: SCREEN_HEIGHT / 2 });
  const logScrollRef = useRef<any>(null);
  const positionRef = useRef({ x: 0, y: SCREEN_HEIGHT / 2 });

  // Listen for showLogs setting changes
  useEffect(() => {
    const handler = (val: boolean) => setVisible(!!val);
    EventBus.on("showLogs", handler);
    return () => EventBus.off("showLogs", handler);
  }, []);

  // Poll logger buffer
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setLogLines([...Logger.getBuffer()]);
    }, 500);
    return () => clearInterval(id);
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = positionRef.current.x + gestureState.dx;
        const newY = positionRef.current.y + gestureState.dy;
        setPosition({ x: newX, y: newY });
      },
      onPanResponderRelease: (_, gestureState) => {
        positionRef.current = {
          x: positionRef.current.x + gestureState.dx,
          y: positionRef.current.y + gestureState.dy,
        };
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <View
      style={[
        styles.overlay,
        { top: position.y, left: position.x },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.handle} {...panResponder.panHandlers} />
      <ScrollView
        ref={logScrollRef}
        style={styles.scroll}
        onContentSizeChange={() => logScrollRef.current?.scrollToEnd({ animated: false })}
      >
        {logLines.map((e, i) => (
          <Text
            key={i}
            selectable
            style={[
              styles.logLine,
              e.level === "ERROR" && { color: "#ff6b6b" },
              e.level === "WARN" && { color: "#ffd93d" },
              e.level === "INFO" && { color: "#6bcb77" },
            ]}
          >
            {`[${e.timestamp}] ${e.level} [${e.context}] ${e.message}${e.data !== undefined ? " " + JSON.stringify(e.data) : ""}`}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "rgba(0,0,0,0.9)",
    zIndex: 9999,
  },
  handle: {
    height: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  logLine: {
    color: "#aaa",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 1,
  },
});
