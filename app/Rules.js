import { Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function Rules() {
    return (
        <LinearGradient
            colors={['rgba(68,58,85,1)', 'rgba(136,51,81,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <ScrollView>
                <Image style={styles.logo} source={require('../assets/android-chrome-512x512.png')} />
                <Text style={styles.textTitle}>Game background:</Text>
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
            </ScrollView>
        </LinearGradient>
    );
}

export default function App() {
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName="Welcome">
                <Stack.Screen
                    name="Rules" component={Rules}
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
        backgroundColor: 'linear-gradient(90deg, rgba(68, 58, 85, 1) 0%, rgba(136, 51, 81, 1) 100%)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 146,
        height: 146,
        marginBottom: 16,
        alignSelf: 'center',
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
        textAlign: 'center',
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
    rulesButton: {
        backgroundColor: '#FFD700',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    rulesButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#000',
        padding: 20,
        borderRadius: 8,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFD700',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

