import React from "react";
import { TouchableHighlight, StyleSheet, View, Text } from "react-native";
import { SecureStore } from "expo";

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: "User Settings"
  };

  _signOutAsync = async () => {
    await SecureStore.deleteItemAsync("Bearer");
    this.props.navigation.navigate("Auth");
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={this._signOutAsync}>
          <Text style={styles.padTopAndBottom}>Sign Out</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  padTopAndBottom: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold"
  }
});
