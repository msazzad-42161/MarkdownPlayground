import React from "react";
import { ScrollView } from "react-native";
import MarkdownView from "./MarkdownRenderer";
import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const markdownText = `
# Hello Markdown
## Welcome to Markdown Playground
This is a simple Markdown renderer for React Native.
### Features
- **Bold** and *italic* text
- [Links](https://reactnative.dev)
- Images

![Kitten](https://imgs.search.brave.com/698OeZUVFBAkTkwgb-yaX7si4g1U2UBS2h8W61CCBhU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vbEVaWjls/Mnp5VHNZTW5KVVBv/ZS1wR3lDTnV1SzZ4/bFg3dWtHYl9sbzZG/RS9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTl0/WkdjdS9hVzFuYVhn/dWJtVjBMMkZ6L2My/VjBjeTlwYldGblpY/TXYvWW05dmF5MWpi/M1psY2k1cS9jR2M)

This is **bold** text, this is *italic*, and here's a [link](https://reactnative.dev).
- Item 1
- Item 2
- Item 3

\`\`\`javascript
const greet = (name) => {
  return \`Hello, \${name}!\`;
};
console.log(greet("World"));
\`\`\`

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
print(greet("World"))
\`\`\`
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
