import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth as firebaseAuth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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

function WelcomeScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [newGameCode, setNewGameCode] = useState('');
  const [round, setRound] = useState(0);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [createGameError, setCreateGameError] = useState(null);

  const [players, setPlayers] = useState([]);

  let email = "";


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUserEmail(currentUser?.email || '');

      // Fetch players for the current game
      const fetchPlayers = async () => {
          try {
              const response = await axios.get(`https://spy.blobsandtrees.online/api/game/${joinGameCode}/${userEmail}/players`);

              console.log(response);
              setPlayers(response.data.players);
          } catch (error) {
              console.error('Error fetching players:', error);
          }
      };

      // Fetch round for the current game
      const fetchRound = async () => {
        try {
            const response = await axios.post(`https://spy.blobsandtrees.online/api/round/${joinGameCode}/${userEmail}`);
            if (!response.data.round) {
              //setRound(0);
            } else {
              setRound(response.data.round);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    };

      const q = query(collection(db, 'gameRooms'))
      onSnapshot(q, (querySnapshot) => {
        fetchPlayers();
        fetchRound();
      })

    email = currentUser?.email || "";

    fetchPlayers();

    fetchRound();

  
    });
    return () => unsubscribe();
  }, []);

  const handleNewGameSubmit = async () => {
    try {
      const response = await axios.post(`https://spy.blobsandtrees.online/api/create-game/${userEmail}`);
      setNewGameCode(response.data.gameId);
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
      
      router.replace('/Game?gameId=' + response.data.gameId + '&gameCode=' + response.data.gameCode);

    } catch (error) {
      setCreateGameError(error.response.data.error + ". Your game code is " + error.response.data.game_code);
    }
  };

  const handleJoinGameSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send request to backend to join the game
      const response = await axios.post('https://spy.blobsandtrees.online/api/join-game', { gameCode: joinGameCode, userEmail });

      console.log('Join game response:', response.data);
      // Reset the input field after successful submission
      setJoinGameCode('');

      const gameDocRef = doc(db, "gameRooms", response.data.gameId.toString());

      try {
        // Get the current data of the game document
        const gameDocSnap = await getDoc(gameDocRef);
        if (gameDocSnap.exists()) {
          
          // Extract the current players array
          const currentPlayers = gameDocSnap.data().players || [];
      
          // Check if the user is already in the players array
          if (!currentPlayers.includes(userEmail)) {
            // Add the new user to the players array
            const updatedPlayers = [...currentPlayers, userEmail];
      
            // Update the game document with the new players array
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
      // Redirect to the game window
      router.replace('/Game?gameId=' + response.data.gameId + '&gameCode=' + response.data.gameCode);
    } catch (error) {
      // Handle error if joining game fails
      console.error('Error joining game:', error.response.data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userEmail ? (
        <View style={styles.authenticatedContainer}>
          <Text style={styles.title}>Welcome to Spy!</Text>
          <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />
          <TouchableOpacity style={styles.button} onPress={handleNewGameSubmit}>
            <Text style={styles.buttonText}>Create New Game</Text>
          </TouchableOpacity>
          {createGameError && <Text style={styles.errorText}>{createGameError}</Text>}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Game Code:</Text>
            <TextInput
              style={styles.input}
              value={joinGameCode}
              onChangeText={setJoinGameCode}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleJoinGameSubmit}>
            <Text style={styles.buttonText}>Join Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <Text style={styles.title}>Welcome to Spy!</Text>
          <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />
          <Text style={styles.text}>Game background:</Text>
          <Text style={styles.text}>You're an FBI detective.</Text>
          <Text style={styles.text}>Problem: someone in your department is an enemy spy.</Text>
          <Text style={styles.text}>Your full department has been brought in. You must question each other to discover the spy.</Text>
          <Text style={styles.text}>What you need to play:</Text>
          <Text style={styles.text}>3-12 people.</Text>
          <Text style={styles.text}>All in same room or same call</Text>
          <Text style={styles.text}>Each has their own phone, computer, or tablet.</Text>
          <Text style={styles.text}>Game objectives:</Text>
          <Text style={styles.text}>The spy: try to guess the round's location. Infer from others' questions and answers.</Text>
          <Text style={styles.text}>Other players: figure out who the spy is.</Text>
          <Text style={styles.text}>Round length: 6-10 minutes. Shorter for smaller groups, longer for larger.</Text>
          <Text style={styles.text}>The location: round starts, each player is given a location. The location is the same for all players (e.g., the bank) except for one player, who is randomly the "spy". The spy does not know the round's location.</Text>
          <Text style={styles.text}>Questioning: the game leader (person who started the game) begins by questioning another player about the location. Example: ("is this a place where children are welcome?").</Text>
          <Text style={styles.text}>Answering: the questioned player must answer. No follow up questions allowed. After they answer, it's then their turn to ask someone else a question. This continues until round is over.</Text>
          <Text style={styles.text}>No retaliation questions: if someone asked you a question for their turn, you cannot then immediately ask them a question back for your turn. You must choose someone else.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function GameScreen({ route }) {
  const { gameId, gameCode, players, round } = route.params;

  return (
    <View style={styles.gameContainer}>
      <Text style={styles.gameText}>Game Code: {gameCode}</Text>
      <Text style={styles.gameText}>Round: {round}</Text>

      {players.length > 0 && players.map(player => (
            <div key={player.id} className="">
              <h2 style={styles.gameText}>{player.name} {player.role === 'administrator' && <span className="text-sm text-brightgreen">(Admin)</span>}</h2>
              <p style={styles.gameText}>{player.location}</p>
            </div>
          ))}
    </View>
  );
}

export default function App() {
  return (
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
                name="Welcome" component={WelcomeScreen}
                options={{
                  headerShown: false
                }}
            />
          <Stack.Screen name="Game" component={GameScreen} />
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
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6A0DAD',
    padding: 12,
    borderRadius: 8,
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
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 8,
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 8,
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
