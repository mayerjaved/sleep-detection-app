import { StyleSheet, Text, View, Button } from "react-native";
import React, { useState, useEffect } from "react";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { Audio } from "expo-av";

let sub;

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(); //for storing camera permission
  const [faceData, setFaceData] = React.useState([]); //in this state we are storing user face expressions
  const [sound, setSound] = React.useState();
  const [eyesShut, setEyesShut] = useState(false);

  React.useEffect(() => { //this piece of code runs first time when project start
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted"); 
    })();
  }, []);

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  async function playSound() { //this function used to play the sound
    const { sound } = await Audio.Sound.createAsync( // javascript promise  to await if whole 
      require("./assets/alarm.mp3")
    );
    setSound(sound); // we are  storing sound to remove this listner after the screen unmount

    await sound.playAsync(); //this functions runs the sound
  }

  React.useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleFacesDetected = ({ faces }) => {
    setFaceData(faces); // we are storing data to show faces detail on screen
    console.log(faces);
    const eyesShut = faces?.[0]?.rightEyeOpenProbability < 0.7 && faces?.[0]?.leftEyeOpenProbability < 0.7; 
    setEyesShut(eyesShut) // here we store the current eyer status
  };

  //this is the main useEffect which play sound after every 1000
  // it runs when the status of evesShut changes.
  useEffect(() => {
    if(eyesShut){
      sub = setInterval(() => { //we give setInterval 2 things one is interval and other is function which runs after the interval so according to our logic sound player after the interval we have given
        playSound()
      }, 1000);
    }else{
      clearInterval(sub) // if eyesshut becomes false we will cancel the interval which is going to plays sound after certain interval
    }

  }, [eyesShut])


  
  return (
    <Camera
      type={Camera.Constants.Type.front}
      style={styles.camera}
      onFacesDetected={handleFacesDetected} // this is the main function which detect the user face
      faceDetectorSettings={{
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.all,
        minDetectionInterval: 100,
        tracking: true,
      }}
    >
      {faceData.length != 0 ? (
        
        <View style={styles.faces} index={faceData?.[0].faceID}>
          <Text style={styles.faceDesc}>
            Right Eye: {faceData?.[0]?.rightEyeOpenProbability?.toFixed(2)}
          </Text>
          <Text style={styles.faceDesc}>
            Left Eye: {faceData?.[0]?.leftEyeOpenProbability?.toFixed(2)}{" "}
          </Text>
          <Text style={styles.faceDesc}>
            Eyes Shut: {eyesShut.toString()}
          </Text>
          <Text style={styles.faceDesc}>
            RightEye X: {faceData?.[0]?.RIGHT_EYE?.x?.toFixed(2)}{" "}
            RightEye Y: {faceData?.[0]?.RIGHT_EYE?.y?.toFixed(2)}{" "}
          </Text>
          <Button title="Çal" onPress={playSound} />
        </View>
      ) : (
        <View style={styles.faces}>
          <Text style={styles.faceDesc}>No face</Text>
        </View>
      )}
    </Camera>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  faces: {
    backgroundColor: "#ffffff",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  faceDesc: {
    fontSize: 20,
  },
});
