import React from 'react';
//  import PropTypes
import PropTypes from 'prop-types';
//import necessary components from react-native
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
//import permissions and imagepicker
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// import firebase
const firebase = require('firebase');
require('firebase/firestore');

export default class CustomActions extends React.Component {
  constructor() {
    super();
  }

  //Allows access to photo library
  pickImage = async () => {
    // Asks user's permission to access media library
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY); //CAMERA_ROLL is deprecated

    if (status === 'granted') {
      // Launches local picture gallery to choose image from
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        //   only images are allowed
      }).catch((error) => console.error(error));
      // canceled process
      if (!result.cancelled) {
        // Uploads image to database and sends image in chat
        const imageUrl = await this.uploadImage(result.uri);
        this.props.onSend({ image: imageUrl, text: '' });
      }
    }
  };

  //Allows access to camera to take photo
  takePhoto = async () => {
    // Ask user's permission to access camera and media library
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.MEDIA_LIBRARY //CAMERA_ROLL is deprecated
    );
    try {
      if (status === 'granted') {
        // Launches camera and allows user to take a picture
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.error(error));

        // Uploads image to database and sends image in chat
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl, text: '' });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //Gets user location
  getLocation = async () => {
    try {
      const { status } = await Permissions.askAsync(
        Permissions.LOCATION_FOREGROUND
      ); //LOCATION is deprecated
      if (status === 'granted') {
        const result = await Location.getCurrentPositionAsync({}).catch(
          (error) => console.log(error)
        );
        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Upload image to Firebaes in blob format
  uploadImage = async (uri) => {
    // Convert image to blob format
    const blob = await new Promise((resolve, reject) => {
      // Creates new XMLHttp request
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (error) {
        console.log(error);
        reject(new TypeError('Network Request Failed'));
      };
      // Opens connection to receive image data and reponds as 'blob' type
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    try {
      // Creates unique file names for storage
      const imageNameBefore = uri.split('/');
      const imageName = imageNameBefore[imageNameBefore.length - 1];

      // References remote database storage (Firestore)
      const ref = firebase.storage().ref().child(`images/${imageName}`);
      const snapshot = await ref.put(blob);
      blob.close(); // Close connection
      const imageDownload = await snapshot.ref.getDownloadURL();
      return imageDownload;
    } catch (e) {
      console.log(e);
    }
  };

  // User clicks action button
  onActionPress = () => {
    // User gets options to choose from in ActionSheet
    const options = [
      'Choose From Library',
      'Take Picture',
      'Send Location',
      'Cancel',
    ];

    // Positions and displays ActionSheet
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            return this.pickImage();
          case 1:
            return this.takePhoto();
          case 2:
            return this.getLocation();
          default:
        }
      }
    );
  };

  render() {
    return (
      <TouchableOpacity
        style={[styles.container]}
        accessibilityLabel="Action button"
        accessibilityHint="Select an image to send, take a picture, or send your current location"
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
