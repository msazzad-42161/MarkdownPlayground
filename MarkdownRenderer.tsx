import React from "react";
import { View, Text, Image, Linking, StyleSheet, TouchableOpacity, Platform } from "react-native";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

type Props = {
  markdown: string;
};

const MarkdownView: React.FC<Props> = ({ markdown }) => {
  const tokens = md.parse(markdown, {});

  const renderInline = (token: any): React.ReactNode[] => {
    if (!token.children) return [];

    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < token.children.length) {
      const child = token.children[i];

      switch (child.type) {
        case "text":
          elements.push(<Text key={i}>{child.content}</Text>);
          i++;
          break;

        case "strong_open":
          // Find the matching close tag
          let strongContent = [];
          i++; // Skip the open tag
          while (i < token.children.length && token.children[i].type !== "strong_close") {
            if (token.children[i].type === "text") {
              strongContent.push(token.children[i].content);
            }
            i++;
          }
          elements.push(
            <Text key={i} style={styles.bold}>
              {strongContent.join("")}
            </Text>
          );
          i++; // Skip the close tag
          break;

        case "em_open":
          // Find the matching close tag
          let emContent = [];
          i++; // Skip the open tag
          while (i < token.children.length && token.children[i].type !== "em_close") {
            if (token.children[i].type === "text") {
              emContent.push(token.children[i].content);
            }
            i++;
          }
          elements.push(
            <Text key={i} style={styles.italic}>
              {emContent.join("")}
            </Text>
          );
          i++; // Skip the close tag
          break;

        case "link_open":
          const href = child.attrs?.find((a: any) => a[0] === "href")?.[1];
          let linkContent = [];
          i++; // Skip the open tag
          while (i < token.children.length && token.children[i].type !== "link_close") {
            if (token.children[i].type === "text") {
              linkContent.push(token.children[i].content);
            }
            i++;
          }
          elements.push(
            <TouchableOpacity key={i} onPress={() => href && Linking.openURL(href)}>
              <Text style={styles.link}>{linkContent.join("")}</Text>
            </TouchableOpacity>
          );
          i++; // Skip the close tag
          break;

        case "fence":
          console.log('Found fence token!', token);
          const fenceCode = token.content || '';
          const fenceLanguage = token.info || ''; 
          elements.push(
            <View key={i} style={styles.codeBlock}>
              {fenceLanguage && (
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLanguage}>{fenceLanguage}</Text>
                </View>
              )}
              <Text style={styles.codeText}>{fenceCode}</Text>
            </View>
          );
          i++;
          break;

        case "code_block":
        case "fenced_code_block":
        case "code":
          const blockCode = token.content || token.markup || '';
          const blockLang = token.info || token.lang || "";
          elements.push(
            <View key={i} style={styles.codeBlock}>
              {blockLang && (
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLanguage}>{blockLang}</Text>
                </View>
              )}
              <Text style={styles.codeText}>{blockCode}</Text>
            </View>
          );
          i++;
          break;

        case "code_inline":
          elements.push(
            <Text key={i} style={styles.inlineCode}>
              {child.content}
            </Text>
          );
          i++;
          break;

        case "fence":
          const code = token.content || '';
          const language = token.info || ''; 
          elements.push(
            <View key={i} style={styles.codeBlock}>
              {language && (
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLanguage}>{language}</Text>
                </View>
              )}
              <Text style={styles.codeText}>{code}</Text>
            </View>
          );
          i++;
          break;

        case "code_block":
        case "fenced_code_block":
        case "code":
          const codeContent = token.content || token.markup || '';
          const lang = token.info || token.lang || "";
          elements.push(
            <View key={i} style={styles.codeBlock}>
              {lang && (
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLanguage}>{lang}</Text>
                </View>
              )}
              <Text style={styles.codeText}>{codeContent}</Text>
            </View>
          );
          i++;
          break;

        case "image":
          const src = child.attrs?.find((a: any) => a[0] === "src")?.[1];
          const alt = child.content || child.attrs?.find((a: any) => a[0] === "alt")?.[1] || "Image";
          console.log('Image found in inline:', { src, alt });
          if (src) {
            elements.push(
              <View key={i} style={styles.imageContainer}>
                <Image 
                  source={{ uri: src }} 
                  style={styles.img}
                  resizeMode="cover"
                  onError={(error) => console.log('Image load error:', error)}
                  onLoad={() => console.log('Image loaded successfully')}
                  accessible={true}
                  accessibilityLabel={alt}
                />
                <Text style={styles.imageAlt}>{alt}</Text>
              </View>
            );
          }
          i++;
          break;

        case "softbreak":
          elements.push(<Text key={i}>{"\n"}</Text>);
          i++;
          break;

        default:
          i++;
          break;
      }
    }

    return elements;
  };

  const renderTokens = (tokens: any[]): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];
      
      // Handle fence tokens directly
      if (token.type === "fence") {
        elements.push(
          <View key={i} style={styles.codeBlock}>
            {token.info && (
              <View style={styles.codeHeader}>
                <Text style={styles.codeLanguage}>{token.info}</Text>
              </View>
            )}
            <Text style={styles.codeText}>{token.content || ''}</Text>
          </View>
        );
        i++;
        continue;
      }

      switch (token.type) {
        case "heading_open":
          const headingContent = tokens[i + 1];
          elements.push(
            <Text key={i} style={[styles.heading, headingStyle(token.tag)]}>
              {renderInline(headingContent)}
            </Text>
          );
          i += 3; // Skip heading_open, inline, heading_close
          break;

        case "paragraph_open":
          const paragraphContent = tokens[i + 1];
          elements.push(
            <Text key={i} style={styles.paragraph}>
              {renderInline(paragraphContent)}
            </Text>
          );
          i += 3; // Skip paragraph_open, inline, paragraph_close
          break;

        case "bullet_list_open":
          const listItems: React.ReactNode[] = [];
          i++; // Skip list_open
          let listItemKey = 0;

          while (i < tokens.length && tokens[i].type !== "bullet_list_close") {
            if (tokens[i].type === "list_item_open") {
              // Look for the paragraph inside the list item
              let j = i + 1;
              while (j < tokens.length && tokens[j].type !== "list_item_close") {
                if (tokens[j].type === "paragraph_open") {
                  const paragraphContent = tokens[j + 1];
                  listItems.push(
                    <View key={listItemKey} style={styles.listItem}>
                      <Text style={styles.bullet}>• </Text>
                      <View style={styles.listItemText}>
                        <Text style={styles.listItemTextStyle}>
                          {renderInline(paragraphContent)}
                        </Text>
                      </View>
                    </View>
                  );
                  listItemKey++;
                  break;
                }
                j++;
              }
              // Skip to the end of this list item
              while (i < tokens.length && tokens[i].type !== "list_item_close") {
                i++;
              }
              i++; // Skip list_item_close
            } else {
              i++;
            }
          }

          elements.push(
            <View key={`list-${i}`} style={styles.list}>
              {listItems}
            </View>
          );
          i++; // Skip bullet_list_close
          break;

        case "image":
          const src = token.attrs?.find((a: any) => a[0] === "src")?.[1];
          const alt = token.attrs?.find((a: any) => a[0] === "alt")?.[1] || token.content;
          if (src) {
            elements.push(
              <View key={i} style={styles.imageContainer}>
                <Image 
                  source={{ uri: src }} 
                  style={styles.img}
                  resizeMode="cover"
                  onError={(error) => console.log('Image load error:', error)}
                  onLoad={() => console.log('Image loaded successfully')}
                  accessible={true}
                  accessibilityLabel={alt || "Image"}
                />
                <Text style={styles.imageAlt}>{alt}</Text>
              </View>
            );
          }
          i++;
          break;

        default:
          i++;
          break;
      }
    }

    return elements;
  };

  return <View>{renderTokens(tokens)}</View>;
};

const styles = StyleSheet.create({
  paragraph: { 
    fontSize: 16, 
    marginBottom: 12, 
    lineHeight: 22,
    color: '#333'
  },
  heading: { 
    fontWeight: "bold", 
    marginVertical: 12,
    color: '#222'
  },
  bold: { 
    fontWeight: "bold" 
  },
  italic: { 
    fontStyle: "italic" 
  },
  link: { 
    color: "#007AFF", 
    textDecorationLine: "underline" 
  },
  list: { 
    marginVertical: 8 
  },
  listItem: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    marginBottom: 6,
    paddingLeft: 4
  },
  listItemText: {
    flex: 1,
    marginLeft: 4
  },
  listItemTextStyle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333'
  },
  bullet: { 
    fontSize: 16,
    lineHeight: 22,
    color: '#666'
  },
  img: { 
    width: 200, 
    height: 200, 
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  imageContainer: {
    marginVertical: 12,
    alignItems: 'center'
  },
  imageAlt: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  codeBlock: {
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden'
  },
  codeHeader: {
    backgroundColor: '#e1e4e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de'
  },
  codeLanguage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#656d76',
    textTransform: 'uppercase'
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: '#24292f',
    padding: 12,
    lineHeight: 20
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    backgroundColor: '#f6f8fa',
    color: '#d73a49',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3
  },
});

const headingStyle = (tag: string) => {
  switch (tag) {
    case "h1": return { fontSize: 28, marginVertical: 16 };
    case "h2": return { fontSize: 24, marginVertical: 14 };
    case "h3": return { fontSize: 20, marginVertical: 12 };
    case "h4": return { fontSize: 18, marginVertical: 10 };
    case "h5": return { fontSize: 16, marginVertical: 8 };
    case "h6": return { fontSize: 14, marginVertical: 8 };
    default: return { fontSize: 16 };
  }
};

export default MarkdownView;