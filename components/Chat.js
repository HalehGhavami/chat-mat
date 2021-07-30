import React, { Component } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

export default class Chat extends React.Component {
  render() {
    let name = this.props.route.params.name;
    // OR ...
    // let { name } = this.props.route.params;

    // display user's name in navigation bar at the top of Chat
    this.props.navigation.setOptions({ title: name });

    return (
      <View
        style={{ flex: 1, backgroundColor: this.props.route.params.backColor }}
      >
        <Button
          title="Go to Start"
          onPress={() => this.props.navigation.navigate('Start')}
        />
      </View>
    );
  }
}
