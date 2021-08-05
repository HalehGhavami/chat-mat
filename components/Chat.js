import React from 'react';

// import Gifted Chat and Bubble
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';

// import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// import NetInfo
import NetInfo from '@react-native-community/netinfo';

// import KeyboardAvoidingView is only necessary for users running the app on Android
import {
  View,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  LogBox,
  Alert,
} from 'react-native';

// Google Firebase
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
    };

    // The web app's Firebase configuration
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
    // References Firebase messages
    this.referenceChatMessages = firebase.firestore().collection('messages');
    //Ignore's timer warnings
    LogBox.ignoreLogs(['Setting a timer']);
  }

  // Sets the state, and shows static message with the user's name
  componentDidMount() {
    const { name } = this.props.route.params;
    // display user's name in navigation bar at the top of Chat
    this.props.navigation.setOptions({ title: `${name}` });
    // Check user connection
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        // Reference to load messages via Firebase
        this.referenceChatMessages = firebase
          .firestore()
          .collection('messages');
        // Authenticates user via Firebase
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            // Add user to state
            this.setState({
              isConnected: true,
              uid: user.uid,
              user: {
                _id: user.uid,
                name: name,
                avatar: 'https://placeimg.com/140/140/any',
              },
              messages: [],
            });
            // Listener for collection changes for current user
            this.unsubscribe = this.referenceChatMessages
              .orderBy('createdAt', 'desc')
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        this.setState({ isConnected: false });
        this.getMessages();
        Alert.alert(
          'No internet connection detected | Unable to send messages'
        );
      }
    });
  }

  // Stop receiving updates about a collection
  componentWillUnmount() {
    // Stops listening for authentication
    this.unsubscribe();
    // Stops listening for changes
    this.authUnsubscribe();
  }

  // Updates messages state
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
    this.setState({ messages });
  };

  // Retrieve messages from client-side storage
  async getMessages() {
    let messages = '';
    try {
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // Saves messages in client-side storage
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        'messages',
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  // Delete messages in client-side storage
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  // Adds messages to cloud storage
  addMessages = () => {
    // Appends message info to the messages state
    const message = this.state.messages[0];

    // Adds message information to the firestore DB
    this.referenceChatMessages.add({
      _id: message._id,
      uid: this.state.uid,
      createdAt: message.createdAt,
      text: message.text || null,
      user: message.user,
    });
  };

  // Event handler for sending messages
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // onSend calls addMessages and includes it to DB and messages state
        this.addMessages();
        this.saveMessages();
      }
    );
  }

  // Renders message input only when app is online
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  // Renders sender's chat bubble with custom styles
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
    const { messages, user } = this.state;
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
          messages={messages}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderUsernameOnMessage={true}
          onSend={(messages) => this.onSend(messages)}
          user={user}
          // user={{
          //   _id: this.state.uid,
          //   avatar: 'https://placeimg.com/140/140/any',
          //   name: name,
          // }}
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
