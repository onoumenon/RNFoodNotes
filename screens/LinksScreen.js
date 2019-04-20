import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Picker,
  TextInput,
  Image,
  Modal,
  TouchableHighlight,
  Alert,
  ImageBackground,
  TouchableOpacity
} from "react-native";
import { Container, Content, Card, CardItem, Body, Text } from "native-base";
import { SecureStore } from "expo";
import DateTimePicker from "react-native-modal-datetime-picker";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { AntDesign } from "@expo/vector-icons";
import * as Joi from "react-native-joi";
import {
  daysOff,
  convertNumberToTime,
  convertTimeToNumber
} from "./OpeningHoursHelper";

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    displaySpinner: true,
    token: null,
    isDateTimePickerVisible: false,
    errorMessage: "",
    disabled: true,
    places: [],
    location: { latitude: 1.2834925, longitude: 103.8465903 },
    text: "",
    searchOption: "name",
    selectedField: "",
    modalVisible: false,
    place: {
      name: "",
      uri: "",
      notes: "",
      address: "",
      openingHours: {
        open: 0,
        close: 0,
        off: []
      },
      contact: "",
      recommend: "Unknown"
    },
    error: {
      name: "",
      uri: "",
      notes: "",
      address: "",
      contact: "",
      recommend: ""
    }
  };

  schema = {
    name: Joi.string().required(),
    uri: Joi.string().uri(),
    notes: Joi.string(),
    address: Joi.string().required(),
    contact: Joi.string(),
    recommend: Joi.string()
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  async componentDidMount() {
    try {
      await this._getTokenpAsync();
      await this._getPlacesAsync();
    } catch (err) {
      alert(err.message);
    }
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = date => {
    try {
      const fieldName = this.state.selectedField;
      const hour = date.getHours();
      const minutes = date.getMinutes();
      const number = convertTimeToNumber(hour, minutes);
      let copy = { ...this.state.place };
      copy.openingHours[fieldName] = number;
      this.setState({ place: copy });
      this._hideDateTimePicker();
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
  };

  _getTokenpAsync = async () => {
    const token = await SecureStore.getItemAsync("Bearer");
    this.setState({ token });
  };

  _getPlacesAsync = async () => {
    try {
      let places = await fetch(
        `https://foodnotes-api.herokuapp.com/api/v1/places?location=${
          this.state.location.latitude
        }&location=${this.state.location.longitude}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      let responseJson = await places.json();
      this.setState({ places: responseJson, displaySpinner: false });
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
    }
  };

  displayTime = fieldName => {
    let time = "Click Here";
    try {
      time = convertNumberToTime(this.state.place.openingHours[fieldName]);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    return time;
  };

  setPlace = async name => {
    if (!name) {
      return;
    }
    try {
      let place = await fetch(
        `https://foodnotes-api.herokuapp.com/api/v1/places?getOne=${name}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      let responseJson = await place.json();
      this.setState({ place: responseJson });
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
    }
  };

  revertPlaceState = () => {
    try {
      const place = {
        name: "",
        uri: "",
        notes: "",
        address: "",
        openingHours: {
          open: 0,
          close: 0,
          off: []
        },
        contact: "",
        recommend: "Unknown"
      };
      this.setState({ place });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
  };

  deleteFunction = async () => {
    try {
      const _id = this.state.place._id;
      const bearer = this.state.token;
      let place = await fetch(
        `https://foodnotes-api.herokuapp.com/api/v1/places/${_id ? _id : ""}`,
        {
          method: "DELETE",
          withCredentials: true,
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: bearer,
            "Content-Type": "application/json"
          }
        }
      );
      let responseJson = await place.json();
      if (responseJson === "Success") {
        this._getPlacesAsync();
        alert("Place Successfully Deleted");
        this.setModalVisible(!this.state.modalVisible);
      }
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
      alert(`${error.message} Please Try Again.`);
    }
  };

  handleDelete = () => {
    Alert.alert(
      "Warning",
      "Are you sure you want to delete this place?",
      [
        {
          text: "Cancel",
          onPress: () => {
            return;
          },
          style: "cancel"
        },
        { text: "OK", onPress: () => this.deleteFunction() }
      ],
      { cancelable: false }
    );
  };

  handleEdit = async () => {
    const errors = this.validateForm();
    const bearer = "Bearer " + this.state.token;
    if (errors) {
      alert(errors);
      this.revertPlaceState();
      this._getPlacesAsync();
      return;
    }
    let fetchMethod = "PUT";

    const _id = this.state.place._id;
    if (_id === undefined) {
      fetchMethod = "POST";
    }

    try {
      let place = await fetch(
        `https://foodnotes-api.herokuapp.com/api/v1/places/${_id ? _id : ""}`,
        {
          method: fetchMethod,
          withCredentials: true,
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: bearer,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.state.place)
        }
      );
      let responseJson = await place.json();
      if (responseJson !== "Success") {
        throw new Error(responseJson);
      }

      this._getPlacesAsync();
      this.revertPlaceState();
      alert("Success!");
      this.setModalVisible(!this.state.modalVisible);
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
      this.setModalVisible(!this.state.modalVisible);
      alert(`${error.message} Please Try Again.`);
      this.revertPlaceState();
    }
  };

  handleOnChange = (text, fieldName) => {
    const copy = { ...this.state.place };
    copy[fieldName] = text;
    this.setState({ place: copy });
    this.validateField(fieldName, text);
  };

  handleDaysChange = selectedDays => {
    try {
      const place = { ...this.state.place };
      place.openingHours.off = selectedDays;
      this.setState({ place });
    } catch (error) {
      this.setState({ errorMessage: error.message });
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
          throw new Error("No geo-coordinates found for address");
        }
        const place = responseJson.results[0];
        this.setState({
          location: {
            latitude: place.geometry.lat,
            longitude: place.geometry.lng
          }
        });
        this._getPlacesAsync();
        return;
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

  populateList = places => {
    if (!places) {
      this.setState({
        errorMessage: "No Places Found"
      });
    }
    return places.map((marker, index) => {
      const uri = marker.uri || "https://i.imgur.com/6WK0wKa.png";
      return (
        <View key={index}>
          <Card style={styles.card}>
            <Image
              source={{ uri: `${uri}` }}
              style={{
                height: 200,
                width: null,
                flex: 1,
                resizeMode: "cover"
              }}
            />
            <CardItem
              button
              onPress={() => {
                this.setModalVisible(true);
                this.setPlace(marker.name);
              }}>
              <Body>
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
              </Body>
            </CardItem>
          </Card>
        </View>
      );
    });
  };

  validateField = (fieldName, value) => {
    const schema = { [fieldName]: this.schema[fieldName] };
    Joi.validate({ [fieldName]: value }, schema, err => {
      const error = { ...this.state.error };
      if (err) {
        error[fieldName] = err.details[0].message;
        this.setState({ error });
        this.setState({ disabled: true });
      } else {
        error[fieldName] = "";
        this.setState({ error });
        if (!this.state.place.address || !this.state.place.name) {
          this.setState({ disabled: true });
          return;
        }
        this.setState({ disabled: false });
      }
    });
  };

  validateForm = () => {
    const options = { abortEarly: false };
    Joi.validate(this.state.place, this.schema, options, (err, value) => {
      if (err) {
        const errors = err.details.map(error => error.message).join(", ");
        this.setState({ disabled: true });
        return errors;
      } else {
        this.setState({ disabled: false });
      }
    });
  };

  render() {
    return this.state.displaySpinner ? (
      <ImageBackground
        source={require("../assets/images/splash.png")}
        style={[styles.horizontal, styles.container]}>
        <ActivityIndicator
          style={styles.spinner}
          animating={this.state.displaySpinner}
          size={100}
          color="#ffce49"
        />
      </ImageBackground>
    ) : (
      <View style={styles.container}>
        <DateTimePicker
          mode="time"
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />
        <Modal
          transparent={false}
          animationType="slide"
          visible={this.state.modalVisible}
          onRequestClose={() => {
            alert("Modal has been closed.");
          }}>
          <ScrollView style={{ flex: 1, minHeight: "100%" }}>
            <View style={{ marginTop: 20 }}>
              <View style={styles.modal}>
                <Text style={styles.titleText}>
                  {this.state.place._id ? "Edit An Entry" : "Create An Entry"}
                </Text>

                <View>
                  <Text
                    style={
                      this.state.error.name
                        ? styles.formLabelRed
                        : styles.formLabel
                    }>
                    {this.state.error.name
                      ? `${this.state.error.name}`
                      : "Name:"}
                  </Text>
                  <View
                    style={
                      this.state.error.name
                        ? styles.formfieldRed
                        : styles.formfield
                    }>
                    <TextInput
                      numberOfLines={1}
                      style={styles.text}
                      autoCapitalize="words"
                      defaultValue={this.state.place.name}
                      onChangeText={text => this.handleOnChange(text, "name")}
                      placeholder={"Name of Place"}
                    />
                  </View>
                </View>

                <View>
                  <Text
                    style={
                      this.state.error.address
                        ? styles.formLabelRed
                        : styles.formLabel
                    }>
                    {this.state.error.address
                      ? `${this.state.error.address}`
                      : "Address:"}
                  </Text>
                  <View
                    style={
                      this.state.error.address
                        ? styles.formfieldRed
                        : styles.formfield
                    }>
                    <TextInput
                      numberOfLines={1}
                      style={styles.text}
                      autoCapitalize="words"
                      defaultValue={this.state.place.address}
                      onChangeText={text =>
                        this.handleOnChange(text, "address")
                      }
                      placeholder={"Address of Place"}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Opening Time:</Text>
                  <View style={styles.formfield}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({ selectedField: "open" });
                        this._showDateTimePicker();
                      }}>
                      <Text>Open Time Picker | {this.displayTime("open")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Closing Time:</Text>
                  <View style={styles.formfield}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({ selectedField: "close" });
                        this._showDateTimePicker();
                      }}>
                      <Text>
                        Open Time Picker | {this.displayTime("close")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Days Off:</Text>
                  <View style={styles.formfield}>
                    <SectionedMultiSelect
                      items={daysOff}
                      uniqueKey="id"
                      subKey="children"
                      selectText="Choose Days Off"
                      showDropDowns={true}
                      readOnlyHeadings={true}
                      onSelectedItemsChange={this.handleDaysChange}
                      selectedItems={this.state.place.openingHours.off}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Recommend?</Text>
                  <View style={styles.formfield}>
                    <Picker
                      selectedValue={this.state.place.recommend}
                      style={styles.formPicker}
                      mode="dropdown"
                      onValueChange={itemValue =>
                        this.handleOnChange(itemValue, "recommend")
                      }>
                      <Picker.Item label="Yes" value="Yes" />
                      <Picker.Item label="No" value="No" />
                      <Picker.Item label="Not tried" value="Unknown" />
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Notes:</Text>
                  <View style={styles.formfield}>
                    <TextInput
                      numberOfLines={2}
                      autoCapitalize="words"
                      style={styles.text}
                      defaultValue={this.state.place.notes}
                      onChangeText={text => this.handleOnChange(text, "notes")}
                      placeholder={"Write Your Notes Here"}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Image:</Text>
                  <View style={styles.formfield}>
                    <TextInput
                      numberOfLines={1}
                      style={styles.text}
                      defaultValue={this.state.place.uri}
                      onChangeText={text => this.handleOnChange(text, "uri")}
                      placeholder={"Image Url"}
                    />
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <TouchableHighlight
                    disabled={this.state.disabled}
                    style={
                      this.state.disabled
                        ? styles.buttonDisabled
                        : styles.buttonYellow
                    }
                    onPress={() => {
                      this.handleEdit();
                    }}>
                    <Text style={styles.padTop}> Submit </Text>
                  </TouchableHighlight>
                  {this.state.place._id ? (
                    <TouchableHighlight
                      style={styles.buttonRed}
                      onPress={() => {
                        this.handleDelete();
                      }}>
                      <Text style={styles.padTop}> Delete </Text>
                    </TouchableHighlight>
                  ) : null}
                </View>
                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}>
                  <Text style={styles.padTopAndBottom}>Close</Text>
                </TouchableHighlight>
              </View>
            </View>
          </ScrollView>
        </Modal>
        <View style={styles.calloutView}>
          <Picker
            selectedValue={this.state.searchOption}
            style={styles.picker}
            onValueChange={itemValue =>
              this.setState({ searchOption: itemValue })
            }>
            <Picker.Item label="By Name" value="name" />
            <Picker.Item label="By Notes" value="notes" />
            <Picker.Item label="By Location" value="location" />
          </Picker>
          <TextInput
            style={styles.calloutSearch}
            onSubmitEditing={this.handleSubmit}
            onChangeText={text => this.setState({ text })}
            placeholderTextColor="orange"
            placeholder={"Search"}
          />
        </View>

        <Container style={styles.card}>
          <Content>
            <ScrollView style={{ flex: 1, minHeight: "100%" }}>
              {this.populateList(this.state.places)}
            </ScrollView>
          </Content>
        </Container>

        <View style={styles.footerView}>
          <Text>{this.state.errorMessage}</Text>
          <TouchableHighlight
            style={styles.buttonYellow}
            onPress={() => {
              this.setModalVisible(true);
              this.revertPlaceState();
            }}>
            <Text style={styles.padTop}> Create New </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#ffce49"
  },
  formLabel: {
    position: "relative",
    top: 17,
    left: 20
  },
  formLabelRed: {
    position: "relative",
    top: 17,
    left: 20,
    color: "red"
  },
  modal: {
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  text: { fontSize: 16 },
  buttonYellow: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#ffce49",
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    height: 30,
    width: 250,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonRed: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#ff563f",
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    height: 30,
    width: 250,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonDisabled: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#bfbdbb",
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    height: 30,
    width: 250,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  padTop: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold"
  },
  padTopAndBottom: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold"
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    maxWidth: 300
  },
  icon: {
    marginLeft: 20,
    marginRight: 20
  },
  card: {
    width: "90%",
    alignSelf: "center",
    justifyContent: "center"
  },
  formfield: {
    borderColor: "grey",
    borderWidth: 0.5,
    flexDirection: "row",
    padding: 5,
    paddingLeft: 20,
    borderRadius: 10,
    marginLeft: 10,
    width: 300,
    marginRight: 10,
    marginTop: 20
  },
  formfieldRed: {
    borderColor: "red",
    borderWidth: 0.7,
    flexDirection: "row",
    padding: 5,
    paddingLeft: 20,
    borderRadius: 10,
    marginLeft: 10,
    width: 300,
    marginRight: 10,
    marginTop: 20
  },
  footerView: {
    backgroundColor: "transparent",
    justifyContent: "center"
  },
  calloutView: {
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 10,
    flexDirection: "row",
    backgroundColor: "transparent",
    borderColor: "grey",
    borderWidth: 0.5,
    borderRadius: 10,
    width: 300
  },
  calloutSearch: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: "grey",
    marginLeft: 10,
    width: 350,
    marginRight: 10,
    height: 40,
    borderWidth: 0.0
  },
  picker: {
    width: 50,
    height: 40
  },
  formPicker: {
    width: 280,
    height: 30
  }
});
