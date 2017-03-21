import { platformNativeScriptDynamic, NativeScriptModule } from "nativescript-angular/platform";
import { AppModule } from "./app.module";
import firebase = require("nativescript-plugin-firebase");

  firebase.init({
    persist: true,
    onAuthStateChanged: function(data) { // optional but useful to immediately re-logon the user when he re-visits your app
    console.log(data.loggedIn ? "Logged in to firebase" : "Logged out from firebase");
      // if (data.loggedIn) {
      //   this.set("useremail", data.user.email ? data.user.email : "N/A");
      // }
}
});

platformNativeScriptDynamic().bootstrapModule(AppModule);