import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, firebaseAuth } from "./config/firebase";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';

export default function Login({ status, canResetPassword }) {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser || '');
          
          if (currentUser) {
            router.replace('/GameLobby');
          }
        });
        return () => unsubscribe();
      }, []);

    useEffect(() => {
        return () => {
            setPassword('');
        };
    }, []);

    useEffect(() => {
        if (user) {
            router.replace('/20');
        }
    }, []);

    const validate = () => {
        const errors = {};
        if (!email) {
            errors.email = 'Email is required';
        }
        if (!password) {
            errors.password = 'Password is required';
        }
        return errors;
    };

    const onSubmit = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User logged in successfully:', userCredential);
                // Redirect or perform actions after successful login
                setIsSubmitting(false);
            })
            .catch((error) => {
                console.error('Error logging in:', error);
                setIsSubmitting(false);
            });
    };

    const submitWithGoogle = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Google sign-in failed:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log in</Text>

            {status && <Text style={styles.status}>{status}</Text>}

            <View style={styles.formContainer}>
                <TouchableOpacity onPress={submitWithGoogle} style={styles.googleButton}>
                    <Text style={styles.googleButtonText}>Log in with Gmail</Text>
                </TouchableOpacity>

                <Text style={styles.orText}>Or with mail</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <View style={styles.checkboxContainer}>
                    <Checkbox
                        value={remember}
                        onValueChange={setRemember}
                        color={remember ? '#6A0DAD' : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>

                {canResetPassword && (
                    <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
                        <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={onSubmit} style={styles.loginButton} disabled={isSubmitting}>
                    <Text style={styles.loginButtonText}>Log in</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 16,
    },
    status: {
        color: 'green',
        marginBottom: 16,
    },
    formContainer: {
        width: '100%',
    },
    googleButton: {
        backgroundColor: '#6A0DAD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    googleButtonText: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    orText: {
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#333',
        color: '#FFD700',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    errorText: {
        color: 'red',
        marginBottom: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxLabel: {
        color: '#FFD700',
        marginLeft: 8,
    },
    forgotPasswordText: {
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 16,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: '#6A0DAD',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
});
