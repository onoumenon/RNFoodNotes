import React from "react";
import {
  createAppContainer,
  createSwitchNavigator,
  createStackNavigator
} from "react-navigation";

import MainTabNavigator from "./MainTabNavigator";
import {
  SignInScreen,
  AuthLoadingScreen,
  RegisterScreen
} from "./../screens/AuthScreen";
const AuthStack = createStackNavigator({ SignIn: SignInScreen });

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: MainTabNavigator,
      Auth: AuthStack,
      Register: RegisterScreen
    },
    {
      initialRouteName: "AuthLoading"
    }
  )
);
