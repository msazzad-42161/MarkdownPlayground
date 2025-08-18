import React from "react";
import { ScrollView } from "react-native";
import MarkdownView from "./MarkdownRenderer";
import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const markdownText = `
# Hello Markdown

This is **bold** text, this is *italic*, and here’s a [link](https://reactnative.dev).

- Item 1
- Item 2
- Item 3

![Kitten](https://placekitten.com/200/200)
`;

  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1,backgroundColor: '#fff' }}>
      <ScrollView style={{ padding: 20 }}>
        <MarkdownView markdown={markdownText} />
      </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
