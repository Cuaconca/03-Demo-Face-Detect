import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: 'https://hbttzdjj-3000.asse.devtunnels.ms/api/v1/home' }} 
        style={{ marginTop: 20 }} 
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
