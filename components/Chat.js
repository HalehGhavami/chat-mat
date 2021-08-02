import React from 'react';

// import Gifted Chat and Bubble
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

// import KeyboardAvoidingView is only necessary for users running the app on Android
import {
  View,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  LogBox,
} from 'react-native';

const firebase = require('firebase');
require('firebase/firestore');

// The web app's Firebase configuration

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
      },
    };

    const firebaseConfig = {
      apiKey: 'AIzaSyCHTdlkmSzdEwwf6IgFGLlv3QNvGTyP0rQ',
      authDomain: 'chatmat-1c2ec.firebaseapp.com',
      projectId: 'chatmat-1c2ec',
      storageBucket: 'chatmat-1c2ec.appspot.com',
      messagingSenderId: '667172459775',
      appId: '1:667172459775:web:1883d634967a45d25128ca',
      measurementId: 'G-ZH52SVMQQS',
    };
    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    // firebase.analytics();

    this.referenceChatMessages = firebase.firestore().collection('messages');
    LogBox.ignoreLogs(['Setting a timer']);
  }

  // Sets the state, and shows static message with the user's name
  componentDidMount() {
    const { name } = this.props.route.params;
    // display user's name in navigation bar at the top of Chat
    this.props.navigation.setOptions({ title: `${name}` });
    // authenticate users with Firestore
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }

      // update user state with currently active user data
      this.setState({
        _id: user.uid,
        name: name,
        messages: [],
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  // Stop receiving updates about a collection
  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();
  }

  // Add name and messages to the state and DB
  addMessages = () => {
    // Appends message info to the messages state
    const message = this.state.messages[0];

    // Adds message information to the firestore DB
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text,
      user: message.user,
    });
  };

  //retrieve the current data in  collection and store it in your state messages
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach(async (doc) => {
      // get the QueryDocumentSnapshot's data
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  //when a user send a message this function will be called
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // onSend calls addMessages and includes it to DB and messages state
        this.addMessages();
      }
    );
  }

  // RenderBubble inherits the props from Bubble and changes the wrapperStyle +
  // textStyle of the Bubble element on the GiftedChat component
  renderBubble(props) {
    return (
      <Bubble
        // Inherit props
        {...props}
        // Change chats bubble by modifying the wrapperStyle background color
        wrapperStyle={{
          // Left bubble
          left: {
            backgroundColor: '#610480',
          },
          // Right bubble
          right: {
            backgroundColor: '#808080',
          },
        }}
        // Text style of the bubble
        textStyle={{
          left: {
            color: 'white',
            fontWeight: 'bold',
            fontStyle: 'italic',
          },
          right: {
            color: 'black',
            fontWeight: 'bold',
          },
        }}
      />
    );
  }

  render() {
    const { name } = this.props.route.params;
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: this.props.route.params.backColor },
        ]}
      >
        <GiftedChat
          // Renders custom bubble
          renderBubble={this.renderBubble.bind(this)}
          // Renders state messages
          messages={this.state.messages}
          // Appends last sent messages to the current message state and displays all the messages
          onSend={(messages) => this.onSend(messages)}
          user={{ _id: this.state.uid, name: name }}
        />
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
