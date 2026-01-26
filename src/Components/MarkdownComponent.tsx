import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import markdownItContainer from "markdown-it-container";
import { useThemeColors } from "../Global/useTheme";
import { H3, H4, H5, H6, H7 } from "../Styles/Fonts";

const CONTAINER_TYPES = [
  "spoiler",
  "details",
  "note",
  "info",
  "tip",
  "warning",
  "success",
  "danger",
];

const DEFAULT_TITLES = {
  spoiler: "Спойлер",
  details: "Деталі",
  note: "Нотатка",
  info: "Інформація",
  tip: "Порада",
  warning: "Попередження",
  success: "Успіх",
  danger: "Небезпека",
};

const markdownItInstance = (() => {
  const instance = MarkdownIt({
    typographer: true,
    linkify: true,
    breaks: true,
  });
  CONTAINER_TYPES.forEach((type) => {
    instance.use(markdownItContainer, type, {
      validate: (params) => {
        const trimmed = (params || "").trim();
        return trimmed.startsWith(type);
      },
    });
  });
  return instance;
})();

const getContainerTitle = (sourceInfo, type) => {
  if (!sourceInfo) return DEFAULT_TITLES[type];
  const trimmed = sourceInfo.trim();
  const match = trimmed.match(new RegExp(`^${type}\\s*(.*)$`, "i"));
  const rawTitle = match ? match[1] : trimmed;
  const cleaned = rawTitle.replace(/^[:|-]\s*/, "").trim();
  return cleaned || DEFAULT_TITLES[type];
};

const resolveVariantColor = (colors, type) => {
  const fallback = colors.primary;
  switch (type) {
    case "warning":
      return colors.orangeBookmark || colors.yellow || fallback;
    case "danger":
      return colors.redBookmark || fallback;
    case "success":
      return colors.blueBookmark || fallback;
    case "info":
      return colors.blueBookmark || fallback;
    case "tip":
      return colors.yellowBookmark || colors.orangeBookmark || fallback;
    case "note":
      return colors.primary;
    case "details":
      return colors.primary;
    case "spoiler":
      return colors.primary;
    default:
      return fallback;
  }
};

function CollapsibleContainer({ type, title, children, styles, accentColor }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.container, styles[`container_${type}`]]}>
      <Pressable
        onPress={() => setIsOpen((prev) => !prev)}
        style={[styles.containerHeader]}
      >
        {isOpen ? (
          <View style={styles.containerContent}>{children}</View>
        ) : (
          <Text
            style={[
              styles.containerTitle,
              styles[`container_${type}_title`],
              { color: accentColor },
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function CalloutContainer({ type, title, children, styles, accentColor }) {
  return (
    <View
      style={[
        styles.container,
        styles[`container_${type}`],
        { borderColor: accentColor },
      ]}
    >
      <View style={[styles.containerHeader, { borderColor: accentColor }]}>
        <Text
          style={[
            styles.containerTitle,
            styles[`container_${type}_title`],
            { color: accentColor },
          ]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.containerContent}>{children}</View>
    </View>
  );
}

const buildContainerRules = (colors) => {
  const base = {};

  CONTAINER_TYPES.forEach((type) => {
    base[`container_${type}`] = (node, children, parent, styles) => {
      const title = getContainerTitle(node.sourceInfo, type);
      const accentColor = resolveVariantColor(colors, type);
      const isCollapsible = type === "spoiler" || type === "details";

      if (isCollapsible) {
        return (
          <CollapsibleContainer
            key={node.key}
            type={type}
            title={title}
            styles={styles}
            accentColor={accentColor}
          >
            {children}
          </CollapsibleContainer>
        );
      }

      return (
        <CalloutContainer
          key={node.key}
          type={type}
          title={title}
          styles={styles}
          accentColor={accentColor}
        >
          {children}
        </CalloutContainer>
      );
    };
  });

  base.container = (node, children, parent, styles) => (
    <View key={node.key} style={styles.container}>
      {children}
    </View>
  );

  return base;
};

export default function MarkdownComponent({ children, style, rules, ...rest }) {
  const colors = useThemeColors();
  children = children.replaceAll("hikka.io", "aniua.yuzka.site");

  const baseStyles = useMemo(
    () => ({
      body: {
        ...H5,
      },
      paragraph: {
        ...H5,
        marginBottom: 8,
      },
      heading1: {
        ...H3,
        marginBottom: 8,
      },
      heading2: {
        ...H4,
        marginBottom: 8,
      },
      heading3: {
        ...H5,
        marginBottom: 6,
      },
      heading4: {
        ...H6,
        marginBottom: 6,
      },
      link: {
        color: colors.primary,
        textDecorationLine: "underline",
      },
      strong: {
        color: colors.text,
        fontFamily: "Nunito-Bold",
      },
      em: {
        color: colors.text,
        fontFamily: "Nunito-Italic",
      },
      blockquote: {
        paddingLeft: 12,
        marginVertical: 8,
      },
      list_item: {
        marginBottom: 6,
      },
      bullet_list_icon: {
        color: colors.primary,
        fontFamily: "Nunito-Bold",
      },
      ordered_list_icon: {
        color: colors.primary,
        fontFamily: "Nunito-SemiBold",
      },
      container: {
        borderRadius: 16,
        padding: 12,
        marginVertical: 8,
      },
      containerHeader: {
        flexDirection: "row",
        alignItems: "center",
      },
      containerTitle: {
        ...H5,
        textAlign: "center",
        flex: 1,
        fontFamily: "Nunito-SemiBold",
      },
      containerToggle: {
        ...H5,
        fontFamily: "Nunito-SemiBold",
      },
      containerContent: {
        marginTop: 2,
      },
      container_spoiler: {
        backgroundColor: colors.background,
      },
      container_details: {
        backgroundColor: colors.background,
      },
      container_note: {
        backgroundColor: colors.background,
      },
      container_info: {
        backgroundColor: colors.background,
      },
      container_tip: {
        backgroundColor: colors.background,
      },
      container_warning: {
        backgroundColor: colors.background,
      },
      container_success: {
        backgroundColor: colors.background,
      },
      container_danger: {
        backgroundColor: colors.background,
      },
    }),
    [colors]
  );

  const containerRules = useMemo(() => buildContainerRules(colors), [colors]);

  const mergedRules = useMemo(
    () => ({
      ...containerRules,
      ...(rules || {}),
    }),
    [containerRules, rules]
  );

  const mergedStyles = useMemo(
    () => ({
      ...baseStyles,
      ...(style || {}),
    }),
    [baseStyles, style]
  );

  return (
    <Markdown
      markdownit={markdownItInstance}
      rules={mergedRules}
      style={mergedStyles}
      {...rest}
    >
      {children}
    </Markdown>
  );
}
