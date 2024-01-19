import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'rn-fetch-blob';

const HomeScreen = ({navigation}) => {
  const [pdfLink, setPdfLink] = useState(
    'https://css4.pub/2017/newsletter/drylab.pdf',
  );

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Download Permission',
          message:
            'This App needs your permission' +
            'so that you can view this PDF when offline',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        downloadFile();
      } else {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const downloadFile = async () => {
    const {config, fs} = RNFetchBlob;
    const fileDir = fs.dirs.DocumentDir;
    const date = new Date();
    const dirExists = await fs.exists(fileDir);
    console.log(dirExists);

    //If it doesn't exist, create it
    //if (!dirExists) await fs.mkdir(fileDir);

    try {
      config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path:
            fileDir + '/document_' + Math.random(date.getDate() / 2) + '.xyzzz',
          description: 'file download',
        },
      })
        .fetch('GET', pdfLink, {
          //some headers ..
        })
        .then(res => {
          // the temp file path
          console.log('The file saved to ', res.path());
          Alert.alert('File downloaded successfully');
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.pdfContainer}>
        <View style={styles.insidePdfContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PdfScreen', {pdfLink});
            }}>
            <Text style={styles.textStyle}>Online Pdf</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              requestStoragePermission();
            }}>
            <Icon name="download" size={50} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('FileView');
        }}>
        <Text style={{fontSize: 50}}>File Viewer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: '4%',
    alignContent: 'center',
  },
  pdfContainer: {
    height: '10%',
    width: '100%',
    backgroundColor: '#cffcdb',
    borderRadius: 20,
    justifyContent: 'center',
    padding: 10,
  },
  insidePdfContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textStyle: {
    fontSize: 40,
    color: '#000',
  },
});

export default HomeScreen;
