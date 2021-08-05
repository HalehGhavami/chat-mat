import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: '', backColor: '#757083' };
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ImageBackground
          style={styles.imgBG}
          source={require('../assets/Background-image.png')}
        >
          <View style={styles.mainTitle}>
            <Text style={styles.title}>Chat Mat</Text>
          </View>
          <View style={styles.whiteBox}>
            <TextInput
              style={styles.nameInput}
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}
              placeholder="Type your name"
            />
            <View>
              <Text style={styles.colorText}>Choose Background Color:</Text>
              <View style={styles.backColor}>
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel="Very dark green background"
                  accessibilityHint="Choose background color"
                  accessibilityRole="button"
                  style={styles.colorSelection1}
                  onPress={() => this.setState({ backColor: '#090C08' })}
                />
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel="Very dark grayish violet background"
                  accessibilityHint="Choose background color"
                  accessibilityRole="button"
                  style={styles.colorSelection2}
                  onPress={() => this.setState({ backColor: '#474056' })}
                />
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel="Dark grayish blue background"
                  accessibilityHint="Choose background color"
                  accessibilityRole="button"
                  style={styles.colorSelection3}
                  onPress={() => this.setState({ backColor: '#8A95A5' })}
                />
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel="Grayish green background"
                  accessibilityHint="Choose background color"
                  accessibilityRole="button"
                  style={styles.colorSelection4}
                  onPress={() => this.setState({ backColor: '#B9C6AE' })}
                />
              </View>
            </View>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Start Chat"
              accessibilityHint="This lets you enter the chat with the name provided in the input."
              accessibilityRole="button"
              title="Go to Chat"
              style={
                (styles.startButton, { backgroundColor: this.state.backColor })
              }
              onPress={() =>
                this.props.navigation.navigate('Chat', {
                  name: this.state.name,
                  backColor: this.state.backColor,
                })
              }
            >
              <Text style={styles.startText}>Let's Chat!</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  nameInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderColor: '#8a8697',
    borderRadius: 2,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    paddingLeft: 15,
  },

  imgBG: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  mainTitle: {
    flex: 0.5,
    fontSize: 45,
  },

  title: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    top: 15,
    height: 60,
  },

  colorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757083',
    marginBottom: 10,
  },

  whiteBox: {
    minHeight: 260,
    height: '44%',
    backgroundColor: '#fff',
    width: '88%',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingLeft: '6%',
    paddingRight: '6%',
  },

  startButton: {
    height: 60,
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
  },

  backColor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  colorSelection1: {
    backgroundColor: '#090C08',
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  colorSelection2: {
    backgroundColor: '#474056',
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  colorSelection3: {
    backgroundColor: '#8A95A5',
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  colorSelection4: {
    backgroundColor: '#B9C6AE',
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  startText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 60,
  },
});
