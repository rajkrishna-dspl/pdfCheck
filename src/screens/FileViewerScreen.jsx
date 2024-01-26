import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  PermissionsAndroid,
  ToastAndroid,
  Alert,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default function FileViewerScreen({navigation}) {
  const [files, setFiles] = useState([]);
  const [pdfLink, setPdfLink] = useState(
    'https://css4.pub/2017/newsletter/drylab.pdf',
  );
  const [pdfLink2, setPdfLink2] = useState(
    'https://www.africau.edu/images/default/sample.pdf',
  );
  const [item, setItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [isDownloaded, setIsDownloaded] = useState(new Map());
  const [downloadedPaths, setDownloadedPaths] = useState(new Map());
  const [conncetionStatus, setConnectionStatus] = useState(false);

  useEffect(() => {
    handleGetFileList();
    getDownloadedFiles();
    NetInfo.addEventListener(handleNetworkChange);
  }, []);

  const handleNetworkChange = state => {
    setConnectionStatus(state.isConnected);
  };

  const offlineOrOnline = link => {
    if (conncetionStatus) {
      requestStoragePermission(link);
    } else {
      Alert.alert(
        'You are offline, Please turn on your data and then download',
      );
    }
  };

  //<---------------------------------------------------------- Async Storage Operations --------------------------------------------------------------->
  //Getting the Downloaded File paths from the Async Storage
  const getDownloadedFiles = async () => {
    let items = await AsyncStorage.getItem('DownloadedFilePaths');
    let maps = await AsyncStorage.getItem('Map');

    items = JSON.parse(items);
    maps = JSON.parse(maps);

    if (items !== null) {
      setDownloadedPaths(new Map(items));
    }
    if (maps !== null) {
      setIsDownloaded(new Map(maps));
    }

    console.log('Downloaded File paths -> ', downloadedPaths);
    console.log('isDownloaded ->', isDownloaded);
    if (isDownloaded.get(pdfLink)) console.log('true');
    if (isDownloaded.get(pdfLink2)) console.log('true');
  };

  //Stored downloaded files path in Async Storage
  const storeInAsyncStorage = async (filePath, url) => {
    //Download Path map
    const result = new Map(downloadedPaths);
    result.set(url, filePath);
    const downLoadPathMap = JSON.stringify([...result]);

    //Download or not map
    const itemDownloaded = new Map(isDownloaded);
    itemDownloaded.set(url, true);
    const serializedMap = JSON.stringify([...itemDownloaded]); // Convert Map to array and then to JSON

    try {
      await AsyncStorage.setItem('DownloadedFilePaths', downLoadPathMap);
      await AsyncStorage.setItem('Map', serializedMap);
    } catch (error) {
      console.log('Error in storing in Async Storage', error);
    }
  };

  //Delete From Async Storage
  const deleteFromAsyncStorage = async () => {
    await AsyncStorage.clear();
    setDownloadedPaths([]);
    setIsDownloaded(new Map());
    console.log('Clear Async Storage');
  };

  //<----------------------------------------------------- Get all the Downloaded files from the Paths ------------------------------------------------->
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
              //console.log('filesList', filesList);
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

  // <------------------------------------------------------------ Downloader Section ------------------------------------------------------------->
  //Downloader permission for device
  const requestStoragePermission = async url => {
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
        handleDownloadFile(url);
      } else {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  //Dowonloader Function
  function handleDownloadFile(url) {
    console.log('Pdf downloader activated');
    setLoading(true); // Set global loading to true when download starts

    const destinationPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + 'MyApp';
    //const url = pdfLink;
    const fileName = Date.now();
    const fileExtention = url.split('.').pop();
    const fileFullName = fileName + '.' + 'fileExtention';
    console.log('fileName', fileName);
    console.log('fileExtention', fileName);
    console.log('fileName', fileFullName);

    const itemLoadingStates = {...loadingStates};
    itemLoadingStates[url] = true; // Set loading for the specific item to true
    setLoadingStates(itemLoadingStates);

    RNFetchBlob.config({
      path: destinationPath + '/' + fileFullName,
      fileCache: true,
    })
      .fetch('GET', url)
      .then(res => {
        console.log('The file saved to ', res.path());
        //setDownloadedPaths([...downloadedPaths, res.path()]);
        storeInAsyncStorage(res.path(), url);
        handleGetFileList();
        getDownloadedFiles();
      })
      .finally(() => {
        setLoading(false); // Set global loading to false when download completes

        const itemLoadingStates = {...loadingStates};
        itemLoadingStates[url] = false; // Set loading for the specific item to false
        setLoadingStates(itemLoadingStates);

        ToastAndroid.show('File Successfully Downloaded', ToastAndroid.LONG);
      });
  }

  //<-------------------------------------------------- Delete functions ------------------------------------------------------------------>
  //DELETE ALL THE FILES
  function handleDeleteFiles() {
    const path = RNFetchBlob.fs.dirs.DocumentDir + '/' + 'MyApp';
    RNFetchBlob.fs
      .unlink(path)
      .then(() => {
        setFiles([]);
      })
      .catch(err => {});
  }

  //DELETE SELECTED FILES
  function deleteSelectedFiles(path, url) {
    RNFetchBlob.fs
      .unlink(path)
      .then(handleGetFileList)
      .then(() => {
        isDownloaded.delete(url);
        downloadedPaths.delete(url);
      })
      .finally(() => {
        AsyncStorage.setItem('Map', JSON.stringify([...isDownloaded]));
        AsyncStorage.setItem(
          'DownloadedFilePaths',
          JSON.stringify([...downloadedPaths]),
        );
        ToastAndroid.show(
          'Your pdf is deleted from storage successfully',
          ToastAndroid.LONG,
        );
      })
      .catch(err => {});
  }

  //<------------------------------------------------------ All the downloaded file rendering function ----------------------------------------------->
  function renderItem({item, index}) {
    //console.log(item);
    return (
      <View style={styles.pdfContainer}>
        <View style={styles.insidePdfContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PdfScreen', {item, pdfLink});
            }}>
            <Text style={styles.textStyle}>{item.filename.split('.')[0]}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      {/* sample pdf file 1 */}
      <View style={styles.pdfContainer}>
        <View style={styles.insidePdfContainer}>
          {isDownloaded.get(pdfLink) ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PdfScreen', {
                    item: downloadedPaths.get(pdfLink),
                    pdfLink: '',
                  });
                }}>
                <Text style={styles.textStyle}>DryLab News</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ButtonStyle}
                onPress={() =>
                  deleteSelectedFiles(downloadedPaths.get(pdfLink), pdfLink)
                }>
                <Icon name="delete" size={30} color="#000" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PdfScreen', {item, pdfLink});
                }}>
                <Text style={styles.textStyle}>DryLab News</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ButtonStyle}
                onPress={() => {
                  if (
                    !loadingStates[
                      'https://css4.pub/2017/newsletter/drylab.pdf'
                    ]
                  ) {
                    offlineOrOnline(pdfLink);
                  }
                }}>
                {loadingStates[
                  'https://css4.pub/2017/newsletter/drylab.pdf'
                ] ? (
                  <ActivityIndicator
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 9999,
                    }}
                    size="small"
                    color="#000"
                  />
                ) : (
                  <Icon name="download" size={30} color="#000" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* sample pdf file 2 */}
      <View style={styles.pdfContainer}>
        <View style={styles.insidePdfContainer}>
          {isDownloaded.get(pdfLink2) ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PdfScreen', {
                    item: downloadedPaths.get(pdfLink2),
                    pdfLink: '',
                  });
                }}>
                <Text style={styles.textStyle}>Sample Pdf files</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ButtonStyle}
                onPress={() => {
                  deleteSelectedFiles(downloadedPaths.get(pdfLink2), pdfLink2);
                }}>
                <Icon name="delete" size={30} color="#000" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PdfScreen', {item, pdfLink: pdfLink2});
                }}>
                <Text style={styles.textStyle}>Sample Pdf files</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ButtonStyle}
                onPress={() => {
                  if (
                    !loadingStates[
                      'https://www.africau.edu/images/default/sample.pdf'
                    ]
                  ) {
                    offlineOrOnline(pdfLink2);
                  }
                }}>
                {loadingStates[
                  'https://www.africau.edu/images/default/sample.pdf'
                ] ? (
                  <ActivityIndicator
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 9999,
                    }}
                    size="small"
                    color="#000"
                  />
                ) : (
                  <Icon name="download" size={30} color="#000" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* render the downloaded files */}
      {/* <View style={styles.FlatlistStyle}>
        <FlatList
          data={files}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
        />
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pdfContainer: {
    height: '40',
    width: '40',
    backgroundColor: '#cffcdb',
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    padding: 10,
    margin: 10,
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
  insidePdfContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ButtonStyle: {
    marginRight: 10,
  },
  textStyle: {
    fontSize: 20,
    color: '#000',
  },
});
