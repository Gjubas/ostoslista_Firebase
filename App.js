import firebase from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default function App() {
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [shoppingList, setShoppingList] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        loadShoppingList();
      }
    });

    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    if (productName && amount) {
      try {
        await db.collection("items").add({
          name: productName,
          amount: amount,
        });
        setProductName("");
        setAmount("");
        loadShoppingList();
      } catch (error) {
        console.error("Error adding item: ", error);
      }
    }
  };

  const loadShoppingList = async () => {
    try {
      const itemsSnapshot = await db.collection("items").get();
      const items = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShoppingList(items);
    } catch (error) {
      console.error("Error loading shopping list: ", error);
    }
  };

  const removeItem = async (id) => {
    try {
      await db.collection("items").doc(id).delete();
      loadShoppingList();
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Shopping List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Product"
          value={productName}
          onChangeText={(text) => setProductName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={(text) => setAmount(text)}
        />
        <Button title="Save" onPress={addItem} />
      </View>

      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItems}>
            <Text style={styles.listItem}>{item.name}</Text>
            <Text style={styles.listItem}>{item.amount}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.deleteButton}>Bought</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  heading: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "75%",
  },
  input: {
    height: 35,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  listItems: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  listItem: {
    marginLeft: 5,
    marginRight: 5,
  },
  deleteButton: {
    color: "red",
    marginLeft: 10,
  },
});
