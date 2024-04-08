import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { auth, db, storage } from '../config/firebase'; 
import { collection, DocumentData, getDocs, deleteDoc, doc, setDoc, addDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage'; // Import required functions for Firebase Storage

const DocumentScreen: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [documentName, setDocumentName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const navigation = useNavigation();

  const fetchUserDocuments = async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const documentsRef = collection(db, 'users', userId, 'userDocuments');
        const snapshot = await getDocs(documentsRef);
        const userDocuments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(userDocuments);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  };

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const renderDocumentItem = ({ item }: { item: DocumentData }) => (
    <View style={styles.documentItem}>
      <Text>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDocumentDownload(item)}>
        <Text>Descargar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDocumentDelete(item)}>
        <Text>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDocumentUpload = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No hay usuario autenticado.');
      }

      const userId = auth.currentUser.uid;
      const userDocumentsRef = collection(db, 'users', userId, 'userDocuments');

      const userDocumentsSnapshot = await getDocs(userDocumentsRef);
      if (userDocumentsSnapshot.empty) {
        await setDoc(doc(userDocumentsRef, 'placeholderDocument'), { placeholder: true });
      }

      if (!documentName) {
        alert('Por favor, introduce un nombre para el documento.');
        return;
      }

      if (!selectedFile) {
        alert('Por favor, selecciona un archivo.');
        return;
      }

      const fileName = selectedFile.name;
      const fileUri = selectedFile.uri;

      // Reference to the Firebase Storage location
      const storageRef = ref(storage, `documents/${fileName}`);

      // Upload the file to Firebase Storage
      const uploadTask = await uploadBytes(storageRef, fileUri);

      // Get the download URL of the uploaded file
      const downloadUrl = await getDownloadURL(storageRef);

      // Save metadata in Firestore
      await addDoc(userDocumentsRef, { name: documentName, url: downloadUrl });

      // Clear the state after successful upload
      setSelectedFile(null);
      setDocumentName('');
      alert('Documento subido con éxito.');
    } catch (error) {
      console.error('Error al subir el documento:', error);
      alert('Ocurrió un error al subir el documento. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const handleDocumentDownload = async (document: DocumentData) => {
    try {
      // Perform the download operation
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      alert('Ocurrió un error al descargar el documento. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const handleDocumentDelete = async (document: DocumentData) => {
    try {
      // Perform the delete operation
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
      alert('Ocurrió un error al eliminar el documento. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const pickDocument = async () => {
    try {
      // Perform the document picking operation
    } catch (err) {
      console.error('Error al seleccionar el documento:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del documento"
        value={documentName}
        onChangeText={text => setDocumentName(text)}
      />
      <Button 
        title="Añadir Documento"
        buttonStyle={styles.buttonNewDocument}
        titleStyle={{ color: '#111822' }}
        onPress={handleDocumentUpload}
      />
      <FlatList
        data={documents}
        renderItem={renderDocumentItem}
        keyExtractor={item => item.id}
      /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonNewDocument: {
    backgroundColor: '#FFA40B',
    width: '100%',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default DocumentScreen;
