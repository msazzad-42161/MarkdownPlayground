import React from "react";
import { View, Text, Image, Linking, StyleSheet } from "react-native";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

type Props = {
  markdown: string;
};

const MarkdownView: React.FC<Props> = ({ markdown }) => {
  const tokens = md.parse(markdown, {});

  const renderInline = (token) => {
    if (!token.children) return null;

    return token.children.map((child, i) => {
      switch (child.type) {
        case "text":
          return <Text key={i}>{child.content}</Text>;
        case "strong_open":
          return <Text key={i} style={styles.bold}>{renderInline(token.children[i + 1])}</Text>;
        case "em_open":
          return <Text key={i} style={styles.italic}>{renderInline(token.children[i + 1])}</Text>;
        case "link_open":
          const href = child.attrs?.find(a => a[0] === "href")?.[1];
          return (
            <Text key={i} style={styles.link} onPress={() => href && Linking.openURL(href)}>
              {renderInline(token.children[i + 1])}
            </Text>
          );
        default:
          return null;
      }
    });
  };

  const renderTokens = (tokens) => {
    return tokens.map((token, i) => {
      switch (token.type) {
        case "heading_open":
          return (
            <Text key={i} style={[styles.heading, headingStyle(token.tag)]}>
              {renderInline(tokens[i + 1])}
            </Text>
          );
        case "paragraph_open":
          return <Text key={i} style={styles.paragraph}>{renderInline(tokens[i + 1])}</Text>;
        case "bullet_list_open":
          return (
            <View key={i} style={styles.list}>
              {tokens.slice(i + 1).map((t, j) => {
                if (t.type === "list_item_open") {
                  return (
                    <View key={j} style={styles.listItem}>
                      <Text style={styles.bullet}>• </Text>
                      <Text>{renderInline(tokens[i + 2])}</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          );
        case "image":
          const src = token.attrs?.find(a => a[0] === "src")?.[1];
          return <Image key={i} source={{ uri: src }} style={styles.img} />;
        default:
          return null;
      }
    });
  };

  return <View>{renderTokens(tokens)}</View>;
};

const styles = StyleSheet.create({
  paragraph: { fontSize: 16, marginBottom: 8, lineHeight: 22 },
  heading: { fontWeight: "bold", marginVertical: 8 },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  link: { color: "blue", textDecorationLine: "underline" },
  list: { marginVertical: 6 },
  listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  bullet: { fontSize: 16 },
  img: { width: 200, height: 200, marginVertical: 8 },
});

const headingStyle = (tag: string) => {
  switch (tag) {
    case "h1": return { fontSize: 28 };
    case "h2": return { fontSize: 22 };
    case "h3": return { fontSize: 18 };
    default: return { fontSize: 16 };
  }
};

export default MarkdownView;
