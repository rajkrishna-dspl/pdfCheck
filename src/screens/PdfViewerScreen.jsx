import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React from 'react';
import Pdf from 'react-native-pdf';

const PdfViewerScreen = ({route}) => {
  const {item} = route.params;

  return (
    <View style={styles.container}>
      <Pdf
        style={styles.pdfStyle}
        trustAllCerts={false}
        minScale={0.5}
        maxScale={2}
        renderActivityIndicator={() => (
          <ActivityIndicator color="#000" size="large" />
        )}
        source={{
          uri: 'file://' + item.path,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdfStyle: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

export default PdfViewerScreen;
