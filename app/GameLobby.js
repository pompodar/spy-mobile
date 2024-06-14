import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth as firebaseAuth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import axios from 'axios';
import {
  collection,
  query, 
  orderBy, 
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";

const Stack = createStackNavigator();

function GameLobbyScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [joinGameCode, setJoinGameCode] = useState('');
  const [createGameError, setCreateGameError] = useState(null);
  const [networkError, setNetworkError] = useState(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUserEmail(currentUser?.email || '');  
    });

    return () => unsubscribe();
  }, []);

  const handleNewGameSubmit = async () => {
    try {
      const response = await axios.post(`https://spy.blobsandtrees.online/api/create-game/${userEmail}`);
      
      setCreateGameError(null);

      const gameId = response.data.gameId.toString();

      try {
        await setDoc(doc(db, "gameRooms", gameId), {
          players: [userEmail],
        });
        console.log('Game added to Firestore successfully');
      } catch (err) {
        console.error('Error adding game to Firestore:', err);
      }

      setNetworkError(null);

      router.push('/Game?gameId=' + response.data.gameId + '&gameCode=' + response.data.gameCode);
    } catch (error) {
      if (error.response) {
        setCreateGameError(error.response.data.game_code);
      } else {
        setNetworkError("Sorry, something went wrong. There might be issues with your Internet connection.");
      }
    }
  };

  const handleJoinGameSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('https://spy.blobsandtrees.online/api/join-game', { gameCode: joinGameCode ? joinGameCode : createGameError ? createGameError : "", userEmail });
      
      console.log('Join game response:', response.data);
      
      setJoinGameCode('');
      
      const gameDocRef = doc(db, "gameRooms", response.data.gameId.toString());
      
      try {
        const gameDocSnap = await getDoc(gameDocRef);
        if (gameDocSnap.exists()) {
          const currentPlayers = gameDocSnap.data().players || [];
      
          if (!currentPlayers.includes(userEmail)) {
            const updatedPlayers = [...currentPlayers, userEmail];
      
            await updateDoc(gameDocRef, {
              players: updatedPlayers,
            });
      
            console.log('User added to the game successfully');
          } else {
            console.log('User already exists in the game');
          }
        } else {
          console.error('Game document does not exist');
        }
      } catch (err) {
        console.error('Error updating game document:', err);
      }

      setNetworkError(null);

      router.push('/Game?gameId=' + response.data.gameId + '&gameCode=' + response.data.gameCode);
    } catch (error) {
      if (!error.response) {
        setNetworkError("Sorry, something went wrong. There might be issues with your Internet connection.");
      }
      console.error('Error joining game:', error.response.data);
    }
  };

  return (
    <LinearGradient
        colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
    >
      {userEmail ? (
        <View style={styles.authenticatedContainer}>
          <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />
          {!createGameError &&
          <TouchableOpacity onPress={handleNewGameSubmit}>
            <LinearGradient
                colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.container}
            >
              <Text style={styles.buttonText}>Create New Game</Text>
            </LinearGradient>
          </TouchableOpacity>
          }
          {createGameError && 
          <TouchableOpacity onPress={handleJoinGameSubmit}>
            <LinearGradient
                colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.container}
            >
              <Text style={styles.buttonText}>Join Game {createGameError}</Text>
            </LinearGradient>
          </TouchableOpacity>
          }
          {!createGameError &&
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Game Code:</Text>
              <TextInput
                style={styles.input}
                value={joinGameCode}
                onChangeText={setJoinGameCode}
              />
            </View>
            <TouchableOpacity onPress={handleJoinGameSubmit}>
              <LinearGradient
                  colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.container}
              >
                <Text style={styles.buttonText}>Join Game</Text>
              </LinearGradient>
            </TouchableOpacity>
            {networkError && 
              <p style={{color: "red"}}>{networkError}</p>
            }
          </>   
          }
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />
          <Text style={styles.text}>Please, log in.</Text>
        </View>
      )}
    </LinearGradient>  
  );
}

export default function App() {
  return (
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="GameLobby">
          <Stack.Screen
                name="GameLobby" component={GameLobbyScreen}
                options={{
                  headerShown: false
                }}
            />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  authenticatedContainer: {
    alignItems: 'center',
  },
  guestContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  logo: {
    width: 146,
    height: 146,
    marginBottom: 16,
    borderRadius: '50%',
  },
  button: {
    backgroundColor: '#6A0DAD',
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    width: '60%',
    padding: 8,
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 4,
    color: '#FFD700',
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  text: {
    color: '#FFD700',
    marginBottom: 8,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  gameText: {
    color: '#FFD700',
    fontSize: 18,
    marginBottom: 16,
  },
});
