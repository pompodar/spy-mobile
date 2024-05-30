import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth as firebaseAuth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { router } from 'expo-router';
import { useGlobalSearchParams } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
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

function GameScreen({ navigation }) {
  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [user, setUser] = useState(null);

  const { gameId, gameCode } = useGlobalSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser || '');
      // Fetch players for the current game
      const fetchData = async () => {
          try {
              const response = await axios.get(`https://spy.blobsandtrees.online/api/game/${gameId}/${currentUser?.email}/players`);

                if (!response.data.players.some(item => item.email === currentUser?.email)) {
                    alert(`User left the game. Redirecting to home screen...`);

                    router.replace("/");

                    return;

                }

                console.log(response);
                setPlayers(response.data.players);
                setRound(response.data.round);

          } catch (error) {
              console.error('Error fetching players:', error);
              router.replace("/");

          }
      };

      const fetchAdmin = async () => {
        try {
            const response = await axios.get(`https://spy.blobsandtrees.online/api/game/${currentUser?.email}/admin`);
  
            setAdmin(response.data);

            console.log(admin);
        } catch (error) {
            console.error('Error fetching players:', error);
        }
      };
  
      fetchAdmin();

      const q = query(collection(db, 'gameRooms'))
      onSnapshot(q, (querySnapshot) => {
        fetchData();
      })

      fetchData();
  
    });
    return () => unsubscribe();
  }, []);

  const startNewRound = async () => {
        userEmail = user?.email || "";

        try {
            const response = await axios.post(`https://spy.blobsandtrees.online/api/games/${gameId}/${userEmail}/${round + 1}/rounds`);
            setPlayers(response.data.players);

            console.log(response);
            setRound(round + 1);

            try {
            // Get the reference to the game document
            const gameDocRef = doc(db, "gameRooms", gameId);
            
            // Update the game document with the updated players array
            await updateDoc(gameDocRef, {
                round: round + 1,
            });

            } catch (err) {
            console.error('Error setting round for game:', err);
            }

            setRound(round + 1);
        } catch (error) {
            console.error('Error starting new round:', error);
        }
    };

    const leaveGame = async () => {
        userEmail = user?.email || "";

        try {
              await axios.delete(`https://spy.blobsandtrees.online/api/game/${gameId}/${userEmail}/leave`);
    
              try {
                // Get the reference to the game document
                const gameDocRef = doc(db, "gameRooms", gameId);
                
                // Get the current data of the game document
                const gameDocSnap = await getDoc(gameDocRef);
                if (gameDocSnap.exists()) {
                  // Extract the current players array
                  const currentPlayers = gameDocSnap.data().players || [];
              
                  // Check if the player to remove exists in the players array
                  const playerIndex = currentPlayers.indexOf(userEmail);
                  if (playerIndex !== -1) {
                    // Remove the player from the players array
                    const updatedPlayers = [...currentPlayers.slice(0, playerIndex), ...currentPlayers.slice(playerIndex + 1)];
              
                    // Update the game document with the updated players array
                    await updateDoc(gameDocRef, {
                      players: updatedPlayers,
                    });
              
                    console.log('Player removed from the game successfully');
              
                    // Check if there are no more players in the game
                    if (updatedPlayers.length === 0) {
                      // Delete the game document
                      await deleteDoc(gameDocRef);
                      console.log('Game document deleted as there are no more players');
                    }
                  } else {
                    console.log('Player does not exist in the game');
                  }
                } else {
                  console.error('Game document does not exist');
                }
              } catch (err) {
                console.error('Error removing player from game:', err);
              }
              
    
              router.replace("/");
    
            } catch (error) {
              console.error('Error leaving game:', error);
          }
      };    
  
  return (
      <LinearGradient
        colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
        >
        <Text style={styles.gameText}>Game Code: {gameCode}</Text>

        <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />

        <Text style={styles.gameTextRound}>Round: {round}</Text>

        {(admin.isAdmin && players.length > 2) &&
            <TouchableOpacity
                onPress={() => startNewRound()}
            >
              <Text style={styles.gameText}>
                new round
              </Text>
            </TouchableOpacity>
          }

            <TouchableOpacity
                style={{backgroundColor: 'rgb(239 68 68)', padding: 10, paddingHorizontal: 20, borderRadius: 10}}
                onPress={() => leaveGame()}
            >
              
                  <AntDesign name="poweroff" size={16} color="white" />

            </TouchableOpacity>

        {players.length > 0 && players.map(player => (
                <div key={player.id} className="">
                <h2 style={styles.gameText}>{player.name} {player.role === 'administrator' && <span style={{color: "rgb(167 233 230) "}}>(Admin)</span>}</h2>
                <p style={styles.gameText}>{player.location}</p>
                </div>
            ))}
    </LinearGradient>
  );
}


export default function App() {
  return (
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
                name="Game" component={GameScreen}
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
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'linear-gradient(90deg, rgba(68,58,85,1) 0%, rgba(136,51,81,1) 100%)',
  },
  authenticatedContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  guestContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: '50%',
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
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    backgroundColor: 'transparent',
  },
  gameText: {
    color: '#FFD700',
    fontSize: 18,
    marginBottom: 16,
  },

  gameTextRound: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 16,
  },
});
