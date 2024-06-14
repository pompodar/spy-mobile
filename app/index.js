import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { signInWithGoogle } from "./config/firebase";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { router, Link } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

const Stack = createStackNavigator();

function Login({ status }) {

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                router.push('/GameLobby');
            }
        });
        return () => unsubscribe();
    }, []);

    const submitWithGoogle = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Google sign-in failed:", error);
        }
    };

    return (
        <LinearGradient
            colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <Text style={styles.title}>Welcome to Spy!</Text>
            <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />
            {status && <Text style={styles.status}>{status}</Text>}
            <View style={styles.formContainer}>
                <TouchableOpacity onPress={submitWithGoogle}>
                    <LinearGradient
                        colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.container}
                    >
                        <Text style={styles.googleButtonText}>Log in with Gmail</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <Link style={styles.rulesButtonText} href="/Rules/">Learn the rules</Link>
        </LinearGradient>
    );
}

export default function App() {
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName="Welcome">
                <Stack.Screen
                    name="Login" component={Login}
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 146,
        height: 146,
        marginBottom: 16,
        borderRadius: '50%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 16,
    },
    textTitle: {
        fontSize: 18,
        color: '#FFD700',
        marginBottom: 6,
    },
    text: {
        fontSize: 14,
        alignSelf: 'flex-start',
        fontWeight: 'normal',
        color: '#FFD700',
        marginBottom: 4,
    },
    status: {
        color: 'green',
        marginBottom: 16,
    },
    formContainer: {
        display: "flex",
        padding: 20,
        alignItems: 'center',
    },
    googleButton: {
        backgroundColor: '#6A0DAD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
        width: 'max-content',
    },
    googleButtonText: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    rulesButtonText: {
        color: '#FFD700',
        fontStyle: 'italic',
    },
});

