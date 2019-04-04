import React from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  Image,
  ImageBackground,
  KeyboardAvoidingView
} from "react-native";
import * as Joi from "react-native-joi";
import { SecureStore } from "expo";

export class SignInScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    disabled: true,
    user: {
      username: "",
      password: ""
    },
    error: {
      username: "",
      password: ""
    }
  };
  schema = {
    username: Joi.string()
      .min(2)
      .required(),
    password: Joi.string()
      .min(8)
      .required()
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
        if (!this.state.user.username || !this.state.user.password) {
          this.setState({ disabled: true });
          return;
        }
        this.setState({ disabled: false });
      }
    });
  };
  _Register = async () => {
    this.props.navigation.navigate("Register");
  };

  handleOnChange = (text, fieldName) => {
    const copy = { ...this.state.user };
    copy[fieldName] = text;
    this.setState({ user: copy });
    this.validateField(fieldName, text);
  };
  render() {
    return (
      <ImageBackground
        source={require("../assets/images/auth.png")}
        style={{ width: "100%", height: "100%" }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled>
          <View style={{ marginTop: 20 }}>
            <Image
              style={styles.image}
              source={require("../assets/images/logo.png")}
            />
            <View>
              <Text
                style={
                  this.state.error.username
                    ? styles.formLabelRed
                    : styles.formLabel
                }>
                {this.state.error.username
                  ? `${this.state.error.username}`
                  : "Username:"}
              </Text>
              <View
                style={
                  this.state.error.username
                    ? styles.formfieldRed
                    : styles.formfield
                }>
                <TextInput
                  numberOfLines={1}
                  style={styles.text}
                  onChangeText={text => this.handleOnChange(text, "username")}
                  placeholder={"Username"}
                />
              </View>
            </View>

            <View>
              <Text
                style={
                  this.state.error.password
                    ? styles.formLabelRed
                    : styles.formLabel
                }>
                {this.state.error.password
                  ? `${this.state.error.password}`
                  : "Password:"}
              </Text>
              <View
                style={
                  this.state.error.password
                    ? styles.formfieldRed
                    : styles.formfield
                }>
                <TextInput
                  numberOfLines={1}
                  style={styles.text}
                  onChangeText={text => this.handleOnChange(text, "password")}
                  placeholder={"Password (min 8 characters)"}
                />
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <TouchableHighlight
              disabled={this.state.disabled}
              style={
                this.state.disabled
                  ? styles.buttonDisabled
                  : styles.buttonYellow
              }
              onPress={this._signInAsync}>
              <Text style={styles.padTop}>Sign in</Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this._Register}>
              <Text style={styles.padTopAndBottom}>Register an account</Text>
            </TouchableHighlight>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  _signInAsync = async () => {
    try {
      let user = await fetch("https://foodnotes-api.herokuapp.com/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.state.user)
      });
      let responseJson = await user.json();
      if (!responseJson) {
        throw new Error(responseJson);
      }
      await SecureStore.setItemAsync("Bearer", responseJson.token);
      this.props.navigation.navigate("App");
    } catch (error) {
      alert("Username/Password wrong. Please try again.");
    }
  };
}

export class RegisterScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    disabled: true,
    user: {
      username: "",
      password: "",
      passwordMatch: ""
    },
    error: {
      username: "",
      password: "",
      passwordMatch: ""
    }
  };
  schema = {
    username: Joi.string()
      .min(2)
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    passwordMatch: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .options({
        language: {
          any: {
            allowOnly: "!!Passwords do not match"
          }
        }
      })
  };

  validateField = (fieldName, value) => {
    const schema = { [fieldName]: this.schema[fieldName] };
    Joi.validate({ [fieldName]: value }, schema, err => {
      const error = { ...this.state.error };
      if (err) {
        error[fieldName] = err.details[0].message;
        this.setState({ error });
        this.setState({ disabled: true });
        return;
      } else {
        error[fieldName] = "";
        this.setState({ error });
        if (!this.state.user.username || !this.state.user.password) {
          this.setState({ disabled: true });
          return;
        }
        this.setState({ disabled: false });
      }
    });
  };

  handleOnChange = (text, fieldName) => {
    const copy = { ...this.state.user };
    copy[fieldName] = text;
    this.setState({ user: copy });
    this.validateField(fieldName, text);
  };

  _Login = async () => {
    this.props.navigation.navigate("Auth");
  };

  render() {
    return (
      <ImageBackground
        source={require("../assets/images/auth.png")}
        style={{ width: "100%", height: "100%" }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled>
          <View style={{ marginTop: 20 }}>
            <Image
              style={styles.image}
              source={require("../assets/images/logo.png")}
            />
            <View>
              <Text
                style={
                  this.state.error.username
                    ? styles.formLabelRed
                    : styles.formLabel
                }>
                {this.state.error.username
                  ? `${this.state.error.username}`
                  : "Username:"}
              </Text>
              <View
                style={
                  this.state.error.username
                    ? styles.formfieldRed
                    : styles.formfield
                }>
                <TextInput
                  numberOfLines={1}
                  style={styles.text}
                  onChangeText={text => this.handleOnChange(text, "username")}
                  placeholder={"Username"}
                />
              </View>
            </View>

            <View>
              <Text
                style={
                  this.state.error.password
                    ? styles.formLabelRed
                    : styles.formLabel
                }>
                {this.state.error.password
                  ? `${this.state.error.password}`
                  : "Password:"}
              </Text>
              <View
                style={
                  this.state.error.password
                    ? styles.formfieldRed
                    : styles.formfield
                }>
                <TextInput
                  numberOfLines={1}
                  style={styles.text}
                  onChangeText={text => this.handleOnChange(text, "password")}
                  placeholder={"Password (min 8 characters)"}
                />
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <TouchableHighlight
              disabled={this.state.disabled}
              style={
                this.state.disabled
                  ? styles.buttonDisabled
                  : styles.buttonYellow
              }
              onPress={this._registerAsync}>
              <Text style={styles.padTop}>Register</Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this._Login}>
              <Text style={styles.padTopAndBottom}>Log in instead</Text>
            </TouchableHighlight>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  _registerAsync = async () => {
    try {
      let user = await fetch("https://foodnotes-api.herokuapp.com/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.state.user)
      });
      let responseJson = await user.json();
      if (!responseJson) {
        throw new Error(responseJson);
      }
      await SecureStore.setItemAsync("Bearer", responseJson.token);
      this.props.navigation.navigate("App");
    } catch (error) {
      alert("Username exists. Please Try Again.");
    }
  };
}

export class AuthLoadingScreen extends React.Component {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await SecureStore.getItemAsync("Bearer");

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(userToken ? "App" : "Auth");
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
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
  image: {
    marginTop: 20,
    width: 200,
    height: 250,
    resizeMode: "contain",
    alignSelf: "center"
  },
  titleText: {
    fontSize: 30,
    alignSelf: "center",
    fontWeight: "bold",
    maxWidth: 300
  },
  padTopAndBottom: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold"
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
  padTop: {
    alignSelf: "center",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold"
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
    color: "red",
    maxWidth: 250
  },
  formfield: {
    borderColor: "grey",
    borderWidth: 0.5,
    flexDirection: "row",
    padding: 5,
    paddingLeft: 20,
    borderRadius: 10,
    marginLeft: 10,
    width: 250,
    marginRight: 10,
    marginTop: 20,
    backgroundColor: "#fff"
  },
  formfieldRed: {
    borderColor: "red",
    borderWidth: 0.7,
    flexDirection: "row",
    padding: 5,
    paddingLeft: 20,
    borderRadius: 10,
    marginLeft: 10,
    width: 250,
    marginRight: 10,
    marginTop: 20,
    backgroundColor: "#fff"
  },
  text: { fontSize: 16 }
});
