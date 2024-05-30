import { Stack, Link, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { ImageBackground, View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import DropDownPicker from "react-native-dropdown-picker";

export default function Home() {
    const [openFirst, setOpenFirst] = useState(false);
    const [valueFirst, setValueFirst] = useState(null);
    const [itemsFirst, setItemsFirst] = useState([
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
    ]);

    const [openSecond, setOpenSecond] = useState(false);
    const [valueSecond, setValueSecond] = useState(null);
    const [itemsSecond, setItemsSecond] = useState([
        { label: "Potato", value: "potato" },
        { label: "Carrot", value: "Carrot" },
    ]);

    const [openThird, setOpenThird] = useState(false);
    const [valueThird, setValueThird] = useState(null);
    const [itemsThird, setItemsThird] = useState([
        { label: "Sunflower", value: "sunflower" },
        { label: "Lily", value: "lily" },
    ]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        {
            label: "16",
            value: "/16?words=3",
        },
        { label: "20", value: "/20" },
        // { label: "за картинкою", value: "/construct-words-pic" },
    ]);

    const [open2, setOpen2] = useState(false);
    const [value2, setValue2] = useState(null);
    const [items2, setItems2] = useState([
        {
            label: "stable",
            value: "/stable",
        },
        {
            label: "alignSelf",
            value: "/alignSelf",
        },
        { label: "18", value: "/18" },
    ]);


    return (
        <View style={{ width: "100%", height: "100%" }}>
            <Stack.Screen
                options={{
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    headerTitle: "In The Know",
                }}
            />
            <ImageBackground
                style={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                source={require("../assets/background.jpg")}
                resizeMode="cover"
            >
                <View
                    style={{
                        width: 150,
                    }}
                >
                    <DropDownPicker
                        open={open2}
                        placeholder="Test It"
                        value={value2}
                        items={items2}
                        labelStyle={{
                            color: "#ff5722",
                            fontWeight: "bold",
                        }}
                        placeholderStyle={{
                            color: "#ff5722",
                            fontWeight: "bold",
                        }}
                        listItemLabelStyle={{
                            color: "#ff5722",
                            fontWeight: "bold",
                        }}
                        modalTitleStyle={{
                            fontWeight: "bold",
                        }}
                        setOpen={setOpen2}
                        setValue={setValue2}
                        setItems={setItems2}
                        onChangeValue={(value) => {
                            router.push(value);
                        }}
                        zIndex={2000}
                        zIndexInverse={4000}
                    />
                    <View style={{ margin: 4 }} />
                    <DropDownPicker
                        open={open}
                        placeholder="Browse"
                        value={value}
                        items={items}
                        labelStyle={{
                            color: "#ff5722",
                            fontWeight: "bold",
                        }}
                        placeholderStyle={{
                            color: "#ff5722",
                            fontWeight: "bold",
                        }}
                        listItemLabelStyle={{
                            color: "#ff5722",
                            fontWeight: "bold",
                        }}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        onChangeValue={(value) => {
                            router.push(value);
                        }}
                        zIndex={1000}
                        zIndexInverse={3000}
                    />
                    <StatusBar hidden />
                </View>
            </ImageBackground>
        </View>
    );
}
