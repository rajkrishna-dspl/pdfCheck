import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import {NavigationContainer} from '@react-navigation/native';
import PdfViewerScreen from './src/screens/PdfViewerScreen';
import FileViewerScreen from './src/screens/FileViewerScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="FileView" component={FileViewerScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PdfScreen" component={PdfViewerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
