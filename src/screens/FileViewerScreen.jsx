import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const {height, width} = Dimensions.get('window');

export default function FileViewerScreen({navigation}) {
  const [files, setFiles] = useState([]);
  const [pdfLink, setPdfLink] = useState(
    'https://css4.pub/2017/newsletter/drylab.pdf',
  );

  useEffect(() => {
    handleGetFileList();
  }, []);

  async function handleGetFileList() {
    const path = RNFetchBlob.fs.dirs.DocumentDir + '/' + 'MyApp';

    await RNFetchBlob.fs
      .isDir(path)
      .then(isDir => {
        console.log('isDir', isDir);
        if (isDir == true) {
          RNFetchBlob.fs
            .lstat(path)
            .then(filesList => {
              console.log('filesList', filesList);
              setFiles(filesList);
            })
            .catch(e => {
              console.log('Unable to get files list', e);
            });
        }
      })
      .catch(e => {
        console.log('Error isDir', e);
      });
  }

  function handleDownloadFile() {
    console.log('Pdf downloader activated');
    const destinationPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + 'MyApp';
    const url = pdfLink;
    const fileName = Date.now();
    const fileExtention = url.split('.').pop();
    const fileFullName = fileName + '.' + 'fileExtention';
    console.log('fileName', fileName);
    console.log('fileExtention', fileName);
    console.log('fileName', fileFullName);
    RNFetchBlob.config({
      path: destinationPath + '/' + fileFullName,
      fileCache: true,
    })
      .fetch('GET', url)
      .then(res => {
        console.log('The file saved to ', res.path());
        handleGetFileList();
      });
  }

  function handleDeleteFiles() {
    const path = RNFetchBlob.fs.dirs.DocumentDir + '/' + 'MyApp';
    RNFetchBlob.fs
      .unlink(path)
      .then(() => {
        setFiles([]);
      })
      .catch(err => {});
  }

  function renderItem({item, index}) {
    console.log(item);
    return (
      <View style={styles.pdfContainer}>
        <View style={styles.insidePdfContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PdfScreen', {item});
            }}>
            <Text style={styles.textStyle}>{item.filename.split('.')[0]}</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => {
              requestStoragePermission();
            }}>
            <Icon name="download" size={50} color="#000" />
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View
        style={{flex: 4, alignItems: 'center', justifyContent: 'space-around'}}>
        <TouchableOpacity
          onPress={handleGetFileList}
          style={{
            height: 45,
            width: 150,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>Get the files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownloadFile}
          style={{
            height: 45,
            width: 150,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>Download the files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteFiles}
          style={{
            height: 45,
            width: 150,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>Delete all files</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.FlatlistStyle}>
        <FlatList
          data={files}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pdfContainer: {
    height: '40',
    width: '40',
    backgroundColor: '#cffcdb',
    borderRadius: 20,
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
  },
  insidePdfContainer: {
    justifyContent: 'space-between',
  },
  textStyle: {
    fontSize: 20,
    color: '#000',
  },
  FlatlistStyle: {
    flex: 6,
    alignItems: 'center',
  },
});
