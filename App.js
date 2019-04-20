import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { AppLoading, Asset, Font, Icon } from "expo";
import AppNavigator from "./navigation/AppNavigator";
import Context from "./Context";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this._getPlacesAsync = async (showOnlyOpen, searchOption, text) => {
      let url = "https://foodnotes-api.herokuapp.com/api/v1/places";

      if (searchOption && text) {
        url += `?${searchOption}=${text}`;
        if (showOnlyOpen) {
          url += "&time=now";
        }
      } else {
        if (showOnlyOpen) {
          url += "?time=now";
        }
      }
      try {
        const places = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        });

        let responseJson = await places.json();
        if (!responseJson) {
          throw new Error("No places found");
        }
        if (!Array.isArray(responseJson)) {
          const result = [];
          result.push(responseJson);
          responseJson = result;
        }
        let value = {
          places: responseJson,
          error: null,
          displaySpinner: false,
          _getPlacesAsync: this._getPlacesAsync
        };
        this.setState({ value });
      } catch (error) {
        this.setState({
          value: {
            places: this.state.value.places,
            error: error.message,
            displaySpinner: false,
            _getPlacesAsync: this._getPlacesAsync
          }
        });
      }
    };

    this.state = {
      isLoadingComplete: false,
      value: {
        places: [],
        error: null,
        displaySpinner: true,
        _getPlacesAsync: this._getPlacesAsync
      }
    };
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === "ios" && <StatusBar barStyle="default" />}
          <Context.Provider value={this.state.value}>
            <AppNavigator />
          </Context.Provider>
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([require("./assets/images/logo.png")]),
      Asset.loadAsync([require("./assets/images/auth.png")]),
      Font.loadAsync({
        ...Icon.Ionicons.font,
        nunito: require("./assets/fonts/Nunito-Medium.ttf"),
        "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf")
      })
    ]);
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    try {
      this._getPlacesAsync();
    } catch (err) {
      this.setState({
        value: {
          error: "Sorry, something went wrong while fetching the places."
        }
      });
    }
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
