import React from "react";
import { StyleSheet, Text, TextInput, View, Picker } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Location, Permissions, MapView } from "expo";
import { mapStyle } from "./MapStyle";
export default class HomeScreen extends React.Component {
  state = {
    location: { latitude: 1.2834925, longitude: 103.8465903 },
    errorMessage: null,
    places: [],
    text: "",
    searchOption: "name"
  };

  static navigationOptions = {
    header: null
  };

  populateMarkers = places => {
    if (!places) {
      this.setState({
        errorMessage: "No Places Found"
      });
      return;
    }
    return places.map((marker, index) => {
      return (
        <MapView.Marker
          key={index}
          title={marker.name}
          coordinate={{
            latitude: marker.location.coordinates[1] || 0,
            longitude: marker.location.coordinates[0] || 0
          }}
          pinColor="blue">
          <MapView.Callout>
            <Text style={styles.titleText}>
              {marker.recommend === "Unknown" ? (
                <AntDesign
                  name="closecircle"
                  style={styles.icon}
                  size={20}
                  color="blue"
                />
              ) : (
                <AntDesign
                  name="checkcircle"
                  style={styles.icon}
                  size={20}
                  color="orange"
                />
              )}{" "}
              {marker.recommend === "Yes" ? (
                <AntDesign
                  name="smile-circle"
                  style={styles.icon}
                  size={20}
                  color="orange"
                />
              ) : (
                ""
              )}{" "}
              {marker.recommend === "No" ? (
                <AntDesign
                  name="frown"
                  style={styles.icon}
                  size={20}
                  color="blue"
                />
              ) : (
                ""
              )}{" "}
              {marker.name}
            </Text>
            <Text style={styles.text}>Notes: {marker.notes}</Text>
            <Text style={styles.text}>Address: {marker.address}</Text>
          </MapView.Callout>
        </MapView.Marker>
      );
    });
  };

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  _getPlacesAsync = async () => {
    try {
      let places = await fetch(
        "https://foodnotes-api.herokuapp.com/api/v1/places",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );

      let responseJson = await places.json();

      this.setState({ places: responseJson });
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
    }
  };
  handleSubmit = async () => {
    const { text, searchOption } = this.state;
    const unitNoRegex = /#\d+-*\d+/g;
    const countryRegex = /Singapore/i;
    let newLocation = text.replace(unitNoRegex, "");
    if (newLocation.search(countryRegex) === -1) {
      newLocation = newLocation + ", Singapore";
    }
    if (searchOption === "location") {
      try {
        const geocoords = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${newLocation}&key=bb189808d69341ac907c35d5dc7c3b7a`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            }
          }
        );

        const responseJson = await geocoords.json();
        if (
          !responseJson.results.length > 0 ||
          !responseJson.results[0].annotations.timezone.name ===
            "Asia/Singapore"
        ) {
          throw new Error("No place found for geocoords");
        }
        const place = responseJson.results[0];
        this.setState({
          location: {
            latitude: place.geometry.lat,
            longitude: place.geometry.lng
          }
        });
      } catch (error) {
        alert(error.message);
      }
    }
    try {
      const places = await fetch(
        `https://foodnotes-api.herokuapp.com/api/v1/places?${searchOption}=${text}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      const responseJson = await places.json();
      if (!responseJson) {
        throw new Error("No places found");
      }
      if (!Array.isArray(responseJson)) {
        const result = [];
        result.push(responseJson);
        this.setState({ places: result });
      }
      this.setState({ places: responseJson });
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
    }
  };

  componentDidMount() {
    this._getLocationAsync();
    this._getPlacesAsync();
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={{ flex: 1 }}
          customMapStyle={mapStyle}
          region={{
            latitude: this.state.location.latitude,
            longitude: this.state.location.longitude,
            latitudeDelta: 0.007,
            longitudeDelta: 0.007
          }}>
          <MapView.Marker
            draggable
            coordinate={this.state.location}
            pinColor="orange"
            title="LOCATION"
            onDragEnd={e =>
              this.setState({ location: e.nativeEvent.coordinate })
            }
          />
          {this.populateMarkers(this.state.places)}
        </MapView>
        <MapView.Callout>
          <View style={styles.calloutView}>
            <Picker
              selectedValue={this.state.searchOption}
              style={styles.picker}
              onValueChange={itemValue =>
                this.setState({ searchOption: itemValue })
              }>
              <Picker.Item label="By Name" value="name" />
              <Picker.Item label="By Notes" value="notes" />
              <Picker.Item label="Change Location" value="location" />
            </Picker>
            <TextInput
              style={styles.calloutSearch}
              onSubmitEditing={this.handleSubmit}
              onChangeText={text => this.setState({ text })}
              placeholder={"Search"}
            />
          </View>
        </MapView.Callout>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffcc00"
  },
  text: { fontSize: 15 },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    maxWidth: 300
  },
  icon: {
    paddingLeft: 20,
    paddingRight: 20
  },
  calloutView: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    marginLeft: 50,
    width: 300,
    marginRight: 10,
    marginTop: 50
  },
  calloutSearch: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: "transparent",
    marginLeft: 10,
    width: 300,
    marginRight: 10,
    height: 40,
    borderWidth: 0.0
  },
  picker: {
    width: 50,
    height: 40
  },
  scrollView: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10
  },
  endPadding: {
    paddingRight: 10
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: 200,
    width: 150,
    overflow: "hidden"
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center"
  },
  textContent: {
    flex: 1
  },
  cardtitle: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "bold"
  },
  cardDescription: {
    fontSize: 12,
    color: "#444"
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)"
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130,4,150, 0.3)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(130,4,150, 0.5)"
  },
  introText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 200,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  introContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  introText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  }
});
