import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth as firebaseAuth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { router } from 'expo-router';
import { useGlobalSearchParams } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import {
  collection,
  query,
  onSnapshot,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import CustomModal from './CustomModal.js'; // Import your modal component

const Stack = createStackNavigator();

function GameScreen({ navigation }) {
  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [user, setUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { gameId, gameCode } = useGlobalSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser || '');
      // Fetch players for the current game
      const fetchData = async () => {
        try {
          const response = await axios.get(`https://spy.blobsandtrees.online/api/game/${gameId}/${currentUser?.email}/players`);
          if (!response.data.players.some(item => item.email === currentUser?.email)) {
            console.log(`User left the game. Redirecting to home screen...`);
            router.replace("/");
            return;
          }
          setPlayers(response.data.players);
          setRound(response.data.round);
        } catch (error) {
          console.error('Error fetching players:', error);
          alert("hmm");
          router.replace("/");
        }
      };

      const fetchAdmin = async () => {
        try {
          const response = await axios.get(`https://spy.blobsandtrees.online/api/game/${currentUser?.email}/admin`);
          setAdmin(response.data);
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      };

      fetchAdmin();

      const q = query(collection(db, 'gameRooms'));
      onSnapshot(q, (querySnapshot) => {
        fetchData();
      });

      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const startNewRound = async () => {
    const userEmail = user?.email || "";
    try {
      const response = await axios.post(`https://spy.blobsandtrees.online/api/games/${gameId}/${userEmail}/${round + 1}/rounds`);
      setPlayers(response.data.players);
      setRound(round + 1);

      try {
        const gameDocRef = doc(db, "gameRooms", gameId);
        await updateDoc(gameDocRef, {
          round: round + 1,
        });
      } catch (err) {
        console.error('Error setting round for game:', err);
      }
    } catch (error) {
      console.error('Error starting new round:', error);
    }
  };

  const leaveGame = async () => {
    const userEmail = user?.email || "";
    try {
      await axios.delete(`https://spy.blobsandtrees.online/api/game/${gameId}/${userEmail}/leave`);

      try {
        const gameDocRef = doc(db, "gameRooms", gameId);
        const gameDocSnap = await getDoc(gameDocRef);
        if (gameDocSnap.exists()) {
          const currentPlayers = gameDocSnap.data().players || [];
          const playerIndex = currentPlayers.indexOf(userEmail);
          if (playerIndex !== -1) {
            const updatedPlayers = [...currentPlayers.slice(0, playerIndex), ...currentPlayers.slice(playerIndex + 1)];
            await updateDoc(gameDocRef, {
              players: updatedPlayers,
            });
            if (updatedPlayers.length === 0) {
              await deleteDoc(gameDocRef);
            }
          }
        }
      } catch (err) {
        console.error('Error removing player from game:', err);
      }

      router.replace("/");
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  const confirmLeaveGame = () => {
    setIsModalVisible(true);
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

      {players.length < 3 && (
        <Text style={styles.gameTextWaiting}>Waiting for players</Text>
      )}

      <div style={{display: 'flex', gap: 8, flexDirection: 'row', justifyContent:'space-around', marginBottom: 10}}>

        {admin.isAdmin && players.length > 2 && (
          <TouchableOpacity onPress={() => startNewRound()}
              style={{ backgroundColor: '#a7e9e6', padding: 8, paddingHorizontal: 20, borderRadius: 10, marginBottom: 14 }}
          >
            <Entypo name="chevron-with-circle-right" size={20} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{ backgroundColor: 'rgb(239 68 68)', padding: 8, paddingHorizontal: 20, borderRadius: 10, marginBottom: 14 }}
          onPress={confirmLeaveGame}
        >
          <AntDesign name="poweroff" size={16} color="white" />
        </TouchableOpacity>
      
      </div>

      {players.length > 0 && players.map(player => (
        <View key={player.id} style={styles.playerContainer}>
          <Text style={styles.gameText}>{player.name} {player.role === 'administrator' && <Text style={{ color: "rgb(167 233 230)" }}>(Admin)</Text>}</Text>
          <Text style={styles.gameText}>{player.location}</Text>
        </View>
      ))}

      <CustomModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={() => {
          setIsModalVisible(false);
          leaveGame();
        }}
        title="Confirm Leave Game"
        message="Are you sure you want to leave the game? As the admin, leaving will end the game for everyone."
      />
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 16,
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
  gameTextWaiting: {
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  playerContainer: {
    alignItems: 'center',
  },
});
